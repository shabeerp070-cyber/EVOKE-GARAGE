import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyVideoHero() {
  console.log('=== Verifying Video-Powered Hero & Complete Website Experience ===');

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

  // 1. DESKTOP VIEWPORT TEST (1440x900)
  console.log('--- Testing Desktop (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for preloader to complete and hero to settle
  await new Promise(r => setTimeout(r, 1200));

  // Check initial hero state
  const heroInitial = await page.evaluate(() => {
    const v = document.querySelector('#top video');
    const h1 = document.querySelector('#top h1');
    const timecode = document.querySelector('#top [class*="tabular-nums"]');
    return {
      hasVideo: !!v,
      videoSrc: v ? v.currentSrc : null,
      videoReadyState: v ? v.readyState : null,
      videoTime: v ? v.currentTime : null,
      h1Text: h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : null,
      timecodeText: timecode ? timecode.textContent : null,
    };
  });
  console.log('Hero Initial Check:', heroInitial);
  await page.screenshot({ path: 'screenshots/hero-video-01-front.png' });

  // Test Scroll Control through Hero Video
  // Pin height of Hero
  const heroPinData = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const spacer = hero ? hero.parentElement : null;
    return {
      spacerHeight: spacer ? spacer.offsetHeight : null,
      spacerPadding: spacer ? spacer.style.padding : null,
    };
  });
  console.log('Hero Pin Data:', heroPinData);

  // Checkpoints in Hero:
  // Scroll to Rear profile (~scrollY = 1200)
  // Scroll to Exhaust flames (~scrollY = 1700)
  // Scroll to Forged wheel (~scrollY = 2200)
  console.log('Scrolling to Rear profile in Hero...');
  await page.evaluate(() => window.scrollTo(0, 1100));
  await new Promise(r => setTimeout(r, 700));
  const rearCheck = await page.evaluate(() => {
    const v = document.querySelector('#top video');
    return { currentTime: v ? v.currentTime : null };
  });
  console.log('Rear Check videoTime:', rearCheck.currentTime?.toFixed(2) + 's');
  await page.screenshot({ path: 'screenshots/hero-video-02-rear.png' });

  console.log('Scrolling to Exhaust backfire flames in Hero...');
  await page.evaluate(() => window.scrollTo(0, 1550));
  await new Promise(r => setTimeout(r, 700));
  const exhaustCheck = await page.evaluate(() => {
    const v = document.querySelector('#top video');
    return { currentTime: v ? v.currentTime : null };
  });
  console.log('Exhaust Check videoTime:', exhaustCheck.currentTime?.toFixed(2) + 's');
  await page.screenshot({ path: 'screenshots/hero-video-03-exhaust.png' });

  console.log('Scrolling to Forged wheel in Hero...');
  await page.evaluate(() => window.scrollTo(0, 2100));
  await new Promise(r => setTimeout(r, 700));
  const wheelCheck = await page.evaluate(() => {
    const v = document.querySelector('#top video');
    return { currentTime: v ? v.currentTime : null };
  });
  console.log('Wheel Check videoTime:', wheelCheck.currentTime?.toFixed(2) + 's');
  await page.screenshot({ path: 'screenshots/hero-video-04-wheel.png' });

  // Test reverse scroll
  console.log('Testing reverse scroll back to Front view...');
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 700));
  const reverseCheck = await page.evaluate(() => {
    const v = document.querySelector('#top video');
    return { currentTime: v ? v.currentTime : null };
  });
  console.log('Reverse Check videoTime:', reverseCheck.currentTime?.toFixed(2) + 's (should be near 1.5s)');

  // Now continue scrolling into the rest of the website:
  // About section
  const aboutTop = await page.evaluate(() => {
    const el = document.getElementById('about');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to About at y=' + aboutTop);
  await page.evaluate(y => window.scrollTo(0, y), aboutTop);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/hero-video-05-about.png' });

  // Showcase section
  const showTop = await page.evaluate(() => {
    const el = document.getElementById('showcase');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Showcase at y=' + showTop);
  await page.evaluate(y => window.scrollTo(0, y), showTop);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/hero-video-06-showcase.png' });

  // Services section
  const servTop = await page.evaluate(() => {
    const el = document.getElementById('services');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Services at y=' + servTop);
  await page.evaluate(y => window.scrollTo(0, y), servTop);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/hero-video-07-services.png' });

  // Contact section
  const conTop = await page.evaluate(() => {
    const el = document.getElementById('contact');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Contact at y=' + conTop);
  await page.evaluate(y => window.scrollTo(0, y), conTop);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/hero-video-08-contact.png' });

  // 2. MOBILE VIEWPORT TEST (390x844 - iPhone 14)
  console.log('--- Testing Mobile Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'screenshots/hero-video-09-mobile-hero.png' });

  // Mobile overflow test
  const mobileOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  console.log('Mobile Overflow Check:', mobileOverflow);

  // Mobile scroll to exhaust flames
  await page.evaluate(() => window.scrollTo(0, 1100));
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'screenshots/hero-video-10-mobile-exhaust.png' });

  console.log('Console Errors Caught:', consoleErrors);
  await browser.close();
  console.log('=== Test Completed Successfully ===');
}

verifyVideoHero().catch(console.error);

