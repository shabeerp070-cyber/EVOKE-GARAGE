import puppeteer from 'puppeteer-core';
import fs from 'fs';
import sharp from 'sharp';

async function searchUnsplash() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  console.log('Navigating to Unsplash car spray painting...');
  await page.goto('https://unsplash.com/s/photos/car-spray-painting', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img[src*="images.unsplash.com/photo-"]'));
    return imgs.map(i => ({
      src: i.src.split('?')[0],
      alt: i.alt
    }));
  });

  console.log('Found on Unsplash:', images.length);
  images.slice(0, 15).forEach((img, i) => console.log(`  [${i}] ${img.alt} --> ${img.src}`));

  for (let i = 0; i < Math.min(6, images.length); i++) {
    const img = images[i];
    if (!img.src) continue;
    try {
      const fullUrl = `${img.src}?auto=format&fit=crop&w=1600&q=85`;
      console.log(`Downloading ${i}...`);
      const view = await page.goto(fullUrl);
      const rawBuf = await view.buffer();
      await sharp(rawBuf)
        .jpeg({ quality: 90 })
        .toFile(`scripts/unsplash_candidate_${i}.jpg`);
      console.log(`Saved scripts/unsplash_candidate_${i}.jpg`);
    } catch (e) {
      console.error(`Failed ${i}:`, e.message);
    }
  }

  await browser.close();
}

searchUnsplash().catch(console.error);

