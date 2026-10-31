import puppeteer from 'puppeteer-core';

async function checkFiles() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  const files = [
    'https://commons.wikimedia.org/wiki/File:Pintado_de_coches.jpg',
    'https://commons.wikimedia.org/wiki/File:Zobjack_Lackiererei.jpg'
  ];

  for (const url of files) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('upload.wikimedia.org/wikipedia/commons/'));
    });
    console.log(url, links.slice(0, 5));
  }

  await browser.close();
}

checkFiles().catch(console.error);
