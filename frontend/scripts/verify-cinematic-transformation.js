import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyCinematicTransformation() {
  console.log('=== Verifying Complete Cinematic Transformation (No Phone Frame, No Dashboard) ===');

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
  // 1. DESKTOP VIEWPORT TEST (1440x900)
  // =========================================================================
  console.log('--- Testing Desktop (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for preloader to complete
  await new Promise(r => setTimeout(r, 1200));

  // Inspect Section A: Hero
  const heroCheck = await page.evaluate(() => {
    const hero = document.getElementById('top');
    const heroVideo = hero ? hero.querySelector('video') : null;
    const h1 = hero ? hero.querySelector('h1') : null;
    const emblem = hero ? hero.querySelector('img') : null;
    const buttons = hero ? Array.from(hero.querySelectorAll('button')).map(b => b.textContent.trim()) : [];

    return {
      hasHero: !!hero,
      hasHeroVideo: !!heroVideo,
      heroVideoSrc: heroVideo ? heroVideo.currentSrc : null,
      heroVideoCover: heroVideo ? getComputedStyle(heroVideo).objectFit : null,
      h1Text: h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : null,
      emblemSrc: emblem ? emblem.getAttribute('src') : null,
      buttons,
    };
  });
  console.log('Section A (Hero) Check:', heroCheck);
  await page.screenshot({ path: 'screenshots/transform-01-hero-desktop.png' });

  // Inspect Section B: Showcase (Before scroll)
  const showcaseTop = await page.evaluate(() => {
    const el = document.getElementById('showcase');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Showcase offsetTop:', showcaseTop);

  // Scroll to Showcase entrance
  await page.evaluate(y => window.scrollTo(0, y), showcaseTop);
  await new Promise(r => setTimeout(r, 800));

  const showcaseInitial = await page.evaluate(() => {
    const showcase = document.getElementById('showcase');
    const videos = showcase ? showcase.querySelectorAll('video') : [];
    const mainVideo = videos[1] || videos[0];
    const watermark = showcase ? showcase.querySelector('.font-heading') : null;
    const phoneFrames = showcase ? showcase.querySelectorAll('[class*="aspect-[9/16]"], [class*="rounded-[15px]"], [class*="REC"]') : [];

    return {
      hasShowcase: !!showcase,
      videoCount: videos.length,
      mainVideoTime: mainVideo ? mainVideo.currentTime : null,
      mainVideoObjectFit: mainVideo ? getComputedStyle(mainVideo).objectFit : null,
      hasPhoneMockup: phoneFrames.length > 0,
    };
  });
  console.log('Section B (Showcase Initial) Check:', showcaseInitial);
  await page.screenshot({ path: 'screenshots/transform-02-showcase-front.png' });

  // Test Scroll Progress through Showcase
  // Scroll 1: Rear Contour
  console.log('Scrolling forward to Rear Profile...');
  await page.evaluate(() => window.scrollBy(0, 700));
  await new Promise(r => setTimeout(r, 600));
  const rearCheck = await page.evaluate(() => {
    const videos = document.querySelectorAll('#showcase video');
    const v = videos[1] || videos[0];
    const h2 = document.querySelector('#showcase h2');
    return {
      time: v ? v.currentTime : null,
      headline: h2 ? h2.textContent.trim() : null
    };
  });
  console.log('Showcase Rear Check:', rearCheck);
  await page.screenshot({ path: 'screenshots/transform-03-showcase-rear.png' });

  // Scroll 2: Exhaust Ignition Flames
  console.log('Scrolling forward to Exhaust Ignition...');
  await page.evaluate(() => window.scrollBy(0, 600));
  await new Promise(r => setTimeout(r, 600));
  const exhaustCheck = await page.evaluate(() => {
    const videos = document.querySelectorAll('#showcase video');
    const v = videos[1] || videos[0];
    const h2 = document.querySelector('#showcase h2');
    return {
      time: v ? v.currentTime : null,
      headline: h2 ? h2.textContent.trim() : null
    };
  });
  console.log('Showcase Exhaust Check:', exhaustCheck);
  await page.screenshot({ path: 'screenshots/transform-04-showcase-exhaust.png' });

  // Scroll 3: Wheel Close-Up
  console.log('Scrolling forward to Forged Wheel...');
  await page.evaluate(() => window.scrollBy(0, 700));
  await new Promise(r => setTimeout(r, 600));
  const wheelCheck = await page.evaluate(() => {
    const videos = document.querySelectorAll('#showcase video');
    const v = videos[1] || videos[0];
    const h2 = document.querySelector('#showcase h2');
    return {
      time: v ? v.currentTime : null,
      headline: h2 ? h2.textContent.trim() : null
    };
  });
  console.log('Showcase Wheel Check:', wheelCheck);
  await page.screenshot({ path: 'screenshots/transform-05-showcase-wheel.png' });

  // Scroll 4: Test Reverse Scroll back to Front view
  console.log('Scrolling backward (reverse) to Front view...');
  await page.evaluate(() => window.scrollBy(0, -1800));
  await new Promise(r => setTimeout(r, 700));
  const reverseCheck = await page.evaluate(() => {
    const videos = document.querySelectorAll('#showcase video');
    const v = videos[1] || videos[0];
    return { time: v ? v.currentTime : null };
  });
  console.log('Showcase Reverse Check:', reverseCheck);

  // Inspect Section C: About
  const aboutTop = await page.evaluate(() => {
    const el = document.getElementById('about');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Section C (About) at y=' + aboutTop);
  await page.evaluate(y => window.scrollTo(0, y), aboutTop);
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'screenshots/transform-06-about-desktop.png' });

  // Inspect Section D: Services
  const servTop = await page.evaluate(() => {
    const el = document.getElementById('services');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Section D (Services) at y=' + servTop);
  await page.evaluate(y => window.scrollTo(0, y), servTop);
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'screenshots/transform-07-services-desktop.png' });

  // Inspect Section E: Gallery
  const galTop = await page.evaluate(() => {
    const el = document.getElementById('gallery');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Section E (Gallery) at y=' + galTop);
  await page.evaluate(y => window.scrollTo(0, y), galTop);
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'screenshots/transform-08-gallery-desktop.png' });

  // Inspect Section F: Contact
  const conTop = await page.evaluate(() => {
    const el = document.getElementById('contact');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  console.log('Scrolling to Section F (Contact) at y=' + conTop);
  await page.evaluate(y => window.scrollTo(0, y), conTop);
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'screenshots/transform-09-contact-desktop.png' });

  // =========================================================================
  // 2. MOBILE VIEWPORT TEST (390x844 - iPhone 14)
  // =========================================================================
  console.log('--- Testing Mobile Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'screenshots/transform-10-mobile-hero.png' });

  // Check mobile overflow
  const mobileOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  console.log('Mobile Overflow Check:', mobileOverflow);

  // Scroll to mobile showcase
  const mobileShowcaseTop = await page.evaluate(() => {
    const el = document.getElementById('showcase');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  await page.evaluate(y => window.scrollTo(0, y + 400), mobileShowcaseTop);
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: 'screenshots/transform-11-mobile-showcase.png' });

  console.log('Console Errors Caught:', consoleErrors);
  await browser.close();
  console.log('=== Test Completed Successfully ===');
}

verifyCinematicTransformation().catch(console.error);

