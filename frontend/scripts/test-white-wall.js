import sharp from 'sharp';

async function generateWhiteWall() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  const out = Buffer.from(data);

  // Logo parameters:
  const cx = 387.5;
  const cy = 326.0;
  const rx = 67.5;
  const ry = 68.0;

  // Let's create an alpha mask for the white wall
  // Wall boundaries:
  // Left: x ~ 250
  // Right: x ~ 542
  // Top: sloping from y ~ 140 at x=250 to y ~ 168 at x=542
  // Bottom: top of shelves (y ~ 432), car roof (y ~ 440)
  // Technician mask: x > 470, y > 360

  for (let y = 0; y < 600; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;

      // 1. Check if inside logo (with smooth antialiased boundary)
      const normDist = Math.hypot((x - cx) / rx, (y - cy) / ry);
      
      // If inside logo (normDist <= 1.0), leave 100% untouched!
      if (normDist <= 1.0) {
        continue;
      }

      // Check top ceiling slope:
      // At x = 250, top is ~ 140
      // At x = 542, top is ~ 168
      const topY = 140 + ((x - 250) / (542 - 250)) * (168 - 140);
      if (y < topY - 2) continue;

      // Check left and right limits:
      if (x < 250 || x > 542) continue;

      // Check bottom limits:
      // Shelves start around y = 432
      // Car roof on left starts around y = 440
      if (y > 432 && x > 340) {
        // Check shelves or technician
        // Bottles on shelves have diverse colors, shelf top has horizontal line
        continue;
      }
      if (y > 440 && x <= 340) {
        continue;
      }

      // Check technician silhouette:
      // Head and ear and neck are around x: 470 to 542, y: 360 to 432
      if (x >= 470 && y >= 360) {
        const origR = data[idx];
        const origG = data[idx+1];
        const origB = data[idx+2];
        // Skin tones or hair or mask:
        // Skin has r > 80 and r > g + 15
        // Hair has darker tone but technician's back/arm is clearly distinct
        // Let's check distance to technician's head center (~505, 400)
        // Let's refine technician boundary precisely
        const isTechSkin = (origR > 75 && origR > origG + 15 && origR > origB + 15);
        const isTechClothes = (y > 410 && x > 480);
        const isTechHead = (x > 490 && y > 365);
        if (isTechSkin || isTechClothes || isTechHead) {
          continue;
        }
      }

      // Compute wall mask weight (with feathering at boundaries):
      let weight = 1.0;

      // Feather at top ceiling frame (over 4px)
      if (y - topY < 4) {
        weight = Math.min(weight, (y - topY) / 4);
      }
      // Feather at left seam (over 4px)
      if (x - 250 < 4) {
        weight = Math.min(weight, (x - 250) / 4);
      }
      // Feather at right beam (over 4px)
      if (542 - x < 4) {
        weight = Math.min(weight, (542 - x) / 4);
      }
      // Feather at bottom shelves (over 4px)
      if (432 - y < 4 && x > 340) {
        weight = Math.min(weight, (432 - y) / 4);
      }

      // Feather near logo edge:
      // Logo outer boundary is at normDist = 1.0
      // Between normDist = 1.0 and normDist = 1.03 (approx 2px transition)
      let logoShadow = 0;
      if (normDist < 1.03) {
        weight *= (normDist - 1.0) / 0.03;
      } else if (normDist < 1.18) {
        // Subtle realistic drop shadow from the circular plaque:
        // Slight downward offset (light from above)
        const shadowDist = Math.hypot((x - cx) / rx, (y - (cy + 2.5)) / ry);
        if (shadowDist < 1.15) {
          logoShadow = (1.15 - shadowDist) / 0.15 * 25; // max 25 brightness reduction
        }
      }

      if (weight <= 0) continue;

      // Lighting model for the white cleanroom atelier wall:
      // Overhead panel lights cast daylight (color temp ~ 5200K, crisp neutral white)
      // Top of wall receives direct wash: ~ 245
      // Lower wall: gentle falloff to ~ 220
      const verticalNorm = (y - 150) / (432 - 150); // 0 at top, 1 at bottom
      const baseLuminance = 244 - verticalNorm * 22 - logoShadow;

      // Subtle horizontal gradient (slightly brighter towards center where overhead panels are strongest)
      const horizCenterDist = Math.abs(x - 396) / 150;
      const horizLight = (1.0 - horizCenterDist * 0.06);

      const targetR = Math.min(255, Math.round(baseLuminance * horizLight));
      const targetG = Math.min(255, Math.round((baseLuminance - 1) * horizLight));
      const targetB = Math.min(255, Math.round((baseLuminance + 2) * horizLight)); // crisp clean daylight white

      // Blend with original using weight
      out[idx] = Math.round(data[idx] * (1 - weight) + targetR * weight);
      out[idx + 1] = Math.round(data[idx + 1] * (1 - weight) + targetG * weight);
      out[idx + 2] = Math.round(data[idx + 2] * (1 - weight) + targetB * weight);
    }
  }

  await sharp(out, { raw: { width, height, channels: 3 } })
    .toFile('scripts/test-white-wall.jpg');

  console.log('Saved scripts/test-white-wall.jpg');
}

generateWhiteWall().catch(console.error);

