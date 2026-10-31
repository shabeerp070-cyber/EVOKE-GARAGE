import sharp from 'sharp';

async function mapCeilingAndTech() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Let's find the ceiling edge for every x from 240 to 540
  // In the original image, ceiling lights are very bright (r, g, b > 180)
  // Below the lights is the dark ceiling frame (r, g, b ~ 20-40)
  // And the wall begins just below the frame.
  
  // Let's sample along columns and print the detected ceiling line
  const ceilingLine = [];
  for (let x = 240; x <= 545; x += 10) {
    let ceilY = 160;
    for (let y = 100; y < 220; y++) {
      const idx = (y * width + x) * 3;
      const b = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      // Below the bright ceiling panel (b > 120), find where it becomes dark wall
      if (b > 150) {
        // We are inside ceiling light
        ceilY = y;
      }
    }
    // The frame is ~10-15px below the bright light
    ceilingLine.push({ x, ceilY: ceilY + 12 });
  }
  console.log('Ceiling line samples:', ceilingLine);

  // Let's inspect the technician's head (x: 460 to 540, y: 340 to 450)
  // Let's crop technician head and inspect it
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 450, top: 340, width: 100, height: 110 })
    .toFile('scripts/tech-head.png');
  console.log('Saved scripts/tech-head.png');
}

mapCeilingAndTech().catch(console.error);

