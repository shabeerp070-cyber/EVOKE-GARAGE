import sharp from 'sharp';

async function mapDetail() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Let's find top boundary of the wall for each x from 250 to 540
  // Above the wall is the bright ceiling light / frame:
  // Bright ceiling lights have r, g, b > 150 (white fluorescent panels) or dark frame
  // Let's sample along columns x = 260, 300, 350, 400, 450, 500, 530
  for (const x of [260, 300, 350, 400, 450, 500, 530]) {
    for (let y = 130; y < 200; y++) {
      const idx = (y * width + x) * 3;
      const b = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      // Below the ceiling lights there is a horizontal black frame line
    }
  }

  // Let's examine the technician boundary:
  // In the area x: 470 to 542, y: 360 to 450:
  // Technician's hair and skin:
  // Skin has high red: r > 100, r > g + 20, r > b + 20
  // Hair has dark texture
}

mapDetail().catch(console.error);

