import puppeteer from 'puppeteer-core';
import fs from 'fs';
import sharp from 'sharp';

async function searchPexels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const queries = [
    'https://www.pexels.com/search/car%20paint%20sprayer/',
    'https://www.pexels.com/search/painting%20car/'
  ];

  for (const q of queries) {
    console.log('Searching', q);
    await page.goto(q, { waitUntil: 'domcontentloaded' });
    const photos = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img[src*="images.pexels.com/photos/"]'));
      return imgs.map(i => ({
        src: i.src.split('?')[0],
        alt: i.alt
      }));
    });

    console.log(`Found ${photos.length} photos for ${q}`);
    for (let i = 0; i < Math.min(6, photos.length); i++) {
      const p = photos[i];
      if (!p.src) continue;
      const idMatch = p.src.match(/photos\/(\d+)/);
      const id = idMatch ? idMatch[1] : `p_${i}`;
      console.log(`  [${id}] ${p.alt}`);
      const fullUrl = p.src + '?auto=compress&cs=tinysrgb&w=1600';
      try {
        const view = await page.goto(fullUrl);
        const rawBuf = await view.buffer();
        await sharp(rawBuf)
          .jpeg({ quality: 90 })
          .toFile(`scripts/pexels_search_${id}.jpg`);
        console.log(`  Saved scripts/pexels_search_${id}.jpg`);
      } catch (e) {
        console.error('  Failed to save:', e.message);
      }
    }
  }

  await browser.close();
}

searchPexels().catch(console.error);

