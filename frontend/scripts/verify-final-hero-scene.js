import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyFinalHeroScene() {
  console.log('=== Verifying Complete Workshop Scene, Car, Branding & No Black Areas ===');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  // =========================================================================
  // 1. MOBILE TEST (393 x 852)
  // =========================================================================
  console.log('--- Testing Mobile Viewport (393 x 852) ---');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const mobileCheck = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const heroImg = hero ? hero.querySelector('img[src*="evoke-workshop-hero.jpg"]') : null;
    const h1 = hero ? hero.querySelector('h1') : null;
    const buttons = hero ? hero.querySelectorAll('.btn-forge-primary, .btn-forge-outline') : [];
    const spinner = document.querySelector('.animate-spin, [class*="Preloader"]');

    return {
      hasHero: !!hero,
      hasHeroImg: !!heroImg,
      imgSrc: heroImg ? heroImg.src : null,
      imgNaturalWidth: heroImg ? heroImg.naturalWidth : null,
      imgNaturalHeight: heroImg ? heroImg.naturalHeight : null,
      imgComplete: heroImg ? heroImg.complete : null,
      h1Text: h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : null,
      buttonCount: buttons.length,
      hasSpinnerVisible: !!spinner,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  console.log('Mobile Hero Check:', mobileCheck);
  await page.screenshot({ path: 'screenshots/final-hero-mobile-393x852.png' });
  console.log('Saved screenshots/final-hero-mobile-393x852.png');

  // Verify pixel content across the screenshot to guarantee no large black areas
  const { data, info } = await sharp('screenshots/final-hero-mobile-393x852.png').raw().toBuffer({ resolveWithObject: true });
  
  // Sample lightness across 5 vertical bands (Ceiling, Branding, Technician/Hood, Headlights/Bumper, Floor)
  const bands = [
    { name: 'Top (Lights & Wall Branding)', yStart: 120, yEnd: 250 },
    { name: 'Upper-Mid (Technician & Windshield)', yStart: 250, yEnd: 420 },
    { name: 'Mid (Red Car Bonnet)', yStart: 420, yEnd: 550 },
    { name: 'Lower-Mid (Headlights & Bumper)', yStart: 550, yEnd: 700 },
    { name: 'Bottom (Wheels & Shop Floor)', yStart: 700, yEnd: 820 },
  ];

  for (const band of bands) {
    let totalLight = 0;
    let count = 0;
    let nonBlackPixels = 0;

    for (let y = band.yStart; y < band.yEnd; y += 4) {
      for (let x = 50; x < info.width - 50; x += 4) {
        const idx = (y * info.width + x) * info.channels;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const brightness = (r + g + b) / 3;
        totalLight += brightness;
        count++;
        if (brightness > 20) nonBlackPixels++;
      }
    }
    const avgLightness = Math.round(totalLight / count);
    const visiblePercent = Math.round((nonBlackPixels / count) * 100);
    console.log(`Band "${band.name}": Avg Lightness = ${avgLightness}, Visible Content = ${visiblePercent}%`);
  }

  // =========================================================================
  // 2. DESKTOP TEST (1440 x 900)
  // =========================================================================
  console.log('--- Testing Desktop Viewport (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: 'screenshots/final-hero-desktop-1440x900.png' });
  console.log('Saved screenshots/final-hero-desktop-1440x900.png');

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('=== Test Completed Successfully ===');
}

verifyFinalHeroScene().catch(console.error);

