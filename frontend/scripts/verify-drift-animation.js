import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. DESKTOP (1440 x 900)
  console.log('--- Checking Desktop ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Find exact position of the pillars container
  const desktopCoords = await page.evaluate(() => {
    const grid = document.querySelector('#about .grid');
    const container = grid ? grid.parentElement : null;
    const rect = container ? container.getBoundingClientRect() : null;
    const car = container ? container.querySelector('img[src*="drift-car-red"]') : null;
    return {
      top: rect ? rect.top + window.scrollY : 0,
      height: rect ? rect.height : 0,
      hasCar: !!car,
    };
  });
  console.log('Desktop Coords:', desktopCoords);

  // We want the pillars container to be centered in viewport:
  // viewport height is 900, so scroll to top - (900 - height)/2
  const centerScrollDesktop = desktopCoords.top - 300;

  // Let's capture at scroll positions around the trigger
  // Start is top 90%, end is bottom 15%
  for (let step = 0; step <= 4; step++) {
    // scroll offset from -250px to +250px
    const offset = -200 + step * 120;
    const scrollY = centerScrollDesktop + offset;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
    await new Promise(r => setTimeout(r, 300));
    
    const carPos = await page.evaluate(() => {
      const car = document.querySelector('#about img[src*="drift-car-red"]');
      const wrapper = car ? car.closest('.will-change-transform') : null;
      return {
        wrapperTransform: wrapper ? wrapper.style.transform : null,
      };
    });
    console.log(`Desktop step ${step} (scrollY=${scrollY}):`, carPos);
    await page.screenshot({ path: `scripts/desktop-step-${step}.png` });
  }

  // 2. MOBILE (393 x 852)
  console.log('\n--- Checking Mobile ---');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const mobileCoords = await page.evaluate(() => {
    const grid = document.querySelector('#about .grid');
    const container = grid ? grid.parentElement : null;
    const rect = container ? container.getBoundingClientRect() : null;
    return {
      top: rect ? rect.top + window.scrollY : 0,
      height: rect ? rect.height : 0,
    };
  });
  console.log('Mobile Coords:', mobileCoords);

  const centerScrollMobile = mobileCoords.top - 200;

  for (let step = 0; step <= 4; step++) {
    const offset = -150 + step * 100;
    const scrollY = centerScrollMobile + offset;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
    await new Promise(r => setTimeout(r, 300));

    const carPos = await page.evaluate(() => {
      const car = document.querySelector('#about img[src*="drift-car-red"]');
      const wrapper = car ? car.closest('.will-change-transform') : null;
      return {
        wrapperTransform: wrapper ? wrapper.style.transform : null,
      };
    });
    console.log(`Mobile step ${step} (scrollY=${scrollY}):`, carPos);
    await page.screenshot({ path: `scripts/mobile-step-${step}.png` });
  }

  await browser.close();
}

verify();
