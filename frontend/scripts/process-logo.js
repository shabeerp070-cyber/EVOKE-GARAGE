import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processLogo() {
  const inputPath = path.resolve('evoke-garage-logo.jpeg');
  const publicDir = path.resolve('public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy raw logo to public
  fs.copyFileSync(inputPath, path.join(publicDir, 'logo.jpg'));

  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width;
  const height = metadata.height;
  const size = Math.min(width, height);
  const radius = size / 2;

  // 1. Create a circular mask for clean circular badge
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="#fff" /></svg>`
  );

  await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .composite([{
      input: circleSvg,
      blend: 'dest-in'
    }])
    .png()
    .toFile(path.join(publicDir, 'logo-circle.png'));

  // 2. Extract raw pixel data to create transparent monochrome versions
  const { data, info } = await sharp(inputPath)
    .resize(800, 800, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixelCount = info.width * info.height;

  // A) Dark version: white graphics on transparent background
  const darkBuffer = Buffer.alloc(pixelCount * 4);
  // B) Black graphics on transparent background
  const lightBuffer = Buffer.alloc(pixelCount * 4);

  const centerX = info.width / 2;
  const centerY = info.height / 2;
  const maxR = Math.min(centerX, centerY) * 0.99;

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Position check (to avoid dark corners outside the circle)
    const px = i % info.width;
    const py = Math.floor(i / info.width);
    const dist = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);

    // Calculate brightness (0 = black, 255 = white)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

    // Dark corners outside circle should be fully transparent
    if (dist > maxR) {
      darkBuffer[idx + 3] = 0;
      lightBuffer[idx + 3] = 0;
      continue;
    }

    // Logo graphic is dark, background is white.
    // If brightness is close to 255 -> background
    // If brightness is close to 0 -> graphic
    // We invert brightness so that dark pixels (graphic) become opaque
    const graphicOpacity = Math.max(0, Math.min(255, (230 - brightness) * 1.8));

    // Dark theme logo: pure white symbol (#FFFFFF) with opacity matching graphic
    darkBuffer[idx] = 255;
    darkBuffer[idx + 1] = 255;
    darkBuffer[idx + 2] = 255;
    darkBuffer[idx + 3] = graphicOpacity;

    // Light theme logo: pure black symbol (#000000) with opacity matching graphic
    lightBuffer[idx] = 15;
    lightBuffer[idx + 1] = 15;
    lightBuffer[idx + 2] = 15;
    lightBuffer[idx + 3] = graphicOpacity;
  }

  await sharp(darkBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(path.join(publicDir, 'logo-white.png'));

  await sharp(lightBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(path.join(publicDir, 'logo-black.png'));

  // Also create a crisp 128x128 favicon
  await sharp(path.join(publicDir, 'logo-circle.png'))
    .resize(128, 128)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated logo assets in public/');
}

processLogo().catch(console.error);

