import sharp from 'sharp';

async function convert() {
  await sharp('scripts/pexels_paint_6870314.jpg')
    .jpeg({ quality: 92 })
    .toFile('scripts/pexels_paint_6870314_standard.jpg');
  console.log('Converted to standard JPEG');
}

convert().catch(console.error);

