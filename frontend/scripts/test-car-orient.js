import puppeteer from 'puppeteer-core';
import fs from 'fs';

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

      // Find original bounds
      const box = new THREE.Box3().setFromObject(car);
      console.log('Original Box Min:', JSON.stringify(box.min), 'Max:', JSON.stringify(box.max));
      const size = new THREE.Vector3();
      box.getSize(size);
      console.log('Original Size:', JSON.stringify(size));

      // Test nose position: add a small red sphere at (0, 0, +maxZ) and blue at (0, 0, -minZ)
      // and check which end is the front!
      window.__DONE = true;
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-orient.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('ORIENT:', msg.text()));
  await page.goto('http://localhost:3000/test-orient.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__DONE === true, { timeout: 10000 });
  await browser.close();
})();
