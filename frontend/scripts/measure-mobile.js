import puppeteer from 'puppeteer-core';

function toObj(rect) {
  if (!rect) return null;
  return {
    top: Math.round(rect.top),
    bottom: Math.round(rect.bottom),
    left: Math.round(rect.left),
    right: Math.round(rect.right),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const metrics = await page.evaluate(() => {
    function toObj(rect) {
      if (!rect) return null;
      return {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    }
    const hero = document.getElementById('top');
    const img = hero ? hero.querySelector('img[src*="evoke-workshop-hero.jpg"]') : null;
    const h1 = hero ? hero.querySelector('h1') : null;
    const desc = hero ? hero.querySelector('p') : null;
    const buttons = hero ? hero.querySelector('.hero-content-group > div:last-child') : null;
    const contentGroup = hero ? hero.querySelector('.hero-content-group') : null;
    return {
      heroRect: toObj(hero?.getBoundingClientRect()),
      imgRect: toObj(img?.getBoundingClientRect()),
      contentGroup: toObj(contentGroup?.getBoundingClientRect()),
      h1Rect: toObj(h1?.getBoundingClientRect()),
      descRect: toObj(desc?.getBoundingClientRect()),
      buttonsRect: toObj(buttons?.getBoundingClientRect()),
    };
  });
  console.log('Mobile Metrics:', JSON.stringify(metrics, null, 2));

  await page.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 400));
  const desktopMetrics = await page.evaluate(() => {
    function toObj(rect) {
      if (!rect) return null;
      return {
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    }
    const hero = document.getElementById('top');
    const img = hero ? hero.querySelector('img[src*="evoke-workshop-hero.jpg"]') : null;
    const h1 = hero ? hero.querySelector('h1') : null;
    const desc = hero ? hero.querySelector('p') : null;
    const buttons = hero ? hero.querySelector('.hero-content-group > div:last-child') : null;
    return {
      heroRect: toObj(hero?.getBoundingClientRect()),
      imgRect: toObj(img?.getBoundingClientRect()),
      h1Rect: toObj(h1?.getBoundingClientRect()),
      descRect: toObj(desc?.getBoundingClientRect()),
      buttonsRect: toObj(buttons?.getBoundingClientRect()),
    };
  });
  console.log('Desktop Metrics:', JSON.stringify(desktopMetrics, null, 2));

  await browser.close();
}

run().catch(console.error);
