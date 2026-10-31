import puppeteer from 'puppeteer-core';

const viewports = [
  { name: 'mobile-se-375x667', width: 375, height: 667, isMobile: true },
  { name: 'mobile-iphone15-393x852', width: 393, height: 852, isMobile: true },
  { name: 'mobile-promax-430x932', width: 430, height: 932, isMobile: true },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 }
];

async function verifyAll() {
  console.log('=== Comprehensive Verification of EVOKE GARAGE Hero Section ===');
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

  for (const vp of viewports) {
    console.log(`\nTesting ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: !!vp.isMobile });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const check = await page.evaluate(() => {
      const hero = document.getElementById('top');
      const contentGroup = hero ? hero.querySelector('.hero-content-group') : null;
      const h1 = hero ? hero.querySelector('h1') : null;
      const buttons = hero ? hero.querySelectorAll('button') : [];
      const img = hero ? hero.querySelector('img[src*="evoke-workshop-hero.jpg"]') : null;

      // Check if any card wrapper exists inside .hero-content-group
      const cardContainer = contentGroup ? contentGroup.querySelector('.rounded-2xl.bg-black\\/65, .rounded-2xl.bg-black\\/45, [class*="bg-black/65"]') : null;

      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

      return {
        hasHero: !!hero,
        hasImg: !!img,
        imgSrc: img ? img.src : null,
        hasCardContainer: !!cardContainer,
        h1Text: h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : null,
        buttonTexts: Array.from(buttons).map(b => b.innerText.replace(/\s+/g, ' ').trim()),
        hasHorizontalScroll,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth
      };
    });

    console.log(`  Hero present: ${check.hasHero}`);
    console.log(`  Background Image: ${check.imgSrc}`);
    console.log(`  Dark Card Removed: ${!check.hasCardContainer}`);
    console.log(`  H1: "${check.h1Text}"`);
    console.log(`  Buttons: [${check.buttonTexts.join(', ')}]`);
    console.log(`  Horizontal overflow: ${check.hasHorizontalScroll ? 'FAIL (' + check.scrollWidth + ' > ' + check.innerWidth + ')' : 'PASSED (0 overflow)'}`);

    if (check.hasCardContainer) {
      console.error('  ERROR: Dark card container still detected!');
    }
    if (check.hasHorizontalScroll) {
      console.error('  ERROR: Horizontal scroll detected!');
    }

    await page.screenshot({ path: `scripts/verify-${vp.name}.png` });
    console.log(`  Saved screenshot: scripts/verify-${vp.name}.png`);
  }

  console.log('\n=== Console Errors ===');
  console.log(`Total errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  await browser.close();
}

verifyAll().catch(console.error);

