import sharp from 'sharp';

async function buildMasterHero2() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const out = Buffer.from(data);

  // Circular logo parameters
  const cx = 387.5;
  const cy = 326.0;
  const rx = 67.5;
  const ry = 68.0;

  // Natural technician curve
  function getTechLimit(y) {
    if (y < 348) return 542; // Above y=348: full wall to corner post x=542
    if (y < 360) return 542 - ((y - 348) / 12) * 44; // 542 curves down to 498
    if (y < 370) return 498 - ((y - 360) / 10) * 16; // 498 curves down to 482
    if (y < 382) return 482 - ((y - 370) / 12) * 8;  // 482 curves down to 474
    if (y < 396) return 474 - ((y - 382) / 14) * 6;  // 474 curves down to 468
    if (y < 408) return 468 - ((y - 396) / 12) * 4;  // 468 curves down to 464
    return 464; // y >= 408 meets shelf
  }

  // Deterministic noise for natural photo micro-grain
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // -1 to 1
  }

  for (let y = 70; y <= 415; y++) {
    for (let x = 248; x <= 544; x++) {
      const idx = (y * width + x) * 3;

      // 1. Check distance to circular logo
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);

      // INSIDE LOGO: PRESERVE 100% UNTOUCHED ORIGINAL PIXELS
      if (normDist <= 1.0) {
        continue;
      }

      // 2. Ceiling boundary:
      // Slopes from y = 100 at x = 250 to y = 78 at x = 542
      const ceilY = 100 - ((x - 250) / (542 - 250)) * 22;
      if (y < ceilY) {
        continue;
      }

      // 3. Left and right wall panel seams
      if (x < 250 || x > 542) {
        continue;
      }

      // 4. Technician boundary
      const techX = getTechLimit(y);
      if (x >= techX) {
        continue;
      }

      // 5. Bottom horizontal cabinet & shelves line (y = 413)
      const bottomY = 413;
      if (y > bottomY) {
        continue;
      }

      // Feathering weight near edges for seamless integration
      let weight = 1.0;

      // Top ceiling beam contact feathering (2.5px)
      if (y - ceilY < 2.5) {
        weight = Math.min(weight, (y - ceilY) / 2.5);
      }
      // Left vertical seam feathering (2.5px)
      if (x - 250 < 2.5) {
        weight = Math.min(weight, (x - 250) / 2.5);
      }
      // Right vertical beam feathering (2.5px)
      if (542 - x < 2.5) {
        weight = Math.min(weight, (542 - x) / 2.5);
      }
      // Bottom cabinet frame feathering (2.5px)
      if (bottomY - y < 2.5) {
        weight = Math.min(weight, (bottomY - y) / 2.5);
      }
      // Technician hair/glasses edge feathering (3px)
      if (techX - x < 3.0) {
        weight = Math.min(weight, (techX - x) / 3.0);
      }

      // Logo antialiasing transition (outermost gold border meets white wall)
      // Smooth 1.5px transition: from normDist 1.0 to 1.025
      if (normDist < 1.025) {
        weight *= (normDist - 1.0) / 0.025;
      }

      if (weight <= 0) continue;

      // Realistic workshop lighting model:
      // Vertical gradient from daylight ceiling wash: 247 down to 229
      const vertNorm = (y - 78) / (413 - 78);
      let lum = 247 - vertNorm * 18;

      // Subtle horizontal center lighting (highest under the ceiling panel centers)
      const horizNorm = (x - 396) / 146;
      lum -= Math.abs(horizNorm) * 5;

      // Ambient contact shadows:
      // Top ceiling beam shadow
      if (y - ceilY < 9) {
        const ceilShadow = (1 - (y - ceilY) / 9) * 14;
        lum -= ceilShadow;
      }
      // Left corner seam shadow
      if (x - 250 < 9) {
        const leftShadow = (1 - (x - 250) / 9) * 12;
        lum -= leftShadow;
      }
      // Right corner beam shadow
      if (542 - x < 9) {
        const rightShadow = (1 - (542 - x) / 9) * 12;
        lum -= rightShadow;
      }
      // Bottom shelf contact shadow
      if (bottomY - y < 8) {
        const bottomShadow = (1 - (bottomY - y) / 8) * 10;
        lum -= bottomShadow;
      }

      // Subtle physical cast shadow from circular logo plaque:
      const shadowCx = cx;
      const shadowCy = cy + 2.5; // slight downward offset
      const shadowDist = Math.hypot((x - shadowCx) / rx, (y - shadowCy) / ry);
      if (shadowDist > 1.0 && shadowDist < 1.18) {
        const angle = Math.atan2(y - cy, x - cx);
        const downwards = Math.max(0, Math.sin(angle));
        const shadowFactor = (1.18 - shadowDist) / 0.18;
        const dropShadow = shadowFactor * shadowFactor * (16 * downwards + 5);
        lum -= dropShadow;
      }

      // Natural micro-grain texture (+/- 2.2)
      lum += noise(x, y) * 2.2;

      // Clamp luminance
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

  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile('scripts/preview-master-white-wall-2.jpg');

  console.log('Saved scripts/preview-master-white-wall-2.jpg');
}

buildMasterHero2().catch(console.error);

