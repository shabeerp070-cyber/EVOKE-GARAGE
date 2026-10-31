import puppeteer from 'puppeteer-core';

async function verifyLiveSite() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  // Test Mobile Viewport (393 x 852)
  console.log('--- Testing Mobile Viewport (393 x 852) ---');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const mobileCheck = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const img = hero ? hero.querySelector('img[src*="evoke-workshop-hero-clean.jpg"]') : null;
    const h1 = hero ? hero.querySelector('h1') : null;
    const buttons = hero ? Array.from(hero.querySelectorAll('button')).map(b => b.innerText.trim()) : [];
    const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
    return {
      hasHero: !!hero,
      hasCleanImg: !!img,
      imgSrc: img ? img.src : null,
      h1: h1 ? h1.innerText.replace(/\s+/g, ' ') : null,
      buttons,
      hasHorizontalOverflow
    };
  });
  console.log('Mobile Check:', mobileCheck);
  await page.screenshot({ path: 'scripts/final-verified-mobile.png' });
  console.log('Saved scripts/final-verified-mobile.png');

  // Test Desktop Viewport (1440 x 900)
  console.log('--- Testing Desktop Viewport (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 600));

  const desktopCheck = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const img = hero ? hero.querySelector('img[src*="evoke-workshop-hero-clean.jpg"]') : null;
    const hasHorizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
    return {
      hasHero: !!hero,
      hasCleanImg: !!img,
      hasHorizontalOverflow
    };
  });
  console.log('Desktop Check:', desktopCheck);
  await page.screenshot({ path: 'scripts/final-verified-desktop.png' });
  console.log('Saved scripts/final-verified-desktop.png');

  console.log('Console Errors:', consoleErrors.length);
  await browser.close();
}

verifyLiveSite().catch(console.error);

