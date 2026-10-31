import sharp from 'sharp';

async function buildCompleteWhiteRoom() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero.backup.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const out = Buffer.from(data);

  // Circular logo parameters
  const cx = 387.5;
  const cy = 326.0;
  const rx = 69.0;
  const ry = 69.0;

  // Deterministic micro-grain noise
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  // Exact physical ceiling contour across all 576 columns
  function getCeilingY(x) {
    if (x < 60) return 78;
    if (x < 155) return 78 + ((x - 60) / 95) * 56; // 78 down to 134 (angled lightbox bottom edge)
    if (x < 175) return 134 - ((x - 155) / 20) * 54; // 134 up to 80
    if (x < 250) return 80 + ((x - 175) / 75) * 10;  // 80 to 90
    if (x <= 542) return 90 - ((x - 250) / (542 - 250)) * 12; // 90 to 78
    return 78; // 542 to 576
  }

  // Exact physical bottom wall boundary
  function getBottomY(x) {
    if (x < 138) return 240; // Tool rack top on left wall
    if (x < 248) return 242; // Cabinet roof on left rear wall
    if (x <= 475) return 413; // Tool shelf top on center wall
    // Technician head contour:
    if (x < 485) return 413 - ((x - 475) / 10) * (413 - 377);
    if (x < 495) return 377 - ((x - 485) / 10) * (377 - 361);
    if (x < 509) return 361 - ((x - 495) / 14) * (361 - 352);
    if (x <= 523) return 352;
    if (x <= 542) return 352 + ((x - 523) / (542 - 523)) * (364 - 352);
    return 364 + ((x - 542) / (576 - 542)) * 16; // Right wall behind technician
  }

  for (let y = 0; y < 500; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const origR = data[idx];
      const origG = data[idx + 1];
      const origB = data[idx + 2];

      // 1. CIRCULAR LOGO: PRESERVED 100% UNTOUCHED ORIGINAL PIXELS
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (normDist <= 1.0) continue;

      const ceilY = getCeilingY(x);
      const botY = getBottomY(x);

      // Outside wall vertical span
      if (y < ceilY || y > botY) continue;

      // Soft antialiased edge feathering
      let weight = 1.0;
      if (y - ceilY < 3.0) weight = Math.min(weight, (y - ceilY) / 3.0);
      if (botY - y < 3.0) weight = Math.min(weight, (botY - y) / 3.0);
      if (normDist < 1.025) weight *= (normDist - 1.0) / 0.025;

      if (weight <= 0) continue;

      // 2. Base Atelier White Wall Illumination
      // Vertical gradient from daylight ceiling wash: 247 down to 228
      const vertNorm = Math.min(1.0, Math.max(0.0, (y - 78) / (413 - 78)));
      let lum = 246 - vertNorm * 18;

      // Subtle horizontal perspective lighting per architectural wall section
      if (x < 138) {
        // Left side wall
        lum -= 4;
      } else if (x < 248) {
        // Left rear recessed wall
        lum -= 7;
      } else if (x <= 542) {
        // Main center rear wall
        const horizNorm = (x - 396) / 146;
        lum -= Math.abs(horizNorm) * 5;

        // Plaque cast shadow around circular logo
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
        // Right side wall
        lum -= 3;
      }

      // Contact shadows near ceiling and cabinets:
      if (y - ceilY < 8) lum -= (1 - (y - ceilY) / 8) * 12;
      if (botY - y < 7 && x < 475) lum -= (1 - (botY - y) / 7) * 10;

      // Architectural seams:
      // Corner column at x = 138 (between left wall and left rear wall)
      if (Math.abs(x - 138) <= 2) lum -= (3 - Math.abs(x - 138)) * 8;

      // Modular panel seam at x = 248 (above cabinet roof)
      if (Math.abs(x - 248) <= 2 && y <= 242) lum -= (3 - Math.abs(x - 248)) * 7;

      // Soft cabinet depth cast shadow to the right of x = 248 (y from 242 to 413)
      if (x >= 248 && x <= 258 && y > 242 && y <= 413) {
        const shadowDistX = (x - 248) / 10;
        lum -= (1 - shadowDistX) * (1 - shadowDistX) * 14;
      }

      // Corner post at x = 542 (between center wall and right wall)
      if (Math.abs(x - 542) <= 2) lum -= (3 - Math.abs(x - 542)) * 8;

      // Micro-grain texture for realistic physical paint
      lum += noise(x, y) * 2.0;
      lum = Math.max(160, Math.min(252, lum));

      let targetR = Math.round(lum);
      let targetG = Math.round(lum);
      let targetB = Math.min(255, Math.round(lum + 2));

      // 3. Composite Vertical Light Tubes & Brackets on Side Walls
      // (Zones: x < 248 and x > 542)
      if (x < 248 || x > 542) {
        const origMax = Math.max(origR, origG, origB);

        // Glowing tube core:
        if (origMax > 150) {
          // Softly blend tube light emission onto white wall
          const tubeAlpha = Math.min(1.0, (origMax - 150) / 60);
          targetR = Math.round(targetR * (1 - tubeAlpha) + origR * tubeAlpha);
          targetG = Math.round(targetG * (1 - tubeAlpha) + origG * tubeAlpha);
          targetB = Math.round(targetB * (1 - tubeAlpha) + origB * tubeAlpha);
        } else if (origMax > 60) {
          // Warm amber diffuse glow around tubes:
          const glowAlpha = (origMax - 60) / 90;
          targetR = Math.min(255, Math.round(targetR + (origR - 50) * 0.35 * glowAlpha));
          targetG = Math.min(255, Math.round(targetG + (origG - 40) * 0.25 * glowAlpha));
          targetB = Math.max(0, Math.round(targetB - 5 * glowAlpha));
        } else if (origMax < 35 && (Math.abs(x - 31) <= 4 || Math.abs(x - 107) <= 4)) {
          // Dark mounting bracket / conduit
          const bracketAlpha = 0.65;
          targetR = Math.round(origR * bracketAlpha + targetR * (1 - bracketAlpha));
          targetG = Math.round(origG * bracketAlpha + targetG * (1 - bracketAlpha));
          targetB = Math.round(origB * bracketAlpha + targetB * (1 - bracketAlpha));
        }
      }

      // Alpha composite over original
      out[idx] = Math.round(origR * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(origG * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(origB * (1 - weight) + targetB * weight);
    }
  }

  // Save upper crop
  await sharp(out, { raw: { width, height, channels: 3 } })
    .extract({ left: 0, top: 0, width: 576, height: 460 })
    .toFile('scripts/verify-room-upper.png');

  // Save full hero image
  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile('scripts/verify-room-full.jpg');

  console.log('Saved verify-room-upper.png and verify-room-full.jpg');
}

buildCompleteWhiteRoom().catch(console.error);

