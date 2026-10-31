import sharp from 'sharp';

async function traceExactBoundaries() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Let's find top boundary:
  // For each column x from 248 to 542:
  // Scan from y = 70 downwards:
  // Find where the dark ceiling beam ends and the wall begins
  // The ceiling panel light is bright (b > 120)
  // Then the black ceiling frame is dark (b < 35)
  // In ceiling-crop.png, let's print the brightness profile along x = 260, 300, 350, 400, 450, 500
  for (const x of [255, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 540]) {
    const col = [];
    for (let y = 70; y < 130; y += 5) {
      const idx = (y * width + x) * 3;
      const b = Math.round((data[idx] + data[idx+1] + data[idx+2])/3);
      col.push({ y, b });
    }
    // console.log(`x=${x}:`, col);
  }

  // Let's inspect the car roof curve for x: 248 to 300
  // Car paint is rich red: r > 100, r > g*2, r > b*2
  for (const x of [250, 260, 270, 280, 290, 300]) {
    for (let y = 410; y < 470; y++) {
      const idx = (y * width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r > 60 && r > g * 1.5 && r > b * 1.5) {
        console.log(`Car roof at x=${x}: y=${y} (r=${r}, g=${g}, b=${b})`);
        break;
      }
    }
  }

  // Let's inspect the technician silhouette in crop tech-head
  // In x: 460 to 542, y: 340 to 420:
  // Let's find the left edge of the technician for every y from 340 to 420
  console.log('--- Technician left edge ---');
  for (let y = 340; y <= 420; y += 5) {
    let edgeX = 542;
    for (let x = 455; x <= 542; x++) {
      const idx = (y * width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Wall is dark matte (r, g, b ~ 25-35)
      // Technician hair/skin/glasses:
      // Glasses frame / head / ear / hair / strap
      // At y=370-380, glasses frame is black rim but has white glass reflection or skin
      // Let's check skin: r > 70 and r > g + 15
      // Let's check hair: r < 20, or texture
    }
  }
}

traceExactBoundaries().catch(console.error);

