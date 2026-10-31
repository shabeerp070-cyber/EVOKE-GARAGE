import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('--- Starting BMW Drift Animation Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test Mobile (iPhone 16: 393 x 852)
  console.log('\n=== Testing Mobile (393 x 852) ===');
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  // Check track element
  const trackInfo = await page.evaluate(() => {
    const track = document.getElementById('bmw-drift-track');
    const carImg = track ? track.querySelector('img[src*="bmw-drift"]') : null;
    const path = track ? track.querySelector('path[d^="M"]') : null;
    const carWrapper = track ? track.querySelector('.will-change-transform') : null;
    return {
      hasTrack: !!track,
      hasCarImg: !!carImg,
      hasPath: !!path,
      carSrc: carImg ? carImg.src : null,
      trackTop: track ? track.style.top : null,
      trackHeight: track ? track.style.height : null,
    };
  });
  console.log('Track info:', trackInfo);

  // Measure key DOM landmarks
  const landmarks = await page.evaluate(() => {
    const pillars = document.getElementById('about-pillars');
    const paint = document.getElementById('service-paint-frame');
    const scrollY = window.scrollY;
    return {
      pillarsTop: pillars ? pillars.getBoundingClientRect().top + scrollY : 0,
      paintTop: paint ? paint.getBoundingClientRect().top + scrollY : 0,
      paintBottom: paint ? paint.getBoundingClientRect().bottom + scrollY : 0,
    };
  });
  console.log('Landmarks:', landmarks);

  // We test 6 scroll steps from entry to exit:
  // pillarsTop is ~4100, paintBottom is ~5358.
  // Viewport height is 852.
  // Trigger start is 'top 80%', so when trackTop (~4092) hits 852*0.8 = 681px from top:
  // scrollY start is around 4092 - 681 = ~3411px.
  // Trigger end is 'bottom 25%', so when trackBottom (~5378) hits 852*0.25 = 213px from top:
  // scrollY end is around 5378 - 213 = ~5165px.
  const scrollSteps = [
    { label: '01-start', scrollY: 3450 },
    { label: '02-card01-card02', scrollY: 3750 },
    { label: '03-card02-card03', scrollY: 4100 },
    { label: '04-core-disciplines', scrollY: 4500 },
    { label: '05-paint-photo-enter', scrollY: 4900 },
    { label: '06-paint-photo-exit', scrollY: 5250 },
  ];

  for (const step of scrollSteps) {
    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
      if (window.__ScrollTrigger) window.__ScrollTrigger.update();
    }, step.scrollY);
    await new Promise((r) => setTimeout(r, 400));

    const carStatus = await page.evaluate(() => {
      const track = document.getElementById('bmw-drift-track');
      const car = track ? track.querySelector('div[style*="transformOrigin"]') : null;
      if (!car) return null;
      const rect = car.getBoundingClientRect();
      const style = window.getComputedStyle(car);
      return {
        x: rect.left,
        y: rect.top,
        opacity: style.opacity,
        transform: style.transform,
      };
    });
    console.log(`Scroll step [${step.label}] at scrollY=${step.scrollY}:`, carStatus);

    await page.screenshot({
      path: `scripts/drift-step-${step.label}.png`,
      fullPage: false,
    });
  }

  // Test reverse movement
  console.log('\n--- Testing reverse scroll (scrolling back up) ---');
  await page.evaluate(() => {
    window.scrollTo({ top: 4000, behavior: 'instant' });
    if (window.__ScrollTrigger) window.__ScrollTrigger.update();
  });
  await new Promise((r) => setTimeout(r, 400));
  const reverseStatus = await page.evaluate(() => {
    const track = document.getElementById('bmw-drift-track');
    const car = track ? track.querySelector('div[style*="transformOrigin"]') : null;
    if (!car) return null;
    const rect = car.getBoundingClientRect();
    const style = window.getComputedStyle(car);
    return {
      x: rect.left,
      y: rect.top,
      opacity: style.opacity,
    };
  });
  console.log('Reverse status at scrollY=4000:', reverseStatus);

  // Desktop test
  console.log('\n=== Testing Desktop (1440 x 900) ===');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));

  const desktopLandmarks = await page.evaluate(() => {
    const pillars = document.getElementById('about-pillars');
    const paint = document.getElementById('service-paint-frame');
    const scrollY = window.scrollY;
    return {
      pillarsTop: pillars ? pillars.getBoundingClientRect().top + scrollY : 0,
      paintTop: paint ? paint.getBoundingClientRect().top + scrollY : 0,
      paintBottom: paint ? paint.getBoundingClientRect().bottom + scrollY : 0,
    };
  });
  console.log('Desktop Landmarks:', desktopLandmarks);

  const desktopScrollY = desktopLandmarks.pillarsTop - 200;
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'instant' });
    if (window.__ScrollTrigger) window.__ScrollTrigger.update();
  }, desktopScrollY);
  await new Promise((r) => setTimeout(r, 400));

  await page.screenshot({
    path: `scripts/drift-desktop.png`,
    fullPage: false,
  });

  await browser.close();
  console.log('\n--- BMW Drift Verification Complete ---');
})();

