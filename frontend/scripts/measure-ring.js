import sharp from 'sharp';

async function testMask() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Let's create an annotated test image showing the detected logo boundary
  // Let's test an ellipse: cx, cy, rx, ry
  // Let's find exact coordinates of:
  // - Top of outer ring
  // - Bottom of outer ring
  // - Left of outer ring
  // - Right of outer ring

  // Let's scan along vertical line x=388
  let topY = 0, bottomY = 0;
  for (let y = 200; y < 300; y++) {
    const idx = (y * width + 388) * 3;
    const b = (data[idx] + data[idx+1] + data[idx+2])/3;
    if (b > 110) { topY = y; break; }
  }
  for (let y = 450; y > 350; y--) {
    const idx = (y * width + 388) * 3;
    const b = (data[idx] + data[idx+1] + data[idx+2])/3;
    if (b > 110) { bottomY = y; break; }
  }

  // Scan along horizontal line y = (topY + bottomY) / 2
  const midY = Math.round((topY + bottomY) / 2);
  let leftX = 0, rightX = 0;
  for (let x = 250; x < 350; x++) {
    const idx = (midY * width + x) * 3;
    const b = (data[idx] + data[idx+1] + data[idx+2])/3;
    if (b > 110) { leftX = x; break; }
  }
  for (let x = 500; x > 400; x--) {
    const idx = (midY * width + x) * 3;
    const b = (data[idx] + data[idx+1] + data[idx+2])/3;
    if (b > 110) { rightX = x; break; }
  }

  console.log({ topY, bottomY, midY, leftX, rightX, midX: (leftX + rightX) / 2 });
  console.log(`Radius X: ${(rightX - leftX)/2}, Radius Y: ${(bottomY - topY)/2}`);
}

testMask().catch(console.error);

