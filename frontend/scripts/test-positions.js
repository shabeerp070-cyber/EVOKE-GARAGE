import puppeteer from 'puppeteer-core';

async function testPositions() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const configs = [
    { name: 'desktop-center-60', width: 1440, height: 900, pos: 'center 60%' },
    { name: 'desktop-center-68', width: 1440, height: 900, pos: 'center 68%' },
    { name: 'desktop-center-75', width: 1440, height: 900, pos: 'center 75%' },
    { name: 'mobile-center-50', width: 393, height: 852, pos: 'center 50%', isMobile: true },
    { name: 'mobile-center-60', width: 393, height: 852, pos: 'center 60%', isMobile: true },
    { name: 'mobile-scale-center-65', width: 393, height: 852, pos: 'center 65%', isMobile: true, scale: 'scale-105' }
  ];

  for (const cfg of configs) {
    await page.setViewport({ width: cfg.width, height: cfg.height, isMobile: !!cfg.isMobile });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate((pos) => {
      const img = document.querySelector('#top img[src*="evoke-workshop-hero.jpg"]');
      if (img) img.style.objectPosition = pos;
    }, cfg.pos);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: `scripts/test-${cfg.name}.png` });
    console.log(`Captured ${cfg.name}`);
  }

  await browser.close();
}

testPositions().catch(console.error);

