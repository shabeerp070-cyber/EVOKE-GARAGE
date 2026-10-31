import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('=== Starting Continuous Automotive Experience Verification ===');

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

  // 1. DESKTOP RUN (1440x900)
  console.log('--- Checking Desktop Viewport (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for preloader to complete and hero to settle
  await new Promise(r => setTimeout(r, 1400));
  await page.screenshot({ path: 'screenshots/continuous-01-hero.png' });
  console.log('Saved Hero');

  // Query section positions and triggers
  const sections = await page.evaluate(() => {
    const ids = ['top', 'about', 'showcase', 'services', 'gallery', 'contact'];
    return ids.map(id => {
      const el = document.getElementById(id);
      return {
        id,
        top: el ? el.getBoundingClientRect().top + window.scrollY : null,
        height: el ? el.offsetHeight : null
      };
    });
  });
  console.log('Sections map:', JSON.stringify(sections, null, 2));

  // Check ScrollTriggers
  const triggers = await page.evaluate(() => {
    return window.__ScrollTrigger ? window.__ScrollTrigger.getAll().map(st => ({
      triggerId: st.trigger?.id,
      start: st.start,
      end: st.end,
      pin: !!st.pin
    })) : 'no ScrollTrigger';
  });
  console.log('ScrollTriggers:', JSON.stringify(triggers, null, 2));

  // Scroll to About
  const aboutSec = sections.find(s => s.id === 'about');
  if (aboutSec) {
    await page.evaluate(y => window.scrollTo(0, y), aboutSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-02-about.png' });
    console.log('Saved About');
  }

  // Scroll to Showcase Scene 1, Scene 2, Scene 3
  const showSec = sections.find(s => s.id === 'showcase');
  if (showSec) {
    // Scene 1
    await page.evaluate(y => window.scrollTo(0, y), showSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-03-showcase-scene1.png' });

    // Scene 2 (halfway through pin)
    await page.evaluate(y => window.scrollTo(0, y), showSec.top + 900);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-04-showcase-scene2.png' });

    // Scene 3 (near end of pin)
    await page.evaluate(y => window.scrollTo(0, y), showSec.top + 1600);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-05-showcase-scene3.png' });
    console.log('Saved 3-Scene Showcase');
  }

  // Scroll to Services (Painting, Denting, AC, Electrical)
  const servSec = sections.find(s => s.id === 'services');
  if (servSec) {
    await page.evaluate(y => window.scrollTo(0, y), servSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-06-services-painting.png' });

    await page.evaluate(y => window.scrollTo(0, y), servSec.top + 600);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-07-services-denting.png' });

    await page.evaluate(y => window.scrollTo(0, y), servSec.top + 1300);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-08-services-ac.png' });

    await page.evaluate(y => window.scrollTo(0, y), servSec.top + 2000);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-09-services-elec.png' });
    console.log('Saved Services');
  }

  // Scroll to Gallery
  const galSec = sections.find(s => s.id === 'gallery');
  if (galSec) {
    await page.evaluate(y => window.scrollTo(0, y), galSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-10-gallery.png' });
    console.log('Saved Gallery');
  }

  // Scroll to Contact
  const conSec = sections.find(s => s.id === 'contact');
  if (conSec) {
    await page.evaluate(y => window.scrollTo(0, y), conSec.top);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-11-contact.png' });
    console.log('Saved Contact');
  }

  // 2. MOBILE RUN (390x844)
  console.log('--- Checking Mobile Viewport (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: 'screenshots/continuous-12-mobile-hero.png' });

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  console.log('Mobile Overflow Check:', overflow);

  const mServ = await page.evaluate(() => {
    const el = document.getElementById('services');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  if (mServ) {
    await page.evaluate(y => window.scrollTo(0, y), mServ);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-13-mobile-services.png' });
  }

  const mContact = await page.evaluate(() => {
    const el = document.getElementById('contact');
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  if (mContact) {
    await page.evaluate(y => window.scrollTo(0, y), mContact);
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'screenshots/continuous-14-mobile-contact.png' });
  }

  console.log('Console Errors:', consoleErrors);
  await browser.close();
  console.log('=== Complete Verification Finished Successfully ===');
}

run().catch(console.error);

