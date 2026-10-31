import sharp from 'sharp';

async function mapWallArea() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Let's create an overlay image marking:
  // - The wall region candidate
  // - The logo region candidate
  // - The surrounding workshop objects (lights, ceiling, shelves, technician)

  // Circular logo parameters:
  const cx = 387.5;
  const cy = 326.0;
  const rx = 67.5;
  const ry = 68.0;

  // Let's see how close the outer ring is:
  // Points with ((x - cx)/rx)^2 + ((y - cy)/ry)^2 <= 1.0 are INSIDE the logo!
  // Points slightly beyond, say radius ~ 68.5 to 70, are the outer golden edge / antialiasing.
  
  // Let's test a mask and visualize it on scripts/wall-mask-preview.png
  const mask = Buffer.alloc(width * height * 3);

  for (let y = 0; y < 600; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      const isInsideLogo = normDist <= 1.02;

      mask[idx] = r;
      mask[idx + 1] = g;
      mask[idx + 2] = b;

      if (isInsideLogo) {
        // Leave original logo pixels untouched!
      } else if (x >= 250 && x <= 542 && y >= 170 && y <= 430) {
        // Highlight wall test area in red
        mask[idx] = Math.min(255, r + 100);
      }
    }
  }

  await sharp(mask, { raw: { width, height: 600, channels: 3 } })
    .toFile('scripts/wall-mask-preview.png');

  console.log('Saved scripts/wall-mask-preview.png');
}

mapWallArea().catch(console.error);

