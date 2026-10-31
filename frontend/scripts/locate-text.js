import sharp from 'sharp';

async function locateText() {
  const image = sharp('public/images/evoke-workshop-hero.jpg');
  
  // Crop the upper wall area around y=100 to y=350, x=200 to x=550
  await image
    .clone()
    .extract({ left: 180, top: 100, width: 380, height: 260 })
    .toFile('scripts/wall-crop-original.png');

  console.log('Saved wall-crop-original.png');
}

locateText().catch(console.error);

