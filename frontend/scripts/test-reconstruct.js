import sharp from 'sharp';

async function testReconstruction() {
  const { data, info } = await sharp('public/images/evoke-workshop-hero.jpg').raw().toBuffer({ resolveWithObject: true });

  // Clone buffer
  const out = Buffer.from(data);

  // Define the retouching bounding box:
  // x: 265 to 505
  // y: 135 to 252 (stopping strictly before emblem at y=256)
  const left = 265, right = 505;
  const top = 135, bottom = 252;
  const width = right - left;
  const height = bottom - top;

  console.log(`Retouch region: [${left}..${right}] x [${top}..${bottom}] (${width}x${height})`);

  // Let's sample the clean wall boundary on left (x=left-10..left), right (x=right..right+10),
  // top (y=top-10..top), and bottom gap (y=bottom..bottom+4)
  // Let's inspect the boundary colors:
  const getPixel = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  console.log('Top-left clean wall:', getPixel(left, top));
  console.log('Top-right clean wall:', getPixel(right, top));
  console.log('Bottom-left clean wall:', getPixel(left, bottom));
  console.log('Bottom-right clean wall:', getPixel(right, bottom));
  console.log('Center-left clean wall (x=260, y=190):', getPixel(260, 190));
  console.log('Center-right clean wall (x=510, y=190):', getPixel(510, 190));
}

testReconstruction().catch(console.error);

