import sharp from 'sharp';

async function buildAllWhiteWalls() {
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

  // Deterministic noise for physical micro-grain
  function noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  // Ceiling boundary across entire image width (x: 0 to 576)
  function getCeilY(x) {
    if (x < 70) return 92 + (x / 70) * 12; // 92 to 104
    if (x < 140) return 104 + ((x - 70) / 70) * 26; // 104 down to 130 (angled lightbox bottom)
    if (x < 175) return 130 - ((x - 140) / 35) * 18; // 130 up to 112
    if (x < 248) return 112 - ((x - 175) / 73) * 12; // 112 up to 100
    if (x <= 542) return 100 - ((x - 248) / (542 - 248)) * 22; // 100 up to 78
    return 78; // 542 to 576
  }

  // Bottom boundary of wall
  function getWallBottomY(x) {
    if (x < 138) return 240; // Tool rack top on left wall
    if (x < 248) return 242; // Cabinet roof on left rear wall
    if (x <= 475) return 413; // Shelf top on center wall
    if (x < 485) return 413 - ((x - 475) / 10) * (413 - 377);
    if (x < 495) return 377 - ((x - 485) / 10) * (377 - 361);
    if (x < 509) return 361 - ((x - 495) / 14) * (361 - 352);
    if (x <= 523) return 352;
    if (x <= 542) return 352 + ((x - 523) / (542 - 523)) * (364 - 352);
    return 364 + ((x - 542) / (576 - 542)) * 16; // Right wall behind tech
  }

  for (let y = 60; y <= 500; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const origR = data[idx];
      const origG = data[idx + 1];
      const origB = data[idx + 2];

      // 1. CIRCULAR LOGO: PRESERVE 100% UNTOUCHED ORIGINAL PIXELS
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (normDist <= 1.0) continue;

      // 2. Ceiling boundary: don't touch ceiling or lights
      const ceilY = getCeilY(x);
      if (y < ceilY) continue;

      // 3. Wall bottom boundary (racks, cabinets, technician)
      const bottomLimit = getWallBottomY(x);
      if (y > bottomLimit) {
        // SPECIAL: Behind the shelves (x: 250 to 470, y: 413 to 470)
        // If pixel is dark wall behind bottles, lift it to shadowed white
        if (x >= 250 && x <= 470 && y <= 470) {
          // Check if this pixel is the dark wall background (not a colored bottle or bright label)
          const isDarkWall = (origR < 65 && origG < 55 && origB < 50 && Math.abs(origR - origG) < 20);
          if (isDarkWall) {
            // Shadowed white behind shelf
            const shelfDepth = (y - 413) / (470 - 413);
            let shelfLum = 210 - shelfDepth * 25 + noise(x, y) * 2;
            shelfLum = Math.max(165, Math.min(225, shelfLum));
            const w = 0.85;
            out[idx] = Math.round(origR * (1 - w) + shelfLum * w);
            out[idx + 1] = Math.round(origG * (1 - w) + shelfLum * w);
            out[idx + 2] = Math.round(origB * (1 - w) + (shelfLum + 2) * w);
          }
        }
        continue;
      }

      // Check if pixel is a glowing vertical light tube (keep bright tube core intact!)
      // Tube cores are very bright yellow/white:
      const isTubeCore = (origR > 225 && origG > 215 && origB > 170 && Math.min(origR, origG, origB) > 160);
      if (isTubeCore) {
        // Keep glowing tube core intact
        continue;
      }

      // Calculate blending weight near boundaries
      let weight = 1.0;
      if (y - ceilY < 3.0) weight = Math.min(weight, (y - ceilY) / 3.0);
      if (bottomLimit - y < 3.0) weight = Math.min(weight, (bottomLimit - y) / 3.0);

      // Logo antialiasing transition (outermost gold border meets white wall)
      if (normDist < 1.025) {
        weight *= (normDist - 1.0) / 0.025;
      }

      if (weight <= 0) continue;

      // 4. Photorealistic White Wall Lighting Model per region:
      let lum = 245;

      // Vertical daylight falloff from ceiling:
      const vertNorm = Math.min(1.0, Math.max(0.0, (y - 78) / (413 - 78)));
      lum = 246 - vertNorm * 18;

      // Subtle horizontal variation depending on proximity to overhead bays:
      if (x < 138) {
        // Left side wall: illuminated by overhead angled diffusers + side tubes
        // Has warm ambient glow from tubes at x=30 and x=105
        const distTube1 = Math.abs(x - 30);
        const distTube2 = Math.abs(x - 105);
        const minDist = Math.min(distTube1, distTube2);
        if (minDist < 25) {
          lum += (25 - minDist) * 0.4; // tube glow
        }
        lum -= 4; // side wall angle slight shading
      } else if (x < 248) {
        // Left rear wall: recessed panel next to cabinet
        lum -= 8;
        // Warm glow near tube at x=235
        const distTube3 = Math.abs(x - 235);
        if (distTube3 < 20) {
          lum += (20 - distTube3) * 0.5;
        }
      } else if (x <= 542) {
        // Center rear wall: main illuminated showcase wall
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
        // Right side wall (x > 542): bright glow from tube at x=565
        const distTube4 = Math.abs(x - 565);
        if (distTube4 < 25) {
          lum += (25 - distTube4) * 0.4;
        }
      }

      // Contact shadows near ceiling and cabinets:
      if (y - ceilY < 9) {
        lum -= (1 - (y - ceilY) / 9) * 14;
      }
      if (bottomLimit - y < 8 && x < 475) {
        lum -= (1 - (bottomLimit - y) / 8) * 10;
      }

      // Subtle vertical panel seams for authentic modular cleanroom construction:
      // Seam 1 at x = 138 (corner column)
      if (Math.abs(x - 138) <= 2) {
        lum -= (3 - Math.abs(x - 138)) * 8;
      }
      // Seam 2 at x = 248 (modular panel joint)
      if (Math.abs(x - 248) <= 2) {
        lum -= (3 - Math.abs(x - 248)) * 7;
      }
      // Seam 3 at x = 542 (corner post)
      if (Math.abs(x - 542) <= 2) {
        lum -= (3 - Math.abs(x - 542)) * 8;
      }

      // Natural micro-grain
      lum += noise(x, y) * 2.2;
      lum = Math.max(160, Math.min(252, lum));

      // Neutral daylight white with subtle warm ambiance near vertical tubes
      let targetR = Math.round(lum);
      let targetG = Math.round(lum);
      let targetB = Math.min(255, Math.round(lum + 2));

      // If near a warm tube, give a tiny warm tint (+2 R, +1 G)
      if (x < 138 || (x > 220 && x < 248) || x > 545) {
        targetR = Math.min(255, targetR + 2);
        targetG = Math.min(255, targetG + 1);
        targetB = Math.max(0, targetB - 1);
      }

      out[idx] = Math.round(origR * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(origG * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(origB * (1 - weight) + targetB * weight);
    }
  }

  // Save full image preview
  await sharp(out, { raw: { width, height, channels: 3 } })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile('scripts/test-all-walls-preview.jpg');

  // Save upper half crop for close inspection
  await sharp(out, { raw: { width, height, channels: 3 } })
    .extract({ left: 0, top: 0, width: 576, height: 460 })
    .toFile('scripts/test-all-walls-upper.png');

  console.log('Saved test-all-walls-preview.jpg and test-all-walls-upper.png');
}

buildAllWhiteWalls().catch(console.error);

