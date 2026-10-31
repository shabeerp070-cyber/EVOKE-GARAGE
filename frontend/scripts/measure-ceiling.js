import sharp from 'sharp';

async function measureCeiling() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Ceiling lights are white panels.
  // Below the white panels is a black metal frame strip of thickness ~ 12px.
  // The wall starts immediately below the black metal frame strip.
  // Let's find the bottom of the white panels first:
  for (let x = 250; x <= 540; x += 25) {
    let lightBottom = 0;
    for (let y = 60; y < 140; y++) {
      const idx = (y * width + x) * 3;
      const b = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      if (b > 160) {
        lightBottom = y;
      }
    }
    console.log(`x=${x}: lightBottom=${lightBottom}, wallTop ~ ${lightBottom + 12}`);
  }
}

measureCeiling().catch(console.error);

