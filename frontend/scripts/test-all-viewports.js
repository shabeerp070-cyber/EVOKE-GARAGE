import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { width: 320, height: 568, name: '320px-mobile' },
  { width: 360, height: 740, name: '360px-mobile' },
  { width: 375, height: 667, name: '375px-mobile' },
  { width: 390, height: 844, name: '390px-mobile' },
  { width: 430, height: 932, name: '430px-mobile' },
  { width: 768, height: 1024, name: '768px-tablet' },
  { width: 1024, height: 768, name: '1024px-laptop' },
  { width: 1440, height: 900, name: '1440px-desktop' },
  // Landscape check for mobile
  { width: 844, height: 390, name: '390px-landscape' }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

  const summary = [];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    // Scroll through the page to trigger ScrollTriggers and verify layout
    await page.evaluate(async () => {
      window.scrollTo(0, 1000);
      await new Promise(r => setTimeout(r, 200));
      window.scrollTo(0, 3000);
      await new Promise(r => setTimeout(r, 200));
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));
    });

    const check = await page.evaluate(() => {
      const windowW = window.innerWidth;
      const bodyW = document.body.scrollWidth;
      const htmlW = document.documentElement.scrollWidth;

      const overflowing = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        // Ignore position fixed or off-screen hidden overlays
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;
        
        if (rect.right > windowW + 1) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className || '').toString().slice(0, 35),
            overflow: Math.round(rect.right - windowW)
          });
        }
      });

      return {
        windowW,
        bodyW,
        htmlW,
        hasOverflow: bodyW > windowW || htmlW > windowW,
        overflowCount: overflowing.length,
        overflowing: overflowing.slice(0, 5)
      };
    });

    await page.screenshot({ path: `screenshots/${vp.name}.png`, fullPage: false });

    // Also take full page screenshot for 375px mobile
    if (vp.width === 375) {
      await page.screenshot({ path: `screenshots/mobile-375-full.png`, fullPage: true });
    }

    summary.push({
      name: vp.name,
      viewport: `${vp.width}x${vp.height}`,
      hasOverflow: check.hasOverflow,
      overflowing: check.overflowing,
      errors: errors.length
    });

    await page.close();
  }

  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
}

run().catch(console.error);

