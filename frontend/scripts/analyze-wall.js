import sharp from 'sharp';

async function analyzeWall() {
  const img = sharp('public/images/evoke-workshop-hero-clean.jpg');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  console.log(`Width: ${info.width}, Height: ${info.height}`);

  // Let's find the circle center and radius
  // In wall-and-logo.png (left: 200, top: 80, width: 350, height: 420)
  // Let's sample colors across horizontal line through the circle
  // Circle looks to be roughly at x ~ 385, y ~ 320 in full image coords
}

analyzeWall().catch(console.error);

