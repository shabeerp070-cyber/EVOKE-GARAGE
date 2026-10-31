import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function downloadPexels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const photoPage = 'https://www.pexels.com/photo/a-technician-spray-paints-a-car-with-a-paint-spray-gun-in-a-workshop-6870314/';
  await page.goto(photoPage, { waitUntil: 'domcontentloaded' });

  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(i => i.src);
  });

  console.log('Images on page:', imgs);

  const mainSrc = imgs.find(s => s.includes('6870314'));
  if (mainSrc) {
    console.log('Downloading mainSrc:', mainSrc);
    // Request image through page
    const viewSource = await page.goto(mainSrc);
    const buf = await viewSource.buffer();
    fs.writeFileSync('scripts/pexels_paint_6870314.jpg', buf);
    console.log('Saved scripts/pexels_paint_6870314.jpg:', buf.length);
  }

  await browser.close();
}

downloadPexels().catch(console.error);
