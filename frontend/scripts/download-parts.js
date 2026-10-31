import puppeteer from 'puppeteer-core';
import fs from 'fs';
import sharp from 'sharp';

async function downloadMore() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  const photos = [
    { id: '14615263', url: 'https://images.pexels.com/photos/14615263/pexels-photo-14615263.jpeg?auto=compress&cs=tinysrgb&w=1600' },
    { id: '14615269', url: 'https://images.pexels.com/photos/14615269/pexels-photo-14615269.jpeg?auto=compress&cs=tinysrgb&w=1600' }
  ];

  for (const p of photos) {
    try {
      console.log(`Fetching ${p.id}...`);
      const view = await page.goto(p.url);
      const rawBuf = await view.buffer();
      await sharp(rawBuf)
        .jpeg({ quality: 90 })
        .toFile(`scripts/candidate_${p.id}.jpg`);
      console.log(`Saved scripts/candidate_${p.id}.jpg`);
    } catch (e) {
      console.error(`Error ${p.id}:`, e.message);
    }
  }

  await browser.close();
}

downloadMore().catch(console.error);

