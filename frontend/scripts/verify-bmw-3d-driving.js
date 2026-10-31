import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('--- Starting 3D BMW Driving Animation Live Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test Mobile (iPhone 16: 393 x 852)
  console.log('\n=== Testing Mobile (393 x 852) ===');
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  // Check WebGL Canvas & Track
  const status = await page.evaluate(() => {
    const track = document.getElementById('bmw-drift-track');
    const canvas = track ? track.querySelector('canvas') : null;
    const svgPath = track ? track.querySelector('path[d^="M"]') : null;
    return {
      hasTrack: !!track,
      hasCanvas: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      trackTop: track ? track.style.top : null,
      trackHeight: track ? track.style.height : null,
      hasSvgPath: !!svgPath,
    };
  });
  console.log('Track & WebGL Canvas Status:', status);

  // Landmarks
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

  // Scroll steps along the driving path
  const scrollSteps = [
    { label: '01-start', scrollY: 3500 },
    { label: '02-card01-card02', scrollY: 3800 },
    { label: '03-card02-card03', scrollY: 4150 },
    { label: '04-core-disciplines', scrollY: 4550 },
    { label: '05-paint-photo', scrollY: 4950 },
    { label: '06-paint-exit', scrollY: 5250 },
  ];

  for (const step of scrollSteps) {
    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
      if (window.__ScrollTrigger) window.__ScrollTrigger.update();
    }, step.scrollY);
    await new Promise((r) => setTimeout(r, 400));

    await page.screenshot({
      path: `scripts/3d-drive-${step.label}.png`,
      fullPage: false,
    });
    console.log(`Captured 3d-drive-${step.label}.png at scrollY=${step.scrollY}`);
  }

  // Reverse Scroll Verification (Scrolling back up)
  console.log('\n--- Testing Reverse Scroll Upward ---');
  await page.evaluate(() => {
    window.scrollTo({ top: 3850, behavior: 'instant' });
    if (window.__ScrollTrigger) window.__ScrollTrigger.update();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/3d-drive-reverse-3850.png' });
  console.log('Captured 3d-drive-reverse-3850.png');

  // Desktop Test (1440 x 900)
  console.log('\n=== Testing Desktop (1440 x 900) ===');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1500));

  const desktopLandmarks = await page.evaluate(() => {
    const pillars = document.getElementById('about-pillars');
    const scrollY = window.scrollY;
    return {
      pillarsTop: pillars ? pillars.getBoundingClientRect().top + scrollY : 0,
    };
  });
  console.log('Desktop Pillars Top:', desktopLandmarks.pillarsTop);

  // Scroll to desktop driving sequence
  const desktopScroll = desktopLandmarks.pillarsTop - 150;
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'instant' });
    if (window.__ScrollTrigger) window.__ScrollTrigger.update();
  }, desktopScroll);
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: 'scripts/3d-drive-desktop.png' });
  console.log('Captured 3d-drive-desktop.png');

  await browser.close();
  console.log('\n--- 3D BMW Verification Complete ---');
})();

