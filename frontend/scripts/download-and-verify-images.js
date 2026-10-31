import fs from 'fs';
import path from 'path';

const urls = [
  { name: 'hero', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80' },
  { name: 'paint', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80' },
  { name: 'body', url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=800&q=80' },
  { name: 'ac', url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80' },
  { name: 'electrical', url: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80' },
  { name: 'car1', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80' },
  { name: 'car2', url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80' }
];

const dir = 'scripts/image-checks';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function checkAll() {
  for (const item of urls) {
    try {
      console.log(`Downloading ${item.name}...`);
      const res = await fetch(item.url);
      const buffer = Buffer.from(await res.arrayBuffer());
      const dest = path.join(dir, `${item.name}.jpg`);
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${dest}, size: ${buffer.length}`);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
}

checkAll();

