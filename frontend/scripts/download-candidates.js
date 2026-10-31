import fs from 'fs';

async function downloadCandidates() {
  const list = [
    {
      name: 'a_man_is_painting_a_car.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/A_man_is_painting_a_car.jpg'
    },
    {
      name: 'army_autobody_tech.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/LRC_Benelux_autobody_tech_transforms_APS-2_gear_from_tan_to_green_on_Army%E2%80%99s_250th_%289017181%29.jpg'
    },
    {
      name: 'skills_center.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Automotive_Skills_Center_eases_automotive_repair%2C_upkeep_costs_%285433467177%29.jpg'
    },
    {
      name: 'rebirth_unsplash.jpg',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Rebirth_%28Unsplash%29.jpg'
    }
  ];

  for (const item of list) {
    console.log(`Downloading ${item.name}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'EvokeGarageApp/1.0 (https://evokegarage.com; contact@evokegarage.com)'
        }
      });
      if (!res.ok) {
        console.log(`Failed ${item.name}: ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(`scripts/${item.name}`, buf);
      console.log(`Saved scripts/${item.name}: ${buf.length} bytes`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
}

downloadCandidates().catch(console.error);

