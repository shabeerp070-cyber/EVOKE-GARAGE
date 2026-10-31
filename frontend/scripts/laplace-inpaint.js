import sharp from 'sharp';

async function laplaceInpaint() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero.jpg').raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Mask area containing the text to be retouched:
  // EVOKE: y ~ 140..175, x ~ 280..500
  // GARAGE: y ~ 180..208, x ~ 290..490
  // Line: y ~ 216..224, x ~ 280..495
  // ATELIER: y ~ 235..248, x ~ 285..495
  // Margin for seamless transition:
  const left = 270, right = 505;
  const top = 138, bottom = 252;
  const rw = right - left;
  const rh = bottom - top;

  console.log(`Grid dimensions: ${rw}x${rh}`);

  // Create grid for R, G, B
  const gridR = new Float64Array(rw * rh);
  const gridG = new Float64Array(rw * rh);
  const gridB = new Float64Array(rw * rh);

  // Initialize grid from source image
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

  // Create a mask: 1 = retouched text pixel, 0 = keep clean wall
  // Letters have high luminance or are in the text bands
  const mask = new Float64Array(rw * rh);

  for (let y = 0; y < rh; y++) {
    const imgY = top + y;
    for (let x = 0; x < rw; x++) {
      const imgX = left + x;
      const idx = (imgY * w + imgX) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Inside the text horizontal span [280..498] and vertical bands
      const inX = (imgX >= 278 && imgX <= 500);
      const isEvoke = inX && (imgY >= 142 && imgY <= 176);
      const isGarage = inX && (imgY >= 182 && imgY <= 208);
      const isLine = inX && (imgY >= 215 && imgY <= 225);
      const isAtelier = inX && (imgY >= 234 && imgY <= 250);

      if (isEvoke || isGarage || isLine || isAtelier) {
        mask[y * rw + x] = 1.0;
      }
    }
  }

  // Soft dilate mask by 3 pixels to feather seamlessly
  const dilatedMask = new Float64Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let maxVal = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < rh && nx >= 0 && nx < rw) {
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist <= 3 && mask[ny * rw + nx] > maxVal) {
              maxVal = Math.max(maxVal, 1.0 - dist / 3.5);
            }
          }
        }
      }
      dilatedMask[y * rw + x] = maxVal;
    }
  }

  // Set boundary conditions:
  // For all pixels where mask > 0.05, we solve the Laplace equation with boundary conditions from non-masked pixels
  const nextR = new Float64Array(gridR);
  const nextG = new Float64Array(gridG);
  const nextB = new Float64Array(gridB);

  // Initialize masked pixels to boundary linear interpolation
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const gIdx = y * rw + x;
      if (dilatedMask[gIdx] > 0) {
        // Average of left and right boundary
        const leftValR = gridR[y * rw + 0];
        const rightValR = gridR[y * rw + (rw - 1)];
        const frac = x / (rw - 1);
        gridR[gIdx] = leftValR * (1 - frac) + rightValR * frac;

        const leftValG = gridG[y * rw + 0];
        const rightValG = gridG[y * rw + (rw - 1)];
        gridG[gIdx] = leftValG * (1 - frac) + rightValG * frac;

        const leftValB = gridB[y * rw + 0];
        const rightValB = gridB[y * rw + (rw - 1)];
        gridB[gIdx] = leftValB * (1 - frac) + rightValB * frac;
      }
    }
  }

  // Solve Laplace equation: 400 Gauss-Seidel iterations
  for (let iter = 0; iter < 400; iter++) {
    for (let y = 1; y < rh - 1; y++) {
      for (let x = 1; x < rw - 1; x++) {
        const gIdx = y * rw + x;
        if (dilatedMask[gIdx] > 0.1) {
          const avgR = (gridR[gIdx - 1] + gridR[gIdx + 1] + gridR[(y - 1) * rw + x] + gridR[(y + 1) * rw + x]) * 0.25;
          const avgG = (gridG[gIdx - 1] + gridG[gIdx + 1] + gridG[(y - 1) * rw + x] + gridG[(y + 1) * rw + x]) * 0.25;
          const avgB = (gridB[gIdx - 1] + gridB[gIdx + 1] + gridB[(y - 1) * rw + x] + gridB[(y + 1) * rw + x]) * 0.25;

          gridR[gIdx] = avgR;
          gridG[gIdx] = avgG;
          gridB[gIdx] = avgB;
        }
      }
    }
  }

  // Sample natural film grain / sensor texture from the clean wall adjacent to the left:
  // x: 200..260, y: 140..240
  const noiseSamplesR = [];
  const noiseSamplesG = [];
  const noiseSamplesB = [];

  for (let y = 140; y < 240; y++) {
    for (let x = 205; x < 265; x++) {
      const idx = (y * w + x) * info.channels;
      // High-pass filter (subtract 3x3 box blur) to isolate high-frequency grain
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

  // Deterministic PRNG for consistent realistic grain distribution
  let seed = 42;
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Output buffer
  const outData = Buffer.from(data);

  for (let y = 0; y < rh; y++) {
    const imgY = top + y;
    for (let x = 0; x < rw; x++) {
      const imgX = left + x;
      const gIdx = y * rw + x;
      const m = dilatedMask[gIdx];

      if (m > 0) {
        const outIdx = (imgY * w + imgX) * info.channels;
        const origR = data[outIdx];
        const origG = data[outIdx+1];
        const origB = data[outIdx+2];

        // Sample grain
        const sIdx = Math.floor(rnd() * noiseSamplesR.length);
        const grainR = noiseSamplesR[sIdx];
        const grainG = noiseSamplesG[sIdx];
        const grainB = noiseSamplesB[sIdx];

        const recR = Math.max(0, Math.min(255, Math.round(gridR[gIdx] + grainR * 0.9)));
        const recG = Math.max(0, Math.min(255, Math.round(gridG[gIdx] + grainG * 0.9)));
        const recB = Math.max(0, Math.min(255, Math.round(gridB[gIdx] + grainB * 0.9)));

        // Blend with original using mask feathering
        outData[outIdx] = Math.round(origR * (1 - m) + recR * m);
        outData[outIdx+1] = Math.round(origG * (1 - m) + recG * m);
        outData[outIdx+2] = Math.round(origB * (1 - m) + recB * m);
      }
    }
  }

  // Save the full retouched image
  await sharp(outData, { raw: { width: w, height: h, channels: info.channels } })
    .jpeg({ quality: 98 })
    .toFile('public/images/evoke-workshop-hero-clean.jpg');

  console.log('Saved public/images/evoke-workshop-hero-clean.jpg');

  // Also save a crop of the retouched wall for visual inspection
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 180, top: 100, width: 380, height: 260 })
    .toFile('scripts/wall-crop-retouched.png');

  console.log('Saved scripts/wall-crop-retouched.png');
}

laplaceInpaint().catch(console.error);

