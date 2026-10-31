import sharp from 'sharp';

async function traceTechHead() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Let's print for each row y from 335 to 440 the first pixel from x=450 to 540
  // that belongs to the technician (by checking when it deviates from wall color)
  // Wall color at x=450 is roughly r: 25-35, g: 25-32, b: 22-28
  
  const techPoints = [];
  for (let y = 335; y <= 440; y++) {
    const wallR = data[(y * width + 452) * 3];
    const wallG = data[(y * width + 452) * 3 + 1];
    const wallB = data[(y * width + 452) * 3 + 2];

    let foundX = 542;
    for (let x = 458; x <= 542; x++) {
      const idx = (y * width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      
      // Color difference from wall
      const diff = Math.hypot(r - wallR, g - wallG, b - wallB);
      // Skin tone: r > 65 and r > g + 12
      // Hair: very dark (r < 18, g < 18) or highlight (b > 60)
      // Glasses: black plastic or white lens
      const isSkin = (r > 60 && r > g + 12);
      const isHair = (r < 18 && g < 18 && b < 18 && x > 490);
      const isHairHighlight = (r > 45 && g > 45 && b > 45 && x > 500);
      const isRespirator = (r > 100 && g > 100 && b > 100);

      if (diff > 18 || isSkin || isHair || isHairHighlight || isRespirator) {
        foundX = x;
        break;
      }
    }
    techPoints.push({ y, foundX });
  }

  console.log(JSON.stringify(techPoints));
}

traceTechHead().catch(console.error);

