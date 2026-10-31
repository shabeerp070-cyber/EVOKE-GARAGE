import sharp from 'sharp';

async function buildPerfectHero() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const out = Buffer.from(data);

  // Logo parameters
  const cx = 387.5;
  const cy = 326.0;
  const rx = 67.5;
  const ry = 68.0;

  // Accurate technician contour mapping for x > 460, y > 345
  function getTechLeft(y) {
    if (y < 348) return 545; // No technician above y=348
    if (y < 352) return 510 - (y - 348) * 6; // 510 to 486
    if (y < 360) return 486 - (y - 352) * 0.75; // 486 to 480
    if (y < 370) return 480 - (y - 360) * 0.1; // 480 to 479
    if (y < 380) return 479 - (y - 370) * 0.5; // 479 to 474
    if (y < 390) return 474 - (y - 380) * 0.1; // 474 to 473
    if (y < 400) return 473 - (y - 390) * 0.2; // 473 to 471
    if (y < 410) return 471;
    if (y < 415) return 471 - (y - 410) * 1.4; // 471 to 464
    return 464;
  }

  // Pseudo-random deterministic noise generator for natural grain
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // -1 to 1
  }

  for (let y = 70; y < 460; y++) {
    for (let x = 248; x <= 544; x++) {
      const idx = (y * width + x) * 3;

      // 1. Check distance to circular logo
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);

      // INSIDE LOGO: PRESERVE EXACTLY (100% UNTOUCHED ORIGINAL PIXELS)
      if (normDist <= 1.0) {
        continue;
      }

      // 2. Ceiling boundary: slopes from y = 100 at x = 250 to y = 78 at x = 542
      const ceilY = 100 - ((x - 250) / (542 - 250)) * 22;
      if (y < ceilY) {
        continue;
      }

      // 3. Left and right boundaries:
      if (x < 250 || x > 542) {
        continue;
      }

      // 4. Technician boundary:
      const techX = getTechLeft(y);
      if (x >= techX) {
        continue;
      }

      // 5. Bottom boundaries:
      // Left of shelves (car roof): x from 250 to 295, slopes from 438 to 448
      // Shelf top: x from 295 to techX, y = 413
      let bottomY = 413;
      if (x < 295) {
        bottomY = 438 + ((x - 250) / 45) * 10;
      }
      if (y > bottomY) {
        continue;
      }

      // Feathering weight near edges for clean optical blending
      let weight = 1.0;

      // Top ceiling beam feathering (3px)
      if (y - ceilY < 3) {
        weight = Math.min(weight, (y - ceilY) / 3);
      }
      // Left vertical groove feathering (2.5px)
      if (x - 250 < 2.5) {
        weight = Math.min(weight, (x - 250) / 2.5);
      }
      // Right vertical corner post feathering (2.5px)
      if (542 - x < 2.5) {
        weight = Math.min(weight, (542 - x) / 2.5);
      }
      // Bottom shelf / car roof feathering (2.5px)
      if (bottomY - y < 2.5) {
        weight = Math.min(weight, (bottomY - y) / 2.5);
      }
      // Technician edge feathering (2.5px)
      if (techX - x < 2.5) {
        weight = Math.min(weight, (techX - x) / 2.5);
      }

      // Logo antialiasing transition (outermost gold border meets white wall)
      // Smooth 1.5px transition: from normDist 1.0 to 1.025
      if (normDist < 1.025) {
        weight *= (normDist - 1.0) / 0.025;
      }

      if (weight <= 0) continue;

      // Photorealistic lighting model:
      // Vertical gradient from daylight ceiling wash: 247 down to 228
      const vertNorm = (y - 78) / (413 - 78);
      let lum = 247 - vertNorm * 19;

      // Horizontal subtle gradient (center under lights is subtly brighter)
      const horizNorm = (x - 396) / 146;
      lum -= Math.abs(horizNorm) * 6;

      // Ambient contact shadows:
      // Top ceiling beam shadow
      if (y - ceilY < 10) {
        const ceilShadow = (1 - (y - ceilY) / 10) * 14;
        lum -= ceilShadow;
      }
      // Left corner seam shadow
      if (x - 250 < 10) {
        const leftShadow = (1 - (x - 250) / 10) * 12;
        lum -= leftShadow;
      }
      // Right corner seam shadow
      if (542 - x < 10) {
        const rightShadow = (1 - (542 - x) / 10) * 12;
        lum -= rightShadow;
      }
      // Bottom shelf contact shadow
      if (bottomY - y < 8) {
        const bottomShadow = (1 - (bottomY - y) / 8) * 10;
        lum -= bottomShadow;
      }

      // Subtle physical cast shadow from circular logo plaque:
      // Plaque is 3D with light from above:
      const shadowCx = cx;
      const shadowCy = cy + 2.5;
      const shadowDist = Math.hypot((x - shadowCx) / rx, (y - shadowCy) / ry);
      if (shadowDist > 1.0 && shadowDist < 1.18) {
        const angle = Math.atan2(y - cy, x - cx);
        const downwards = Math.max(0, Math.sin(angle));
        const shadowFactor = (1.18 - shadowDist) / 0.18;
        const dropShadow = shadowFactor * shadowFactor * (16 * downwards + 6);
        lum -= dropShadow;
      }

      // Natural micro-grain texture
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
    .toFile('scripts/preview-hero-white-wall.jpg');

  console.log('Saved scripts/preview-hero-white-wall.jpg');
}

buildPerfectHero().catch(console.error);

