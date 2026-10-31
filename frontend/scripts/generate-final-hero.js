import sharp from 'sharp';
import fs from 'fs';

async function generateFinalHero() {
  console.log('Generating final hero image with white workshop wall and preserved black logo...');
  
  const { data, info } = await sharp('public/images/evoke-workshop-hero.backup.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const out = Buffer.from(data);

  // Exact measured coordinates of the circular EVOKE GARAGE emblem
  const cx = 387.5;
  const cy = 326.0;
  const rx = 69.0;
  const ry = 69.0;

  // Exact natural boundary of the technician and cabinet
  function getHeadTopY(x) {
    if (x <= 475) return 413;
    if (x < 485) return 413 - ((x - 475) / 10) * (413 - 377);
    if (x < 495) return 377 - ((x - 485) / 10) * (377 - 361);
    if (x < 509) return 361 - ((x - 495) / 14) * (361 - 352);
    if (x <= 523) return 352;
    return 352 + ((x - 523) / (542 - 523)) * (364 - 352);
  }

  // Micro-grain generator for authentic photo texture
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  for (let y = 70; y <= 415; y++) {
    for (let x = 248; x <= 544; x++) {
      const idx = (y * width + x) * 3;

      // 1. INSIDE CIRCULAR LOGO: PRESERVE 100% UNTOUCHED ORIGINAL PIXELS
      // Keeps original black background, car symbol, gold border, and text completely intact
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (normDist <= 1.0) {
        continue;
      }

      // 2. Ceiling boundary: follows the ceiling lighting frame beam
      const ceilY = 100 - ((x - 250) / (542 - 250)) * 22;
      if (y < ceilY) {
        continue;
      }

      // 3. Left and right wall seams
      if (x < 250 || x > 542) {
        continue;
      }

      // 4. Bottom boundary (cabinet top or technician head contour)
      const bottomLimit = getHeadTopY(x);
      if (y > bottomLimit) {
        continue;
      }

      // Feathering weight for seamless edge blending
      let weight = 1.0;
      if (y - ceilY < 2.5) weight = Math.min(weight, (y - ceilY) / 2.5);
      if (x - 250 < 2.5) weight = Math.min(weight, (x - 250) / 2.5);
      if (542 - x < 2.5) weight = Math.min(weight, (542 - x) / 2.5);
      if (bottomLimit - y < 3.0) weight = Math.min(weight, (bottomLimit - y) / 3.0);

      // Logo antialiasing transition (outermost gold border meets white wall)
      if (normDist < 1.025) {
        weight *= (normDist - 1.0) / 0.025;
      }

      if (weight <= 0) continue;

      // Realistic workshop lighting model:
      // Vertical gradient from daylight ceiling wash: 247 down to 229
      const vertNorm = (y - 78) / (413 - 78);
      let lum = 247 - vertNorm * 18;

      // Center lighting under ceiling light bays
      const horizNorm = (x - 396) / 146;
      lum -= Math.abs(horizNorm) * 5;

      // Ambient contact shadows around beams and cabinet
      if (y - ceilY < 9) lum -= (1 - (y - ceilY) / 9) * 14;
      if (x - 250 < 9) lum -= (1 - (x - 250) / 9) * 12;
      if (542 - x < 9) lum -= (1 - (542 - x) / 9) * 12;
      if (bottomLimit - y < 8 && x < 475) lum -= (1 - (bottomLimit - y) / 8) * 10;

      // Subtle physical cast shadow from the circular logo plaque
      const shadowCx = cx;
      const shadowCy = cy + 2.5;
      const shadowDist = Math.hypot((x - shadowCx) / rx, (y - shadowCy) / ry);
      if (shadowDist > 1.0 && shadowDist < 1.18) {
        const angle = Math.atan2(y - cy, x - cx);
        const downwards = Math.max(0, Math.sin(angle));
        const shadowFactor = (1.18 - shadowDist) / 0.18;
        lum -= shadowFactor * shadowFactor * (16 * downwards + 5);
      }

      // Micro-grain texture for physical photographic fidelity
      lum += noise(x, y) * 2.2;
      lum = Math.max(160, Math.min(252, lum));

      // Neutral daylight atelier white (5500K)
      const targetR = Math.round(lum);
      const targetG = Math.round(lum);
      const targetB = Math.min(255, Math.round(lum + 2));

      // Alpha composite over original image pixels
      out[idx] = Math.round(data[idx] * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(data[idx + 1] * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(data[idx + 2] * (1 - weight) + targetB * weight);
    }
  }

  const outputPath = 'public/images/evoke-workshop-hero-clean.jpg';
  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile(outputPath);

  console.log(`Successfully written to ${outputPath}`);

  if (fs.existsSync('dist/images/evoke-workshop-hero-clean.jpg')) {
    fs.copyFileSync(outputPath, 'dist/images/evoke-workshop-hero-clean.jpg');
    console.log('Synchronized to dist/images/evoke-workshop-hero-clean.jpg');
  }
}

generateFinalHero().catch(console.error);

