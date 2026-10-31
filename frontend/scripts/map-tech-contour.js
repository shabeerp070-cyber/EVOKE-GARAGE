import sharp from 'sharp';

async function mapTechnicianContour() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Let's create an annotated crop of the technician to see the boundary
  const cropW = 100, cropH = 120;
  const cropLeft = 450, cropTop = 330;
  
  // In this region, let's analyze every pixel
  const buf = Buffer.alloc(cropW * cropH * 3);

  for (let cy = 0; cy < cropH; cy++) {
    for (let cx = 0; cx < cropW; cx++) {
      const fullX = cropLeft + cx;
      const fullY = cropTop + cy;
      const fullIdx = (fullY * width + fullX) * 3;
      const outIdx = (cy * cropW + cx) * 3;

      const r = data[fullIdx];
      const g = data[fullIdx + 1];
      const b = data[fullIdx + 2];

      buf[outIdx] = r;
      buf[outIdx + 1] = g;
      buf[outIdx + 2] = b;
    }
  }

  await sharp(buf, { raw: { width: cropW, height: cropH, channels: 3 } })
    .toFile('scripts/tech-contour-test.png');

  console.log('Saved scripts/tech-contour-test.png');
}

mapTechnicianContour().catch(console.error);

