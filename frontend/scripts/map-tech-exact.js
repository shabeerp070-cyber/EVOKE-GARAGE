import sharp from 'sharp';

async function mapTechExact() {
  const { data, info } = await sharp('scripts/crop-b-head.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Let's print the boundary in crop coords (cx, cy)
  const boundary = [];
  for (let cy = 0; cy < height; cy++) {
    let edgeX = width;
    for (let cx = 0; cx < width; cx++) {
      const idx = (cy * width + cx) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      
      // The wall in this crop has r ~ 28-36, g ~ 27-33, b ~ 24-30
      // Technician hair has black texture (r < 22 or b < 20 or sharp change)
      // or skin (r > 60, r > g + 15)
      // or glasses frame (r < 20)
      if (cx > 10) { // beyond the circular logo
        const isSkin = (r > 65 && r > g + 12);
        const isHair = (cx > 20 && r < 24 && g < 24 && b < 24);
        const isHighlight = (cx > 35 && (r > 42 || g > 40 || b > 40));
        const isMask = (cx > 20 && r > 90 && g > 90);

        if (isSkin || isHair || isHighlight || isMask) {
          edgeX = cx;
          break;
        }
      }
    }
    boundary.push({ cy, fullY: 330 + cy, edgeX, fullX: 450 + edgeX });
  }

  console.log(JSON.stringify(boundary));
}

mapTechExact().catch(console.error);

