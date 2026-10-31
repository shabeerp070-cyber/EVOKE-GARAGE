import sharp from 'sharp';

async function cropBottom() {
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 230, top: 380, width: 320, height: 140 })
    .toFile('scripts/bottom-crop.png');

  console.log('Saved scripts/bottom-crop.png');
}

cropBottom().catch(console.error);

