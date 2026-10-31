import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyAll() {
  console.log('=== Starting Full Website Cinematic Verification ===');

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

  // ==========================================
  // 1. DESKTOP VIEWPORT TEST (1440x900)
  // ==========================================
  console.log('--- Testing Desktop (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // 1A. Check Preloader
  await page.screenshot({ path: 'screenshots/verify-01-preloader.png' });
  console.log('Captured Preloader');

  // Wait for preloader to finish and hero entrance to animate
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'screenshots/verify-02-hero-desktop.png' });
  console.log('Captured Hero Desktop');

  // Verify Hero Texts
  const heroData = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent;
    const h2 = document.querySelector('h2')?.textContent;
    const p = document.querySelector('#top p')?.textContent;
    return { h1, h2, p };
  });
  console.log('Hero Data:', heroData);

  // 1B. Scroll through Cinematic Video Scroll (Front, Exhaust Flame, Wheel)
  // Get positions of all sections
  const sections = await page.evaluate(() => {
    const list = ['top', 'cinematic-motion', 'about', 'showcase', 'services', 'gallery', 'contact'];
    return list.map(id => {
      const el = document.getElementById(id);
      return {
        id,
        top: el ? el.getBoundingClientRect().top + window.scrollY : null,
        height: el ? el.offsetHeight : null
      };
    });
  });
  console.log('Sections Map:', sections);

  const cineSec = sections.find(s => s.id === 'cinematic-motion');
  if (cineSec) {
    // Scroll to Front scene (~2500)
    await page.evaluate(y => window.scrollTo(0, y), cineSec.top + 300);
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: 'screenshots/verify-03-cinematic-front.png' });

    // Scroll to Exhaust Flame (~3800)
    await page.evaluate(y => window.scrollTo(0, y), cineSec.top + 1500);
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: 'screenshots/verify-04-cinematic-exhaust.png' });

    // Scroll to Wheel (~4400)
    await page.evaluate(y => window.scrollTo(0, y), cineSec.top + 2000);
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: 'screenshots/verify-05-cinematic-wheel.png' });
  }

  // 1C. Scroll into About Section
  const aboutSec = sections.find(s => s.id === 'about');
  if (aboutSec) {
    await page.evaluate(y => window.scrollTo(0, y), aboutSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-06-about-desktop.png' });
    console.log('Captured About Desktop');
  }

  // 1D. Scroll into Services Showcase
  const servSec = sections.find(s => s.id === 'services');
  if (servSec) {
    // Car Painting
    await page.evaluate(y => window.scrollTo(0, y), servSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-07-services-painting.png' });

    // Denting & Body Repair
    await page.evaluate(y => window.scrollTo(0, y), servSec.top + 600);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-08-services-denting.png' });

    // Car A/C Work
    await page.evaluate(y => window.scrollTo(0, y), servSec.top + 1300);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-09-services-ac.png' });

    // Automotive Electrical
    await page.evaluate(y => window.scrollTo(0, y), servSec.top + 2000);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-10-services-electrical.png' });
    console.log('Captured All 4 Services Disciplines');
  }

  // 1E. Scroll into Gallery
  const galSec = sections.find(s => s.id === 'gallery');
  if (galSec) {
    await page.evaluate(y => window.scrollTo(0, y), galSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-11-gallery-desktop.png' });
    console.log('Captured Gallery Desktop');
  }

  // 1F. Scroll into Contact Section
  const conSec = sections.find(s => s.id === 'contact');
  if (conSec) {
    await page.evaluate(y => window.scrollTo(0, y), conSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-12-contact-desktop.png' });
    console.log('Captured Contact Desktop');
  }

  // ==========================================
  // 2. MOBILE VIEWPORT TEST (390x844 - iPhone 14)
  // ==========================================
  console.log('--- Testing Mobile (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for intro
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/verify-13-mobile-hero.png' });

  // Mobile overflow check
  const mobileOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  console.log('Mobile Overflow Status:', mobileOverflow);

  // Mobile Services
  const mServSec = await page.evaluate(() => {
    const el = document.getElementById('services');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  if (mServSec) {
    await page.evaluate(y => window.scrollTo(0, y), mServSec);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-14-mobile-services.png' });
  }

  // Mobile Contact
  const mConSec = await page.evaluate(() => {
    const el = document.getElementById('contact');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  if (mConSec) {
    await page.evaluate(y => window.scrollTo(0, y), mConSec);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/verify-15-mobile-contact.png' });
  }

  console.log('Console Errors Caught:', consoleErrors);
  await browser.close();
  console.log('=== Verification Completed Successfully ===');
}

verifyAll().catch(console.error);

