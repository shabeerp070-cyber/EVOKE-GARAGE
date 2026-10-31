import * as THREE from 'three';
import fs from 'fs';
import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const testHtml = `
<!DOCTYPE html>
<html>
<body>
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.170.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.170.0/examples/jsm/"
      }
    }
  </script>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/models/bmw-m4.web.glb', (gltf) => {
      const car = gltf.scene;
      
      const wheelParent = car.getObjectByName('WHeelsandrims_2');
      console.log('Wheel parent:', wheelParent ? wheelParent.name : 'none');

      if (wheelParent) {
        wheelParent.traverse((child) => {
          if (child.isMesh) {
            const pos = child.geometry.attributes.position;
            console.log('Wheel mesh:', child.name, 'verts:', pos.count);
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;
            let minZ = Infinity, maxZ = -Infinity;
            for (let i = 0; i < pos.count; i++) {
              const x = pos.getX(i);
              const y = pos.getY(i);
              const z = pos.getZ(i);
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
              if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
            }
            console.log('Bounds:', child.name, JSON.stringify({ minX, maxX, minY, maxY, minZ, maxZ }));
          }
        });
      }
      window.__DONE = true;
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-wheels.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('WHEEL CHECK:', msg.text()));
  await page.goto('http://localhost:3000/test-wheels.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__DONE === true, { timeout: 10000 });
  await browser.close();
})();
