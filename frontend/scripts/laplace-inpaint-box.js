import sharp from 'sharp';

async function laplaceInpaintBox() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero.jpg').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // The bounding box covering EVOKE, GARAGE, line, and AUTOMOTIVE ATELIER:
  // Top: y=138 (below the top edge, clean dark wall)
  // Bottom: y=252 (above the circular emblem which starts at y=258)
  // Left: x=270 (clean dark wall to the left)
  // Right: x=505 (clean dark wall to the right)
  const left = 270, right = 505;
  const top = 138, bottom = 252;
  const rw = right - left;
  const rh = bottom - top;

  console.log(`Retouch box: [${left}..${right}] x [${top}..${bottom}] = ${rw}x${rh}`);

  // Create grid for R, G, B
  const gridR = new Float64Array(rw * rh);
  const gridG = new Float64Array(rw * rh);
  const gridB = new Float64Array(rw * rh);

  // Initialize boundary from real image
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const imgX = left + x;
      const imgY = top + y;
      const idx = (imgY * w + imgX) * info.channels;
      const gIdx = y * rw + x;
      gridR[gIdx] = data[idx];
      gridG[gIdx] = data[idx+1];
      gridB[gIdx] = data[idx+2];
    }
  }

  // Linear boundary interpolation as initial guess (Dirichlet boundary)
  for (let y = 1; y < rh - 1; y++) {
    const fracY = y / (rh - 1);
    for (let x = 1; x < rw - 1; x++) {
      const fracX = x / (rw - 1);
      const gIdx = y * rw + x;

      // Bilinear blend of 4 boundaries
      const topR = gridR[0 * rw + x];
      const btmR = gridR[(rh - 1) * rw + x];
      const lftR = gridR[y * rw + 0];
      const rgtR = gridR[y * rw + (rw - 1)];

      const topG = gridG[0 * rw + x];
      const btmG = gridG[(rh - 1) * rw + x];
      const lftG = gridG[y * rw + 0];
      const rgtG = gridG[y * rw + (rw - 1)];

      const topB = gridB[0 * rw + x];
      const btmB = gridB[(rh - 1) * rw + x];
      const lftB = gridB[y * rw + 0];
      const rgtB = gridB[y * rw + (rw - 1)];

      gridR[gIdx] = 0.5 * (topR * (1 - fracY) + btmR * fracY + lftR * (1 - fracX) + rgtR * fracX);
      gridG[gIdx] = 0.5 * (topG * (1 - fracY) + btmG * fracY + lftG * (1 - fracX) + rgtG * fracX);
      gridB[gIdx] = 0.5 * (topB * (1 - fracY) + btmB * fracY + lftB * (1 - fracX) + rgtB * fracX);
    }
  }

  // 1000 Gauss-Seidel iterations to ensure absolute smooth harmonic convergence
  for (let iter = 0; iter < 1000; iter++) {
    for (let y = 1; y < rh - 1; y++) {
      for (let x = 1; x < rw - 1; x++) {
        const gIdx = y * rw + x;
        gridR[gIdx] = (gridR[gIdx - 1] + gridR[gIdx + 1] + gridR[(y - 1) * rw + x] + gridR[(y + 1) * rw + x]) * 0.25;
        gridG[gIdx] = (gridG[gIdx - 1] + gridG[gIdx + 1] + gridG[(y - 1) * rw + x] + gridG[(y + 1) * rw + x]) * 0.25;
        gridB[gIdx] = (gridB[gIdx - 1] + gridB[gIdx + 1] + gridB[(y - 1) * rw + x] + gridB[(y + 1) * rw + x]) * 0.25;
      }
    }
  }

  // Sample natural film grain / sensor texture from the clean wall adjacent to the left:
  // x: 205..265, y: 140..240
  const noiseSamplesR = [];
  const noiseSamplesG = [];
  const noiseSamplesB = [];

  for (let y = 140; y < 240; y++) {
    for (let x = 205; x < 265; x++) {
      const idx = (y * w + x) * info.channels;
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * w + (x + dx)) * info.channels;
          sumR += data[nIdx];
          sumG += data[nIdx+1];
          sumB += data[nIdx+2];
          count++;
        }
      }
      noiseSamplesR.push(data[idx] - sumR / count);
      noiseSamplesG.push(data[idx+1] - sumG / count);
      noiseSamplesB.push(data[idx+2] - sumB / count);
    }
  }

  // PRNG
  let seed = 12345;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const outData = Buffer.from(data);

  // Blend with soft 5-pixel feathering at the outer perimeter
  const feather = 5;

  for (let y = 0; y < rh; y++) {
    const imgY = top + y;
    for (let x = 0; x < rw; x++) {
      const imgX = left + x;
      const gIdx = y * rw + x;
      const outIdx = (imgY * w + imgX) * info.channels;

      // Distance to nearest border
      const distX = Math.min(x, rw - 1 - x);
      const distY = Math.min(y, rh - 1 - y);
      const dist = Math.min(distX, distY);

      // Feather weight: 0 at boundary, 1 inside
      const weight = Math.min(1.0, dist / feather);

      if (weight > 0) {
        const sIdx = Math.floor(rnd() * noiseSamplesR.length);
        const grainR = noiseSamplesR[sIdx];
        const grainG = noiseSamplesG[sIdx];
        const grainB = noiseSamplesB[sIdx];

        const recR = Math.max(0, Math.min(255, Math.round(gridR[gIdx] + grainR * 0.95)));
        const recG = Math.max(0, Math.min(255, Math.round(gridG[gIdx] + grainG * 0.95)));
        const recB = Math.max(0, Math.min(255, Math.round(gridB[gIdx] + grainB * 0.95)));

        const origR = data[outIdx];
        const origG = data[outIdx+1];
        const origB = data[outIdx+2];

        outData[outIdx] = Math.round(origR * (1 - weight) + recR * weight);
        outData[outIdx+1] = Math.round(origG * (1 - weight) + recG * weight);
        outData[outIdx+2] = Math.round(origB * (1 - weight) + recB * weight);
      }
    }
  }

  // Save the retouched image
  await sharp(outData, { raw: { width: w, height: h, channels: info.channels } })
    .jpeg({ quality: 98 })
    .toFile('public/images/evoke-workshop-hero-clean.jpg');

  console.log('Saved public/images/evoke-workshop-hero-clean.jpg');

  // Save inspection crop
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 180, top: 100, width: 380, height: 260 })
    .toFile('scripts/wall-crop-retouched-box.png');

  console.log('Saved scripts/wall-crop-retouched-box.png');
}

laplaceInpaintBox().catch(console.error);

