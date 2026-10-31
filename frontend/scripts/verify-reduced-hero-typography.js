import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyReducedHeroTypography() {
  console.log('=== Verifying Hero Typography Reduction & Responsive Scaling ===');

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
  await new Promise(r => setTimeout(r, 1200));

  const mobileMetrics = await page.evaluate(() => {
    const h1 = document.querySelector('#top h1');
    const p = document.querySelector('#top h1 + p');
    const badge = document.querySelector('#top span[class*="EST."]');
    const buttons = document.querySelector('#top .btn-forge-primary');

    const getMetrics = el => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
      };
    };

    return {
      h1: getMetrics(h1),
      description: getMetrics(p),
      locationBadge: getMetrics(badge),
      buttons: getMetrics(buttons),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });

  console.log('Mobile Metrics (393x852):', mobileMetrics);
  await page.screenshot({ path: 'screenshots/reduced-hero-mobile-393x852.png' });
  console.log('Saved screenshots/reduced-hero-mobile-393x852.png');

  // =========================================================================
  // 2. DESKTOP TEST (1440 x 900)
  // =========================================================================
  console.log('--- Testing Desktop Viewport (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const desktopMetrics = await page.evaluate(() => {
    const h1 = document.querySelector('#top h1');
    const p = document.querySelector('#top h1 + p');
    const getMetrics = el => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
      };
    };
    return {
      h1: getMetrics(h1),
      description: getMetrics(p),
    };
  });

  console.log('Desktop Metrics (1440x900):', desktopMetrics);
  await page.screenshot({ path: 'screenshots/reduced-hero-desktop-1440x900.png' });
  console.log('Saved screenshots/reduced-hero-desktop-1440x900.png');

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('=== Test Completed Successfully ===');
}

verifyReducedHeroTypography().catch(console.error);

