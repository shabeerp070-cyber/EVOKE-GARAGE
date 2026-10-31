import fs from 'fs';
import sharp from 'sharp';

async function getFileInfo(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
    }
  });
  const data = await res.json();
  const pages = data.query?.pages || {};
  for (const k in pages) {
    return pages[k].imageinfo?.[0];
  }
}

async function testFiles() {
  const files = [
    'File:Lackiererei.jpg',
    'File:BMW Leipzig MEDIA 050719 Download Lackiererei 2 max.jpg',
    'File:Automotive Paint Booth.jpg',
    'File:Spray booth.jpg'
  ];

  for (const f of files) {
    const info = await getFileInfo(f);
    if (!info) continue;
    console.log(f, info.width + 'x' + info.height, info.url);
    const res = await fetch(info.url, {
      headers: {
        'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
      }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const safeName = f.replace(/[^a-zA-Z0-9]/g, '_') + '.jpg';
    fs.writeFileSync(`scripts/${safeName}`, buf);

    await sharp(`scripts/${safeName}`)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(`scripts/preview_${safeName}`);
    console.log(`Saved scripts/preview_${safeName}`);
  }
}

testFiles().catch(console.error);

