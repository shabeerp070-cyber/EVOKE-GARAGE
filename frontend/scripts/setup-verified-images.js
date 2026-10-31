import fs from 'fs';
import path from 'path';

const map = [
  // Hero: Dodge Challenger inside workshop hangar with ambient glow & taillights
  { src: 'public/images/hero_dark_challenger.jpg', dest: 'public/images/hero-car.jpg' },

  // Service 1: Car Painting & Finish
  { src: 'public/images/test-batch/body_detail_2.jpg', dest: 'public/images/car-painting.jpg' },

  // Service 2: Denting & Body Repair (Car on lift with technician)
  { src: 'public/images/car_dent_body_prep.jpg', dest: 'public/images/denting-body-repair.jpg' },

  // Service 3: Car A/C Work (Engine A/C compressor & belt system)
  { src: 'public/images/mechanic_diagnostic_tool.jpg', dest: 'public/images/car-ac-work.jpg' },

  // Service 4: Automotive Electrical Work (Technician with diagnostic tool under bonnet)
  { src: 'public/images/car_welding_metal.jpg', dest: 'public/images/automotive-electrical.jpg' },

  // 3-Slide Showcase (Step 3 in reference visual rhythm)
  { src: 'public/images/hero_car_studio_front.jpg', dest: 'public/images/showcase-1.jpg' },
  { src: 'public/images/metal_contour_prep.jpg', dest: 'public/images/showcase-2.jpg' },
  { src: 'public/images/test-batch/body_detail_1.jpg', dest: 'public/images/showcase-3.jpg' },

  // Large car detail with oversized statement (Step 4 in reference)
  { src: 'public/images/hero_dark_studio_porsche.jpg', dest: 'public/images/large-statement-car.jpg' },

  // Workshop Gallery (Step 6 in reference)
  { src: 'public/images/hero_dark_challenger.jpg', dest: 'public/images/gallery-1.jpg' },
  { src: 'public/images/car_dent_body_prep.jpg', dest: 'public/images/gallery-2.jpg' },
  { src: 'public/images/mechanic_diagnostic_tool.jpg', dest: 'public/images/gallery-3.jpg' },
  { src: 'public/images/car_welding_metal.jpg', dest: 'public/images/gallery-4.jpg' },
  { src: 'public/images/car_engine_mechanic_inspect.jpg', dest: 'public/images/gallery-5.jpg' },
  { src: 'public/images/test-batch/body_detail_2.jpg', dest: 'public/images/gallery-6.jpg' }
];

for (const item of map) {
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, item.dest);
    console.log(`Copied ${item.src} -> ${item.dest}`);
  } else {
    console.error(`Missing source: ${item.src}`);
  }
}

console.log('\nAll verified automotive images organized.');
