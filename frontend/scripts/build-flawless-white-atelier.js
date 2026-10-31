import sharp from 'sharp';
import fs from 'fs';

async function buildFinalWhiteAtelier() {
  console.log('Building flawless all-white workshop atelier...');

  const { data, info } = await sharp('public/images/evoke-workshop-hero.backup.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const out = Buffer.from(data);

  // Exact circular logo parameters (measured to sub-pixel accuracy)
  const cx = 387.5;
  const cy = 326.0;
  const rx = 69.0;
  const ry = 69.0;

  // Physical micro-grain noise
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  // Smooth, continuous ceiling beam contour across all 576 columns
  function getCeilingY(x) {
    if (x < 60) return 78;
    if (x < 160) return 78 + ((x - 60) / 100) * 34; // 78 down to 112 (angled lightbox bottom edge)
    if (x < 250) return 112 - ((x - 160) / 90) * 12; // 112 to 100 (horizontal ceiling girder)
    if (x <= 542) return 100 - ((x - 250) / (542 - 250)) * 22; // 100 up to 78 (rear wall header beam)
    return 78; // 542 to 576 (right corner girder)
  }

  // Physical bottom wall boundary (tool racks, cabinet, tool shelf, technician)
  function getBottomY(x) {
    if (x < 138) return 240; // Tool rack top on left wall
    if (x < 248) return 242; // Cabinet roof on left rear wall
    if (x <= 475) return 413; // Tool shelf top on center wall
    // Technician head and collar contour:
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

      // Outside wall vertical bounds
      if (y < ceilY || y > botY) continue;

      // 2. PRESERVE PHYSICAL VERTICAL LIGHT FIXTURES & MOUNTING HARDWARE
      // Tube 1 at x ≈ 31 (span x: 27 to 35)
      // Tube 2 at x ≈ 107 (span x: 102 to 112)
      // Tube 4 at x ≈ 565 (span x: 560 to 570)
      const isTube1 = (x >= 27 && x <= 35);
      const isTube2 = (x >= 102 && x <= 112);
      const isTube4 = (x >= 560 && x <= 570);

      if (isTube1 || isTube2 || isTube4) {
        // Keep 100% authentic physical light tubes and brackets
        continue;
      }

      // Smooth edge antialiasing near ceiling, objects, and logo
      let weight = 1.0;
      if (y - ceilY < 3.0) weight = Math.min(weight, (y - ceilY) / 3.0);
      if (botY - y < 3.0) weight = Math.min(weight, (botY - y) / 3.0);
      if (normDist < 1.025) weight *= (normDist - 1.0) / 0.025;

      // Soft feathering near vertical tubes (2px transition to wall)
      if (x >= 25 && x < 27) weight = Math.min(weight, (x - 25) / 2.0);
      if (x > 35 && x <= 37) weight = Math.min(weight, (37 - x) / 2.0);
      if (x >= 100 && x < 102) weight = Math.min(weight, (x - 100) / 2.0);
      if (x > 112 && x <= 114) weight = Math.min(weight, (114 - x) / 2.0);
      if (x >= 558 && x < 560) weight = Math.min(weight, (x - 558) / 2.0);
      if (x > 570 && x <= 572) weight = Math.min(weight, (572 - x) / 2.0);

      if (weight <= 0) continue;

      // 3. Realistic Atelier White Wall Lighting Model
      // Vertical daylight falloff from ceiling wash: 247 down to 228
      const vertNorm = Math.min(1.0, Math.max(0.0, (y - 78) / (413 - 78)));
      let lum = 246 - vertNorm * 18;

      // Architectural wall zone illumination
      if (x < 138) {
        // Left side wall
        lum -= 4;
        const d1 = Math.abs(x - 31);
        const d2 = Math.abs(x - 107);
        const minDist = Math.min(d1, d2);
        if (minDist < 22) {
          lum += (22 - minDist) * 0.35; // warm tube glow reflection
        }
      } else if (x < 248) {
        // Left rear recessed wall panel
        lum -= 7;
      } else if (x <= 542) {
        // Center rear showcase wall
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
        const d4 = Math.abs(x - 565);
        if (d4 < 22) {
          lum += (22 - d4) * 0.35; // warm tube glow reflection
        }
      }

      // Contact shadows along ceiling girders and lower equipment
      if (y - ceilY < 8) lum -= (1 - (y - ceilY) / 8) * 12;
      if (botY - y < 7 && x < 475) lum -= (1 - (botY - y) / 7) * 10;

      // Subtle architectural seams for modular cleanroom construction
      if (Math.abs(x - 138) <= 2) lum -= (3 - Math.abs(x - 138)) * 8;
      if (Math.abs(x - 248) <= 2 && y <= 242) lum -= (3 - Math.abs(x - 248)) * 7;

      // 3D cabinet cast shadow on center wall
      if (x >= 248 && x <= 258 && y > 242 && y <= 413) {
        const shadowDistX = (x - 248) / 10;
        lum -= (1 - shadowDistX) * (1 - shadowDistX) * 14;
      }

      if (Math.abs(x - 542) <= 2) lum -= (3 - Math.abs(x - 542)) * 8;

      // Micro-grain texture
      lum += noise(x, y) * 2.0;
      lum = Math.max(160, Math.min(252, lum));

      let targetR = Math.round(lum);
      let targetG = Math.round(lum);
      let targetB = Math.min(255, Math.round(lum + 2));

      // Subtle warm amber reflection near vertical tubes
      if (x < 138 || x > 545) {
        const d1 = Math.abs(x - 31);
        const d2 = Math.abs(x - 107);
        const d4 = Math.abs(x - 565);
        const minDist = Math.min(d1, d2, d4);
        if (minDist < 25) {
          const glow = (25 - minDist) / 25;
          targetR = Math.min(255, Math.round(targetR + 8 * glow));
          targetG = Math.min(255, Math.round(targetG + 4 * glow));
          targetB = Math.max(0, Math.round(targetB - 5 * glow));
        }
      }

      // Alpha composite over original pixels
      out[idx] = Math.round(origR * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(origG * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(origB * (1 - weight) + targetB * weight);
    }
  }

  // 1. Save directly to public/images/evoke-workshop-hero-clean.jpg
  const publicPath = 'public/images/evoke-workshop-hero-clean.jpg';
  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile(publicPath);
  console.log(`Successfully generated and saved ${publicPath}`);

  // 2. Synchronize to dist/images if exists
  if (fs.existsSync('dist/images/evoke-workshop-hero-clean.jpg')) {
    fs.copyFileSync(publicPath, 'dist/images/evoke-workshop-hero-clean.jpg');
    console.log('Synchronized to dist/images/evoke-workshop-hero-clean.jpg');
  }

  // 3. Save upper crop for visual review
  await sharp(out, { raw: { width, height, channels: 3 } })
    .extract({ left: 0, top: 0, width: 576, height: 460 })
    .toFile('scripts/verify-final-white-upper.png');
}

buildFinalWhiteAtelier().catch(console.error);
