import sharp from 'sharp';

async function makePreviews() {
  const list = [
    'a_man_is_painting_a_car.jpg',
    'army_autobody_tech.jpg',
    'skills_center.jpg',
    'rebirth_unsplash.jpg'
  ];

  for (const name of list) {
    await sharp(`scripts/${name}`)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(`scripts/preview_${name}`);
    console.log(`Generated scripts/preview_${name}`);
  }
}

makePreviews().catch(console.error);

