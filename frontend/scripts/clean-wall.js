import sharp from 'sharp';

async function cleanWall() {
  // Completely cover the painted wall lettering and oversized background logo
  // In the original image:
  // EVOKE GARAGE text: y ~ 120 - 215, x ~ 230 - 540
  // AUTOMOTIVE ATELIER text: y ~ 215 - 250, x ~ 250 - 520
  // Large circular emblem: y ~ 240 - 415, x ~ 210 - 490
  const overlaySvg = Buffer.from(`
    <svg width="576" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgb(36, 32, 30)" />
          <stop offset="25%" stop-color="rgb(30, 27, 25)" />
          <stop offset="60%" stop-color="rgb(26, 23, 22)" />
          <stop offset="100%" stop-color="rgb(22, 20, 19)" />
        </linearGradient>
        <filter id="feather" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <!-- Matte dark wall patch cleanly concealing the wall lettering and logo -->
      <rect x="200" y="110" width="365" height="315" rx="14" fill="url(#wallGrad)" filter="url(#feather)" />
    </svg>
  `);

  await sharp('public/images/evoke-workshop-hero.backup.jpg')
    .composite([{ input: overlaySvg, blend: 'over' }])
    .jpeg({ quality: 96 })
    .toFile('public/images/evoke-workshop-hero.jpg');

  console.log('Successfully cleaned entire wall patch in evoke-workshop-hero.jpg!');
}

cleanWall().catch(console.error);
