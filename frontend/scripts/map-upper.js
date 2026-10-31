import sharp from 'sharp';

async function mapUpperHalf() {
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 0, top: 0, width: 576, height: 600 })
    .toFile('scripts/upper-half.png');
  console.log('Saved scripts/upper-half.png');
}

mapUpperHalf().catch(console.error);

