import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureSections() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const sections = [
    { selector: 'section', name: 'sec-1-hero-mobile' },
    { selector: '#about', name: 'sec-2-about-mobile' },
    { selector: '#showcase', name: 'sec-3-showcase-mobile' },
    { selector: '#services', name: 'sec-5-services-mobile' },
    { selector: '#gallery', name: 'sec-6-gallery-mobile' },
    { selector: '#contact', name: 'sec-7-contact-mobile' },
  ];

  for (const s of sections) {
    const el = await page.$(s.selector);
    if (el) {
      await page.evaluate((sel) => {
        const elem = document.querySelector(sel);
        if (elem) elem.scrollIntoView();
      }, s.selector);
      await new Promise(r => setTimeout(r, 700));
      await el.screenshot({ path: `screenshots/${s.name}.png` });
    }
  }

  // Large statement
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    if (sections[3]) sections[3].scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 700));
  const statementEl = await page.evaluateHandle(() => document.querySelectorAll('section')[3]);
  if (statementEl) await statementEl.screenshot({ path: 'screenshots/sec-4-statement-mobile.png' });

  // Mobile Menu Open
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));
  await page.click('button[aria-label="Open Navigation Menu"]');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'screenshots/sec-8-menu-mobile.png' });

  console.log('All section screenshots refreshed.');
  await browser.close();
}

captureSections().catch(console.error);
