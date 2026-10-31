import fs from 'fs';
import sharp from 'sharp';

async function downloadThumbs() {
  const ids = ['99569', '99568', '99567', '99566', '99565', '99564', '99563', '99562', '99561', '99560', '99559', '99558'];
  for (const id of ids) {
    try {
      const url = `https://pngimg.com/uploads/bmw/small/bmw_PNG${id}.png`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 1000) {
        fs.writeFileSync(`scripts/bmw_${id}.png`, Buffer.from(buf));
        console.log(`Downloaded ${id} (${buf.byteLength} bytes)`);
      }
    } catch (e) {
      console.error(id, e.message);
    }
  }
}
downloadThumbs();

