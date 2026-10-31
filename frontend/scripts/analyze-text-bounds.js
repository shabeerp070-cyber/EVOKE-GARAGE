import sharp from 'sharp';

async function analyzeRegion() {
  const { data, info } = await sharp('scripts/wall-crop-original.png').raw().toBuffer({ resolveWithObject: true });
  
  // Find bright pixels (letters have high luminance / brightness, wall is dark)
  let minX = 999, maxX = 0, minY = 999, maxY = 0;
  let letterPixels = [];

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Bright metallic text pixels have luminance > 80
      const lum = 0.299*r + 0.587*g + 0.114*b;
      // Exclude circular emblem which starts lower down (around y > 150)
      if (lum > 75 && y < 155) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Also find the top of the circular emblem
  let emblemTop = 999;
  for (let y = 140; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const lum = 0.299*r + 0.587*g + 0.114*b;
      if (lum > 80 && y < emblemTop) {
        emblemTop = y;
      }
    }
  }

  console.log('In Crop Coordinates:');
  console.log('Text bounding box: x=[' + minX + ', ' + maxX + '], y=[' + minY + ', ' + maxY + ']');
  console.log('Circular emblem top: y=' + emblemTop);
  console.log('\nIn Full Image (576x1024) Coordinates (left=180, top=100):');
  console.log('Text bounding box: x=[' + (180+minX) + ', ' + (180+maxX) + '], y=[' + (100+minY) + ', ' + (100+maxY) + ']');
  console.log('Circular emblem top: y=' + (100+emblemTop));
}

analyzeRegion().catch(console.error);

