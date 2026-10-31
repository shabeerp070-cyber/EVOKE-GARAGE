import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Pinned range: 2333 to 4673 (span = 2340px)
  // Step 1: Front start -> scrollY = 2550 (time ~ 1.1s)
  // Step 2: Front 3/4 widebody -> scrollY = 3000 (time ~ 3.5s)
  // Step 3: Rear profile & GT wing -> scrollY = 3450 (time ~ 5.8s)
  // Step 4: Exhaust ignition flame -> scrollY = 3850 (time ~ 7.9s)
  // Step 5: Forged alloy & widebody flare -> scrollY = 4350 (time ~ 10.5s)

  const steps = [
    { name: 'desktop-step-1-front', y: 2550 },
    { name: 'desktop-step-2-front-detail', y: 3000 },
    { name: 'desktop-step-3-rear', y: 3450 },
    { name: 'desktop-step-4-exhaust-flame', y: 3850 },
    { name: 'desktop-step-5-forged-wheel', y: 4350 },
  ];

  for (const s of steps) {
    await page.evaluate((pos) => {
      window.scrollTo(0, pos);
    }, s.y);
    // Allow GSAP tween to settle smoothly
    await new Promise(r => setTimeout(r, 800));

    const state = await page.evaluate(() => {
      const v = document.querySelector('#cinematic-motion video');
      const timecode = document.querySelector('#cinematic-motion [class*="tabular-nums"]');
      const activeStep = document.querySelector('#cinematic-motion [class*="text-red-500"]');
      return {
        scrollY: window.scrollY,
        videoTime: v ? v.currentTime : null,
        timecode: timecode ? timecode.textContent : null,
      };
    });
    console.log(`Step ${s.name}:`, state);
    await page.screenshot({ path: `screenshots/${s.name}.png` });
  }

  await browser.close();
  console.log('Capture finished successfully.');
}

capture().catch(console.error);
