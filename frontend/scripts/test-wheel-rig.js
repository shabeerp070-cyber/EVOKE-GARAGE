import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const testHtml = `
<!DOCTYPE html>
<html>
<body>
  <div id="info"></div>
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

    function extractSubGeometry(sourceGeo, testFn, centerOffset) {
      const index = sourceGeo.index;
      const posAttr = sourceGeo.attributes.position;
      const normalAttr = sourceGeo.attributes.normal;
      const uvAttr = sourceGeo.attributes.uv;

      const newIndices = [];
      const newPositions = [];
      const newNormals = [];
      const newUvs = [];
      const vertexMap = new Map();

      const numFaces = index ? index.count / 3 : posAttr.count / 3;

      for (let f = 0; f < numFaces; f++) {
        const i0 = index ? index.getX(f * 3) : f * 3;
        const i1 = index ? index.getX(f * 3 + 1) : f * 3 + 1;
        const i2 = index ? index.getX(f * 3 + 2) : f * 3 + 2;

        const x0 = posAttr.getX(i0), y0 = posAttr.getY(i0);
        const x1 = posAttr.getX(i1), y1 = posAttr.getY(i1);
        const x2 = posAttr.getX(i2), y2 = posAttr.getY(i2);

        const avgX = (x0 + x1 + x2) / 3;
        const avgY = (y0 + y1 + y2) / 3;

        if (testFn(avgX, avgY)) {
          [i0, i1, i2].forEach((origIdx) => {
            if (!vertexMap.has(origIdx)) {
              const newIdx = newPositions.length / 3;
              vertexMap.set(origIdx, newIdx);
              newPositions.push(
                posAttr.getX(origIdx) - centerOffset.x,
                posAttr.getY(origIdx) - centerOffset.y,
                posAttr.getZ(origIdx) - centerOffset.z
              );
              if (normalAttr) {
                newNormals.push(normalAttr.getX(origIdx), normalAttr.getY(origIdx), normalAttr.getZ(origIdx));
              }
              if (uvAttr) {
                newUvs.push(uvAttr.getX(origIdx), uvAttr.getY(origIdx));
              }
            }
            newIndices.push(vertexMap.get(origIdx));
          });
        }
      }

      if (newIndices.length === 0) return null;

      const newGeo = new THREE.BufferGeometry();
      newGeo.setIndex(newIndices);
      newGeo.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
      if (newNormals.length) newGeo.setAttribute('normal', new THREE.Float32BufferAttribute(newNormals, 3));
      if (newUvs.length) newGeo.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
      return newGeo;
    }

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/models/bmw-m4.web.glb', (gltf) => {
      const car = gltf.scene;
      const wheelParent = car.getObjectByName('WHeelsandrims_2');
      console.log('Wheel parent found:', !!wheelParent);

      // Find centers of 4 wheels
      // In WHeelsandrims_2 local coords:
      const flCenter = new THREE.Vector3(0.55, 0.73, 0);
      const frCenter = new THREE.Vector3(-0.55, 0.73, 0);
      const rlCenter = new THREE.Vector3(0.55, -0.73, 0);
      const rrCenter = new THREE.Vector3(-0.55, -0.73, 0);

      const wheels = {
        fl: { center: flCenter, test: (x, y) => x > 0 && y > 0, meshes: [] },
        fr: { center: frCenter, test: (x, y) => x < 0 && y > 0, meshes: [] },
        rl: { center: rlCenter, test: (x, y) => x > 0 && y < 0, meshes: [] },
        rr: { center: rrCenter, test: (x, y) => x < 0 && y < 0, meshes: [] },
      };

      const originalMeshes = [];
      wheelParent.traverse((child) => {
        if (child.isMesh) originalMeshes.push(child);
      });

      console.log('Original wheel meshes count:', originalMeshes.length);

      for (const [key, wheel] of Object.entries(wheels)) {
        const group = new THREE.Group();
        group.position.copy(wheel.center);
        wheel.group = group;

        const spinGroup = new THREE.Group();
        group.add(spinGroup);
        wheel.spinGroup = spinGroup;

        for (const origMesh of originalMeshes) {
          const subGeo = extractSubGeometry(origMesh.geometry, wheel.test, wheel.center);
          if (subGeo) {
            const mesh = new THREE.Mesh(subGeo, origMesh.material);
            spinGroup.add(mesh);
            wheel.meshes.push(mesh);
          }
        }
        wheelParent.add(group);
      }

      // Hide original combined meshes
      for (const origMesh of originalMeshes) {
        origMesh.visible = false;
      }

      console.log('Successfully rigged 4 individual wheels!');
      for (const [key, wheel] of Object.entries(wheels)) {
        console.log(key, 'meshes:', wheel.meshes.length);
      }

      window.__WHEELS_RIGGED = true;
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-wheels-rig.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('WHEEL RIG:', msg.text()));
  await page.goto('http://localhost:3000/test-wheels-rig.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__WHEELS_RIGGED === true, { timeout: 10000 });
  await browser.close();
})();
