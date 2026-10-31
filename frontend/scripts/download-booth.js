import fs from 'fs';

async function downloadImages() {
  const images = [
    {
      name: 'pintado_de_coches.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Pintado_de_coches.jpg'
    },
    {
      name: 'zobjack_lackiererei.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Zobjack_Lackiererei.jpg'
    }
  ];

  for (const item of images) {
    console.log(`Downloading ${item.name}...`);
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(`scripts/${item.name}`, buf);
    console.log(`Saved scripts/${item.name}: ${buf.length} bytes`);
  }
}

downloadImages().catch(console.error);

