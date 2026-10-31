import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testViewport(width, height, name) {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Check horizontal overflow
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.offsetWidth;
    const bodyWidth = document.body.scrollWidth;
    const overflowingElements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 1) {
        overflowingElements.push({
          tag: el.tagName,
          id: el.id,
          className: (el.className || '').toString().slice(0, 50),
          right: rect.right,
          overflow: rect.right - window.innerWidth
        });
      }
    });
    return {
      windowWidth: window.innerWidth,
      docWidth,
      bodyWidth,
      hasOverflow: bodyWidth > window.innerWidth,
      overflowingElements: overflowingElements.slice(0, 5)
    };
  });

  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: false });

  console.log(`[${name} ${width}x${height}] Overflow:`, overflow.hasOverflow ? 'YES' : 'NO', 'Errors:', errors.length);
  if (overflow.hasOverflow) {
    console.log('Overflowing elements:', JSON.stringify(overflow.overflowingElements, null, 2));
  }
  if (errors.length) {
    console.log('Console errors:', errors);
  }

  await browser.close();
}

async function run() {
  await testViewport(375, 667, 'mobile-375');
}

run().catch(console.error);

