import puppeteer from 'puppeteer-core';

async function testHeaderApproaches() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

  // Test Approach A: top: 30px on header, padding-top: 110px on #top
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const header = document.querySelector('header');
    const hero = document.getElementById('top');
    if (header) header.style.top = '30px';
    if (hero) hero.style.paddingTop = '110px';
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/test-header-approach-A-top30.png' });
  console.log('Saved approach A (top: 30px)');

  // Test Approach B: padding-top on header, padding-top on #top
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const header = document.querySelector('header');
    const hero = document.getElementById('top');
    if (header) {
      header.style.paddingTop = '42px'; // base 16px (1rem) + 26px
    }
    if (hero) hero.style.paddingTop = '116px';
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/test-header-approach-B-padding.png' });
  console.log('Saved approach B (padding-top)');

  await browser.close();
}

testHeaderApproaches().catch(console.error);

