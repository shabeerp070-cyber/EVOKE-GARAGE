import sharp from 'sharp';

async function traceRoomMasks() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero.backup.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const mask = Buffer.alloc(width * height * 3, 0);

  // Circular logo
  const cx = 387.5;
  const cy = 326.0;
  const rx = 69.0;
  const ry = 69.0;

  // Let us accurately define the ceiling line for each X
  function getCeilingY(x) {
    if (x < 65) return 85 + (x / 65) * 15; // 85 to 100
    if (x < 135) return 100 + ((x - 65) / 70) * 28; // 100 to 128 (bottom of angled lightbox)
    if (x < 175) return 128 - ((x - 135) / 40) * 18; // 128 to 110
    if (x < 248) return 110 - ((x - 175) / 73) * 10; // 110 to 100
    if (x <= 542) return 100 - ((x - 248) / (542 - 248)) * 22; // 100 to 78
    return 78; // 542 to 576
  }

  // Let us accurately define the bottom wall limit for each X
  function getBottomY(x) {
    if (x < 138) return 240; // Tool rack top
    if (x < 248) return 242; // Cabinet roof
    if (x <= 475) return 413; // Shelf top
    if (x < 485) return 413 - ((x - 475) / 10) * (413 - 377);
    if (x < 495) return 377 - ((x - 485) / 10) * (377 - 361);
    if (x < 509) return 361 - ((x - 495) / 14) * (361 - 352);
    if (x <= 523) return 352;
    if (x <= 542) return 352 + ((x - 523) / (542 - 523)) * (364 - 352);
    return 364 + ((x - 542) / (576 - 542)) * 16;
  }

  for (let y = 0; y < 500; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const ceilY = getCeilingY(x);
      const botY = getBottomY(x);

      // Check logo
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (normDist <= 1.0) {
        // Red for circular logo (protected)
        mask[idx] = 255;
        mask[idx + 1] = 0;
        mask[idx + 2] = 0;
        continue;
      }

      if (y >= ceilY && y <= botY) {
        // Green for wall area to be made white
        // Color code by zone:
        if (x < 138) {
          mask[idx] = 0;
          mask[idx + 1] = 255; // Zone 1: Left side wall (Pure Green)
          mask[idx + 2] = 0;
        } else if (x < 248) {
          mask[idx] = 0;
          mask[idx + 1] = 255; // Zone 2: Left rear wall (Cyan)
          mask[idx + 2] = 255;
        } else if (x <= 542) {
          mask[idx] = 255;
          mask[idx + 1] = 255; // Zone 3: Center rear wall (White)
          mask[idx + 2] = 255;
        } else {
          mask[idx] = 255;
          mask[idx + 1] = 255; // Zone 4: Right side wall (Yellow)
          mask[idx + 2] = 0;
        }
      } else {
        // Dim original photo in background
        mask[idx] = Math.round(data[idx] * 0.4);
        mask[idx + 1] = Math.round(data[idx + 1] * 0.4);
        mask[idx + 2] = Math.round(data[idx + 2] * 0.4);
      }
    }
  }

  await sharp(mask, { raw: { width, height, channels: 3 } })
    .extract({ left: 0, top: 0, width: 576, height: 460 })
    .toFile('scripts/mask-verification-upper.png');

  console.log('Saved scripts/mask-verification-upper.png');
}

traceRoomMasks().catch(console.error);

