import sharp from 'sharp';

async function scanLines() {
  const { data, info } = await sharp('scripts/wall-crop-original.png').raw().toBuffer({ resolveWithObject: true });

  // Let's inspect the center area x: 50 to 330 (which corresponds to full image x: 230 to 510)
  for (let y = 10; y < 180; y += 5) {
    let brightCount = 0;
    let minX = 999, maxX = 0;
    for (let x = 40; x < 340; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const lum = 0.299*r + 0.587*g + 0.114*b;
      if (lum > 85) {
        brightCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    if (brightCount > 0) {
      console.log(`cropY=${y} (fullY=${100+y}): count=${brightCount}, xSpan=[${minX}..${maxX}] (fullX=[${180+minX}..${180+maxX}])`);
    } else {
      console.log(`cropY=${y} (fullY=${100+y}): clean wall`);
    }
  }
}

scanLines().catch(console.error);

