import sharp from 'sharp';

(async () => {
  const imgPath = 'public/images/evoke-workshop-hero-clean.jpg';
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Let's inspect the RGB and HSL of various points on the car and surroundings:
  // 1. Hood center: x=350, y=570
  // 2. Hood highlight: x=380, y=550
  // 3. Front bumper: x=400, y=750
  // 4. Side door: x=100, y=600
  // 5. Amber turn signal: x=270, y=735
  // 6. Headlight: x=420, y=670
  // 7. Windshield: x=300, y=490
  // 8. Technician glove/gun: x=450, y=490
  // 9. Background shelf: x=320, y=450

  const samples = [
    { label: 'Hood Center', x: 350, y: 570 },
    { label: 'Hood Highlight', x: 380, y: 550 },
    { label: 'Front Bumper Red', x: 400, y: 750 },
    { label: 'Side Door Red', x: 100, y: 600 },
    { label: 'Turn Signal (Amber)', x: 270, y: 735 },
    { label: 'Headlight Glass', x: 420, y: 670 },
    { label: 'Windshield Film', x: 300, y: 490 },
    { label: 'Technician Glove/Gun', x: 450, y: 490 },
    { label: 'Shelf Cans', x: 320, y: 450 },
    { label: 'Spray Mist', x: 400, y: 510 },
  ];

  samples.forEach(s => {
    const idx = (s.y * width + s.x) * channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    console.log(`${s.label} (${s.x}, ${s.y}): R=${r}, G=${g}, B=${b}`);
  });
})();

