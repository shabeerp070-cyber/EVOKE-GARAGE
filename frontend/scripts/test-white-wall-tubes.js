import sharp from 'sharp';

async function testWhiteWallWithTubes() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero.backup.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const out = Buffer.from(data);

  const cx = 387.5;
  const cy = 326.0;
  const rx = 69.0;
  const ry = 69.0;

  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  function getCeilingY(x) {
    if (x < 65) return 85 + (x / 65) * 15;
    if (x < 135) return 100 + ((x - 65) / 70) * 28;
    if (x < 175) return 128 - ((x - 135) / 40) * 18;
    if (x < 248) return 110 - ((x - 175) / 73) * 10;
    if (x <= 542) return 100 - ((x - 248) / (542 - 248)) * 22;
    return 78;
  }

  function getBottomY(x) {
    if (x < 138) return 240;
    if (x < 248) return 242;
    if (x <= 475) return 413;
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
      const origR = data[idx];
      const origG = data[idx + 1];
      const origB = data[idx + 2];

      // 1. CIRCULAR LOGO: PRESERVED 100% UNTOUCHED
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (normDist <= 1.0) continue;

      const ceilY = getCeilingY(x);
      const botY = getBottomY(x);

      if (y < ceilY || y > botY) continue;

      // Soft edge feathering near ceiling and objects
      let weight = 1.0;
      if (y - ceilY < 3.0) weight = Math.min(weight, (y - ceilY) / 3.0);
      if (botY - y < 3.0) weight = Math.min(weight, (botY - y) / 3.0);
      if (normDist < 1.025) weight *= (normDist - 1.0) / 0.025;

      if (weight <= 0) continue;

      // 2. Base white wall luminance
      const vertNorm = Math.min(1.0, Math.max(0.0, (y - 78) / (413 - 78)));
      let lum = 246 - vertNorm * 18;

      // Zone specific lighting
      if (x < 138) {
        lum -= 6; // left side wall perspective
      } else if (x < 248) {
        lum -= 8; // left rear recessed panel
      } else if (x <= 542) {
        // Center wall: text area
        const horizNorm = (x - 396) / 146;
        lum -= Math.abs(horizNorm) * 5;

        // Plaque cast shadow
        const shadowCx = cx;
        const shadowCy = cy + 2.5;
        const shadowDist = Math.hypot((x - shadowCx) / rx, (y - shadowCy) / ry);
        if (shadowDist > 1.0 && shadowDist < 1.18) {
          const angle = Math.atan2(y - cy, x - cx);
          const downwards = Math.max(0, Math.sin(angle));
          const shadowFactor = (1.18 - shadowDist) / 0.18;
          lum -= shadowFactor * shadowFactor * (16 * downwards + 5);
        }
      } else {
        lum -= 4; // right wall
      }

      // Contact shadows
      if (y - ceilY < 8) lum -= (1 - (y - ceilY) / 8) * 12;
      if (botY - y < 8 && x < 475) lum -= (1 - (botY - y) / 8) * 10;

      // Micro-grain
      lum += noise(x, y) * 2.0;
      lum = Math.max(160, Math.min(252, lum));

      let targetR = Math.round(lum);
      let targetG = Math.round(lum);
      let targetB = Math.min(255, Math.round(lum + 2));

      // In zones with vertical tubes (x < 248 or x > 542):
      // Composite the tube's real light emission and physical structure!
      if (x < 248 || x > 542) {
        // Find if this pixel is tube / bracket / highlight
        const origBright = Math.max(origR, origG, origB);
        if (origBright > 90) {
          // If it's the bright tube or its highlight, additively blend over white wall:
          // For bright tube core: preserve authentic glowing tube
          const coreFactor = Math.min(1.0, Math.max(0.0, (origBright - 140) / 80));
          targetR = Math.round(targetR * (1 - coreFactor) + origR * coreFactor);
          targetG = Math.round(targetG * (1 - coreFactor) + origG * coreFactor);
          targetB = Math.round(targetB * (1 - coreFactor) + origB * coreFactor);
        } else if (origBright < 35 && (Math.abs(x - 30) < 6 || Math.abs(x - 105) < 6 || Math.abs(x - 235) < 6)) {
          // Dark mounting bracket / conduit: keep physical metal bracket visible
          const bracketW = 0.7;
          targetR = Math.round(origR * bracketW + targetR * (1 - bracketW));
          targetG = Math.round(origG * bracketW + targetG * (1 - bracketW));
          targetB = Math.round(origB * bracketW + targetB * (1 - bracketW));
        }
      }

      out[idx] = Math.round(origR * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(origG * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(origB * (1 - weight) + targetB * weight);
    }
  }

  // Save upper half crop to inspect
  await sharp(out, { raw: { width, height, channels: 3 } })
    .extract({ left: 0, top: 0, width: 576, height: 460 })
    .toFile('scripts/test-tubes-upper.png');

  console.log('Saved scripts/test-tubes-upper.png');
}

testWhiteWallWithTubes().catch(console.error);

