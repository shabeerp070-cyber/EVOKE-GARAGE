import fs from 'fs';
import path from 'path';

// Let's test specific Unsplash photo IDs related strictly to auto painting and dent repair:
const testItems = [
  // 1. Car spray painting gun / booth
  { id: 'paint_gun_car', url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_paint_spray1', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_paint_spray2', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_paint_red_shining', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_paint_mirror_finish', url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80' },

  // 2. Dent repair / metal shaping / bodywork
  { id: 'car_body_repair_craft', url: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_fender_repair', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_body_prep_sand', url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_body_metal_contour', url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80' },

  // 3. Car A/C & Climate systems
  { id: 'car_ac_manifold_belt', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80' },
  { id: 'car_engine_mechanic_inspect', url: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=1200&q=80' },

  // 4. Automotive Electrical Diagnostics
  { id: 'car_diagnostic_mechanic_yellow', url: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=1200&q=80' }
];

const destDir = 'public/images/verified';
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

async function downloadAll() {
  for (const item of testItems) {
    const dest = path.join(destDir, `${item.id}.jpg`);
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        console.log(`Failed ${item.id}: ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`Saved ${dest} (${buf.length} bytes)`);
    } catch (e) {
      console.error(item.id, e.message);
    }
  }
}

downloadAll();

