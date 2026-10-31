import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyWorkshopHero() {
  console.log('=== Verifying EVOKE GARAGE Workshop Image in Hero Area ===');

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
  // 1. MOBILE VIEWPORT TEST: EXACTLY 393 x 852 (iPhone 14 / 15 / 16)
  // =========================================================================
  console.log('--- Testing Mobile Viewport (393 x 852) ---');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Allow preloader to complete and zoom animation to start
  await new Promise(r => setTimeout(r, 1200));

  // Inspect the Hero image and elements on mobile
  const mobileHeroCheck = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const heroImages = hero ? Array.from(hero.querySelectorAll('img')) : [];
    // The main image is the one with the alt describing EVOKE GARAGE or the second img in hero
    const mainImg = heroImages.find(img => img.src.includes('evoke-workshop-hero.jpg'));
    const h1 = hero ? hero.querySelector('h1') : null;
    const emblem = heroImages.find(img => img.src.includes('logo-circle.png'));
    const buttons = hero ? Array.from(hero.querySelectorAll('button')).map(b => b.textContent.trim()) : [];

    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const imgRect = mainImg ? mainImg.getBoundingClientRect() : null;

    return {
      hasHero: !!hero,
      heroWidth: heroRect ? heroRect.width : null,
      heroHeight: heroRect ? heroRect.height : null,
      hasMainImg: !!mainImg,
      mainImgSrc: mainImg ? mainImg.src : null,
      mainImgComplete: mainImg ? mainImg.complete : null,
      mainImgNaturalWidth: mainImg ? mainImg.naturalWidth : null,
      mainImgNaturalHeight: mainImg ? mainImg.naturalHeight : null,
      imgWidth: imgRect ? imgRect.width : null,
      imgHeight: imgRect ? imgRect.height : null,
      h1Text: h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : null,
      hasEmblem: !!emblem,
      buttons,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  console.log('Mobile Hero Check (393x852):', mobileHeroCheck);

  // Capture Mobile Hero Screenshot
  await page.screenshot({ path: 'screenshots/workshop-hero-mobile-393x852.png' });
  console.log('Saved screenshots/workshop-hero-mobile-393x852.png');

  // Also capture zoomed-in state after 1.5s
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/workshop-hero-mobile-settled.png' });

  // =========================================================================
  // 2. DESKTOP VIEWPORT TEST (1440 x 900)
  // =========================================================================
  console.log('--- Testing Desktop Viewport (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const desktopHeroCheck = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const heroImages = hero ? Array.from(hero.querySelectorAll('img')) : [];
    const mainImg = heroImages.find(img => img.src.includes('evoke-workshop-hero.jpg'));
    return {
      hasMainImg: !!mainImg,
      mainImgNaturalWidth: mainImg ? mainImg.naturalWidth : null,
      mainImgNaturalHeight: mainImg ? mainImg.naturalHeight : null,
    };
  });
  console.log('Desktop Hero Check:', desktopHeroCheck);

  await page.screenshot({ path: 'screenshots/workshop-hero-desktop-1440x900.png' });
  console.log('Saved screenshots/workshop-hero-desktop-1440x900.png');

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('=== Test Completed Successfully ===');
}

verifyWorkshopHero().catch(console.error);

