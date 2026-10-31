import sharp from 'sharp';

async function buildMasterHero() {
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

  // Exact technician edge table (y: 330 to 420)
  const techMap = {
    330: 496, 331: 495, 332: 495, 333: 495, 334: 495,
    335: 495, 336: 494, 337: 493, 338: 492, 339: 491,
    340: 493, 341: 494, 342: 490, 343: 490, 344: 490,
    345: 488, 346: 487, 347: 488, 348: 486, 349: 486,
    350: 486, 351: 486, 352: 487, 353: 487, 354: 486,
    355: 486, 356: 486, 357: 486, 358: 486, 359: 486,
    360: 486, 361: 486, 362: 486, 363: 486, 364: 486,
    365: 486, 366: 486, 367: 486, 368: 486, 369: 486,
    370: 486, 371: 486, 372: 486, 373: 484, 374: 485,
    375: 483, 376: 483, 377: 483, 378: 482, 379: 482,
    380: 480, 381: 478, 382: 478, 383: 481, 384: 480,
    385: 480, 386: 474, 387: 474, 388: 474, 389: 475,
    390: 476, 391: 474, 392: 475, 393: 475, 394: 475,
    395: 475, 396: 472, 397: 475, 398: 475, 399: 475,
    400: 475, 401: 475, 402: 475, 403: 475, 404: 477,
    405: 479, 406: 483, 407: 484, 408: 478, 409: 478,
    410: 478, 411: 475, 412: 473, 413: 473, 414: 473,
    415: 473, 416: 470, 417: 470, 418: 470, 419: 470,
    420: 470
  };

  function getTechLimit(y) {
    if (y < 330) return 542; // Above y=330, wall reaches corner beam
    if (y > 420) return 465; // Below y=420, shelf line meets technician arm
    return techMap[y] || 480;
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
      // Technician hair/glasses edge feathering (2.5px)
      if (techX - x < 2.5) {
        weight = Math.min(weight, (techX - x) / 2.5);
      }

      // Logo antialiasing transition (outermost gold border meets white wall)
      // Transition over 1.5 pixels: from normDist 1.0 to 1.025
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
    .toFile('scripts/preview-master-white-wall.jpg');

  console.log('Saved scripts/preview-master-white-wall.jpg');
}

buildMasterHero().catch(console.error);

