import sharp from 'sharp';

async function cropTest() {
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 300, top: 240, width: 180, height: 180 })
    .toFile('scripts/crop-circle-test.png');
}

cropTest().catch(console.error);

