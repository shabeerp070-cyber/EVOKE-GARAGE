import sharp from 'sharp';

async function sampleCenterColumn() {
  const { data, info } = await sharp('screenshots/mobile-grid-measurement.png').raw().toBuffer({ resolveWithObject: true });
  for (let y = 320; y <= 800; y += 30) {
    const idx = (y * info.width + 196) * info.channels;
    console.log('y=' + y + ': rgb(' + data[idx] + ', ' + data[idx+1] + ', ' + data[idx+2] + ')');
  }
}

sampleCenterColumn().catch(console.error);

