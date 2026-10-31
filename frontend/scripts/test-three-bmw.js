import * as THREE from 'three';
import fs from 'fs';
import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// We will launch puppeteer, load a page that renders Three.js with bmw-m4.web.glb,
// and take screenshots to verify 3D lighting, wheels, steering, and perspective.

const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #FAFAFA; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
</head>
<body>
  <div id="info" style="position:fixed;top:10px;left:10px;font-family:sans-serif;font-size:12px;color:#000;"></div>
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

    const width = 800;
    const height = 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f4f5);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(2, 2.5, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(2);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Atelier Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 10, 7);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.0);
    fillLight.position.set(-5, 6, -4);
    scene.add(fillLight);

    // Floor grid shadow plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(20, 20);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/models/bmw-m4.web.glb', (gltf) => {
      const car = gltf.scene;

      // Center car and normalize size
      const box = new THREE.Box3().setFromObject(car);
      const size = new THREE.Vector3();
      box.getSize(size);
      console.log('Original Car Size:', size);

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.5 / maxDim; // 2.5 units long
      car.scale.setScalar(scale);

      // Re-center after scaling
      box.setFromObject(car);
      const center = new THREE.Vector3();
      box.getCenter(center);
      car.position.x -= center.x;
      car.position.z -= center.z;
      car.position.y -= box.min.y; // Sit on ground plane

      // Enable shadows and luxury materials
      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.envMapIntensity = 1.5;
            if (node.material.name === 'Meshesbody151Mtl') {
              node.material.color.setHex(0xfafafa); // Pure Alpine White Paint
              node.material.roughness = 0.1;
              node.material.metalness = 0.15;
            }
            if (node.material.name && /rim|wheel/i.test(node.material.name)) {
              node.material.color.setHex(0x1a1a1a); // Gunmetal Black M Rims
              node.material.roughness = 0.25;
              node.material.metalness = 0.85;
            }
            if (node.material.name && /caliper/i.test(node.material.name)) {
              node.material.color.setHex(0x1e40af); // Electric Blue M Brake Caliper
              node.material.roughness = 0.2;
              node.material.metalness = 0.8;
            }
          }
        }
      });

      scene.add(car);
      window.__CAR_LOADED = true;
      window.__CAR_BOX = box;
      document.getElementById('info').textContent = 'Car loaded successfully';

      renderer.render(scene, camera);
    }, undefined, (err) => {
      console.error('Load error:', err);
      document.getElementById('info').textContent = 'Load error: ' + err.message;
    });

    window.__render = () => renderer.render(scene, camera);
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-three.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 2 });
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:3000/test-three.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__CAR_LOADED === true, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: 'scripts/test-three-preview.png' });
  console.log('Saved scripts/test-three-preview.png');

  await browser.close();
})();
