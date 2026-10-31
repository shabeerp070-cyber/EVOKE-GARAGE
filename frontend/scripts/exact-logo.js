import sharp from 'sharp';

async function findExactLogoCircle() {
  const { data, info } = await sharp('scripts/crop-circle-test.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Let's find top, bottom, left, right edge of outer ring
  // Outer ring has gold color (r ~ 180-220, g ~ 160-200, b ~ 120-160)
  // Wall outside has dark grey/black (r < 50, g < 50, b < 50)
  
  let topY = 0, bottomY = 0;
  for (let y = 0; y < 90; y++) {
    const idx = (y * width + 90) * 3;
    if (data[idx] > 100 && data[idx+1] > 90) {
      topY = y;
      break;
    }
  }

  for (let y = 179; y > 90; y--) {
    const idx = (y * width + 90) * 3;
    if (data[idx] > 100 && data[idx+1] > 90) {
      bottomY = y;
      break;
    }
  }

  let leftX = 0, rightX = 0;
  for (let x = 0; x < 90; x++) {
    const idx = (90 * width + x) * 3;
    if (data[idx] > 100 && data[idx+1] > 90) {
      leftX = x;
      break;
    }
  }

  for (let x = 179; x > 90; x--) {
    const idx = (90 * width + x) * 3;
    if (data[idx] > 100 && data[idx+1] > 90) {
      rightX = x;
      break;
    }
  }

  console.log({ topY, bottomY, leftX, rightX });
  const cx = (leftX + rightX) / 2;
  const cy = (topY + bottomY) / 2;
  const rx = (rightX - leftX) / 2;
  const ry = (bottomY - topY) / 2;
  console.log(`In crop: cx=${cx}, cy=${cy}, rx=${rx}, ry=${ry}`);
  console.log(`In original image: cx=${300 + cx}, cy=${240 + cy}, radius=${(rx + ry)/2}`);
}

findExactLogoCircle().catch(console.error);

