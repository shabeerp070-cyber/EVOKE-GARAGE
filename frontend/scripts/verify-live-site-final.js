import puppeteer from 'puppeteer-core';

async function verifyLive() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Test (1440 x 900)
  console.log('Testing Desktop 1440 x 900...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'scripts/verify-final-desktop-1440.png', fullPage: false });
  console.log('Saved scripts/verify-final-desktop-1440.png');

  // 2. Mobile Test (393 x 852 - iPhone 15 Pro)
  console.log('Testing Mobile 393 x 852...');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'scripts/verify-final-mobile-393.png', fullPage: false });
  console.log('Saved scripts/verify-final-mobile-393.png');

  await browser.close();
}

verifyLive().catch(console.error);
