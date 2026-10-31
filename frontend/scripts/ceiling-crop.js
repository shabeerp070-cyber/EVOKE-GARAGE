import sharp from 'sharp';

async function findCeilingBeam() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;

  // Let's crop from y: 80 to 220, x: 230 to 560
  await sharp('public/images/evoke-workshop-hero-clean.jpg')
    .extract({ left: 230, top: 80, width: 330, height: 140 })
    .toFile('scripts/ceiling-crop.png');

  console.log('Saved scripts/ceiling-crop.png');
}

findCeilingBeam().catch(console.error);

