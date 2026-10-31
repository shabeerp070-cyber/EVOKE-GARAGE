import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function searchPexels() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  console.log('Navigating to Pexels spray painting car...');
  await page.goto('https://www.pexels.com/search/spray%20painting%20car/', { waitUntil: 'networkidle2', timeout: 30000 });

  const photos = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('article, [data-testid="item"]'));
    return cards.map(c => {
      const img = c.querySelector('img');
      return {
        alt: img ? img.alt : '',
        src: img ? img.src : ''
      };
    }).filter(p => p.src);
  });

  console.log('Photos found:', photos.length);
  photos.slice(0, 15).forEach((p, idx) => console.log(idx, p.alt, p.src));

  // Download the top 5 candidates at w=1260
  for (let i = 0; i < Math.min(5, photos.length); i++) {
    const p = photos[i];
    const fullUrl = p.src.split('?')[0] + '?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    console.log(`Downloading candidate ${i}: ${p.alt}...`);
    try {
      const res = await page.goto(fullUrl);
      const buf = await res.buffer();
      fs.writeFileSync(`scripts/pexels_candidate_${i}.jpg`, buf);
      console.log(`Saved scripts/pexels_candidate_${i}.jpg (${buf.length} bytes)`);
    } catch (e) {
      console.error(`Error downloading candidate ${i}:`, e.message);
    }
  }

  await browser.close();
}

searchPexels().catch(console.error);
