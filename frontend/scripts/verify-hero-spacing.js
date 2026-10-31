import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyHeroSpacing() {
  console.log('=== Verifying Hero Section Spacing, Positioning & Background Scrim ===');

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
  // 1. MOBILE VIEWPORT TEST: EXACTLY 393 x 852
  // =========================================================================
  console.log('--- Testing Mobile Viewport (393 x 852) ---');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const mobileMetrics = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const badge = hero ? hero.querySelector('#hero-location-badge') : null;
    const h1 = hero ? hero.querySelector('h1') : null;
    const p = hero ? hero.querySelector('h1 + p') : null;
    const buttons = hero ? hero.querySelector('.btn-forge-primary') : null;

    const getBounds = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
    };

    const badgeBounds = getBounds(badge);
    const h1Bounds = getBounds(h1);
    const pBounds = getBounds(p);
    const buttonsBounds = getBounds(buttons);

    return {
      locationBadge: badgeBounds,
      gapBadgeToH1: h1Bounds && badgeBounds ? h1Bounds.top - badgeBounds.bottom : null,
      headline: h1Bounds,
      gapH1ToDesc: pBounds && h1Bounds ? pBounds.top - h1Bounds.bottom : null,
      description: pBounds,
      gapDescToButtons: buttonsBounds && pBounds ? buttonsBounds.top - pBounds.bottom : null,
      buttons: buttonsBounds,
      unobstructedSpaceForCar: buttonsBounds ? 852 - buttonsBounds.bottom : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  console.log('Mobile Hero Layout Metrics (393x852):', mobileMetrics);
  await page.screenshot({ path: 'screenshots/hero-spacing-mobile-393x852.png' });
  console.log('Saved screenshots/hero-spacing-mobile-393x852.png');

  // =========================================================================
  // 2. DESKTOP VIEWPORT TEST (1440 x 900)
  // =========================================================================
  console.log('--- Testing Desktop Viewport (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const desktopMetrics = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const h1 = hero ? hero.querySelector('h1') : null;
    const p = hero ? hero.querySelector('h1 + p') : null;
    const getBounds = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
    };
    return {
      headline: getBounds(h1),
      description: getBounds(p)
    };
  });
  console.log('Desktop Hero Layout Metrics (1440x900):', desktopMetrics);

  await page.screenshot({ path: 'screenshots/hero-spacing-desktop-1440x900.png' });
  console.log('Saved screenshots/hero-spacing-desktop-1440x900.png');

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('=== Test Completed Successfully ===');
}

verifyHeroSpacing().catch(console.error);
