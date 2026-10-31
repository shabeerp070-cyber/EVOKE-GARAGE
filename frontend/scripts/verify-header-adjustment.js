import puppeteer from 'puppeteer-core';

async function verifyHeaderAdjustment() {
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

  // 1. Mobile (393 x 852)
  console.log('--- Testing Mobile 393 x 852 ---');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const mobileCoords = await page.evaluate(() => {
    const header = document.querySelector('header.site-header');
    const logoImg = header ? header.querySelector('img') : null;
    const inquireBtn = header ? header.querySelector('button') : null;
    const menuBtn = header ? header.querySelectorAll('button')[1] : null;
    const subbar = document.querySelector('#top > div:nth-child(2)');
    const h1 = document.querySelector('#top h1');
    const heroImg = document.querySelector('#top img[src*="evoke-workshop-hero-clean.jpg"]');

    const getR = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
    };

    return {
      header: getR(header),
      logoImg: getR(logoImg),
      inquireBtn: getR(inquireBtn),
      menuBtn: getR(menuBtn),
      subbar: getR(subbar),
      h1: getR(h1),
      heroImg: getR(heroImg),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });

  console.log('Mobile Measurements:', JSON.stringify(mobileCoords, null, 2));
  await page.screenshot({ path: 'scripts/mobile-header-adjusted-393x852.png' });
  console.log('Saved scripts/mobile-header-adjusted-393x852.png');

  // 2. Desktop (1440 x 900)
  console.log('\n--- Testing Desktop 1440 x 900 ---');
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 500));

  const desktopCoords = await page.evaluate(() => {
    const header = document.querySelector('header.site-header');
    const logoImg = header ? header.querySelector('img') : null;
    const subbar = document.querySelector('#top > div:nth-child(2)');
    const hero = document.getElementById('top');

    const getR = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
    };

    return {
      header: getR(header),
      logoImg: getR(logoImg),
      subbar: getR(subbar),
      heroPaddingTop: window.getComputedStyle(hero).paddingTop,
      headerPaddingTop: window.getComputedStyle(header).paddingTop,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });

  console.log('Desktop Measurements:', JSON.stringify(desktopCoords, null, 2));
  await page.screenshot({ path: 'scripts/desktop-header-preserved-1440x900.png' });
  console.log('Saved scripts/desktop-header-preserved-1440x900.png');

  console.log('\nTotal console errors:', consoleErrors.length);
  await browser.close();
}

verifyHeaderAdjustment().catch(console.error);

