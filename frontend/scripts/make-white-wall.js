import sharp from 'sharp';

async function generatePhotorealisticWhiteWall() {
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

  // Technician silhouette function
  // Returns true if (x, y) is part of the technician
  function isTechnician(x, y) {
    if (x < 460 || y < 340) return false;

    // Polynomial / piecewise curve for technician head/neck/mask boundary
    // y from 340 to 440:
    // y = 345: x >= 530
    // y = 350: x >= 505
    // y = 360: x >= 485
    // y = 370: x >= 472
    // y = 380: x >= 468
    // y = 390: x >= 464
    // y = 400: x >= 462
    // y = 410: x >= 468
    // y = 420: x >= 478
    // y = 430: x >= 488
    // y = 440: x >= 495
    let techX = 545;
    if (y < 350) {
      techX = 545 - ((y - 340) / 10) * 40; // 545 down to 505
    } else if (y < 360) {
      techX = 505 - ((y - 350) / 10) * 20; // 505 down to 485
    } else if (y < 370) {
      techX = 485 - ((y - 360) / 10) * 13; // 485 down to 472
    } else if (y < 380) {
      techX = 472 - ((y - 370) / 10) * 4;  // 472 down to 468
    } else if (y < 390) {
      techX = 468 - ((y - 380) / 10) * 4;  // 468 down to 464
    } else if (y < 400) {
      techX = 464 - ((y - 390) / 10) * 2;  // 464 down to 462
    } else if (y < 410) {
      techX = 462 + ((y - 400) / 10) * 6;  // 462 up to 468
    } else if (y < 420) {
      techX = 468 + ((y - 410) / 10) * 10; // 468 up to 478
    } else if (y < 430) {
      techX = 478 + ((y - 420) / 10) * 10; // 478 up to 488
    } else {
      techX = 488 + ((y - 430) / 10) * 8;  // 488 up to 496
    }

    return x >= techX;
  }

  // Pseudo-random deterministic noise generator for natural grain
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // -1 to 1
  }

  for (let y = 80; y < 450; y++) {
    for (let x = 245; x <= 545; x++) {
      const idx = (y * width + x) * 3;

      // 1. Check distance to circular logo
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);

      // INSIDE LOGO: PRESERVE EXACTLY (100% UNTOUCHED)
      if (normDist <= 1.0) {
        continue;
      }

      // 2. Ceiling boundary:
      // At x = 250: y = 100
      // At x = 542: y = 116
      const ceilY = 100 + ((x - 250) / (542 - 250)) * 16;
      if (y < ceilY) {
        continue;
      }

      // 3. Left and right boundaries:
      if (x < 250 || x > 542) {
        continue;
      }

      // 4. Technician check
      if (isTechnician(x, y)) {
        continue;
      }

      // 5. Bottom boundaries:
      // Shelf top line: y ~ 414 for x between 295 and 470
      // Car roof: for x between 250 and 295, y ~ 428 to 418
      let bottomY = 414;
      if (x < 295) {
        bottomY = 428 - ((x - 250) / 45) * 14;
      }
      if (y > bottomY) {
        continue;
      }

      // Compute feathering weight near edges for natural seamless integration
      let weight = 1.0;

      // Top feathering (4px)
      if (y - ceilY < 4) {
        weight = Math.min(weight, (y - ceilY) / 4);
      }
      // Left feathering (3px)
      if (x - 250 < 3) {
        weight = Math.min(weight, (x - 250) / 3);
      }
      // Right feathering (3px)
      if (542 - x < 3) {
        weight = Math.min(weight, (542 - x) / 3);
      }
      // Bottom feathering (3px)
      if (bottomY - y < 3) {
        weight = Math.min(weight, (bottomY - y) / 3);
      }

      // Technician edge feathering (3px)
      // Check distance to technician edge
      for (let dx = 1; dx <= 3; dx++) {
        if (isTechnician(x + dx, y)) {
          weight = Math.min(weight, (4 - dx) / 4);
          break;
        }
      }

      // Logo antialiasing transition (outermost gold border meets white wall)
      // Transition over 1.5 pixels: from normDist 1.0 to 1.025
      if (normDist < 1.025) {
        weight *= (normDist - 1.0) / 0.025;
      }

      if (weight <= 0) continue;

      // Photorealistic lighting calculation:
      // 1. Vertical daylight gradient from ceiling wash
      const vertNorm = (y - 100) / (414 - 100); // 0 at top, 1 at bottom
      let lum = 246 - vertNorm * 22; // 246 down to 224

      // 2. Horizontal brightness (subtle center hotspot under ceiling lights)
      const horizNorm = (x - 396) / 146; // -1 to 1
      lum -= Math.abs(horizNorm) * 8; // subtle 8 unit falloff to edges

      // 3. Ambient occlusion contact shadows:
      // Top ceiling beam shadow
      if (y - ceilY < 12) {
        const ceilShadow = (1 - (y - ceilY) / 12) * 14;
        lum -= ceilShadow;
      }
      // Left corner post shadow
      if (x - 250 < 12) {
        const leftShadow = (1 - (x - 250) / 12) * 12;
        lum -= leftShadow;
      }
      // Right corner post shadow
      if (542 - x < 12) {
        const rightShadow = (1 - (542 - x) / 12) * 12;
        lum -= rightShadow;
      }
      // Bottom shelf contact shadow
      if (bottomY - y < 10) {
        const bottomShadow = (1 - (bottomY - y) / 10) * 10;
        lum -= bottomShadow;
      }

      // 4. Subtle physical cast shadow from circular logo plaque:
      // Light is from above-front, so shadow falls slightly downwards
      const shadowCx = cx;
      const shadowCy = cy + 3.0; // slight downward offset
      const shadowDist = Math.hypot((x - shadowCx) / rx, (y - shadowCy) / ry);
      if (shadowDist > 1.0 && shadowDist < 1.20) {
        // Shadow strength highest just below the bottom edge of the plaque
        const angle = Math.atan2(y - cy, x - cx); // positive downwards
        const downwards = Math.max(0, Math.sin(angle)); // 1 directly below, 0 sideways
        const shadowFactor = (1.20 - shadowDist) / 0.20;
        const dropShadow = shadowFactor * shadowFactor * (18 * downwards + 8);
        lum -= dropShadow;
      }

      // 5. Natural micro-grain texture (+/- 2.5)
      const grain = noise(x, y) * 2.5;
      lum += grain;

      // Clamp luminance
      lum = Math.max(160, Math.min(252, lum));

      // Neutral crisp cleanroom white color tone:
      // Subtle daylight balance (5500K: R ~ lum, G ~ lum, B ~ lum + 2)
      const targetR = Math.round(lum);
      const targetG = Math.round(lum);
      const targetB = Math.min(255, Math.round(lum + 2));

      // Alpha composite over original
      out[idx] = Math.round(data[idx] * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(data[idx + 1] * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(data[idx + 2] * (1 - weight) + targetB * weight);
    }
  }

  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toFile('scripts/photorealistic-white-wall.jpg');

  console.log('Saved scripts/photorealistic-white-wall.jpg');
}

generatePhotorealisticWhiteWall().catch(console.error);

