import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; background: #FAFAFA; overflow: hidden; }
    canvas { width: 393px; height: 1260px; display: block; }
  </style>
</head>
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

    const width = 393;
    const height = 1260;

    const scene = new THREE.Scene();

    // Perspective camera with top-down isometric angle
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 10000);
    camera.position.set(width / 2, -height / 2 - 380, 1650);
    camera.lookAt(width / 2, -height / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(2);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.8);
    sun.position.set(width / 2 + 400, -height / 2 + 600, 900);
    sun.castShadow = true;
    scene.add(sun);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();

    function screenToWorld(sx, sy) {
      const ndcX = (sx / width) * 2 - 1;
      const ndcY = -(sy / height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const target = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, target);
      return target;
    }

    const pathD = 'M 0 25 C 80 35, 230 95, 310 170 C 355 220, 345 290, 240 360 C 150 415, 80 445, 90 510 C 110 610, 260 610, 280 700 C 300 790, 140 850, 115 930 C 95 1010, 150 1100, 220 1160 C 270 1200, 330 1225, 415 1240';
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('d', pathD);
    const totalLen = svgPath.getTotalLength();

    function getPathPointAt(t) {
      const p = svgPath.getPointAtLength(Math.max(0, Math.min(1, t)) * totalLen);
      return { x: p.x, y: p.y };
    }

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/models/bmw-m4.web.glb', (gltf) => {
      const car = gltf.scene;

      const box = new THREE.Box3().setFromObject(car);
      const size = new THREE.Vector3();
      box.getSize(size);
      const targetLength = 145;
      const scale = targetLength / size.z;
      car.scale.setScalar(scale);

      box.setFromObject(car);
      const center = new THREE.Vector3();
      box.getCenter(center);
      car.position.x -= center.x;
      car.position.y -= center.y;
      car.position.z -= box.min.z;

      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            if (node.material.name === 'Meshesbody151Mtl') {
              node.material.color.setHex(0xfafafa);
              node.material.roughness = 0.1;
              node.material.metalness = 0.15;
            }
            if (node.material.name && /rim|wheel/i.test(node.material.name)) {
              node.material.color.setHex(0x1a1a1a);
              node.material.roughness = 0.25;
              node.material.metalness = 0.85;
            }
          }
        }
      });

      const carRoot = new THREE.Group();
      scene.add(carRoot);
      carRoot.add(car);

      function updateCar(t) {
        const delta = 0.005;
        const p0 = getPathPointAt(Math.max(0, t - delta));
        const p1 = getPathPointAt(Math.min(1, t + delta));

        const w0 = screenToWorld(p0.x, p0.y);
        const w1 = screenToWorld(p1.x, p1.y);
        const curr = screenToWorld(getPathPointAt(t).x, getPathPointAt(t).y);

        carRoot.position.copy(curr);

        // Direction vector in world ground plane
        const forward = new THREE.Vector3().subVectors(w1, w0).normalize();
        const up = new THREE.Vector3(0, 0, 1); // Roof points up towards +Z (camera)
        const right = new THREE.Vector3().crossVectors(up, forward).normalize();

        // Construct proper right-handed 3D rotation matrix
        // In local space: +X is right, +Y is up, +Z is forward
        const m = new THREE.Matrix4().makeBasis(right, up, forward);
        carRoot.quaternion.setFromRotationMatrix(m);
      }

      window.__updateCar = (t) => {
        updateCar(t);
        renderer.render(scene, camera);
      };

      window.__READY = true;
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-matrix.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 1260, deviceScaleFactor: 2 });
  page.on('console', msg => console.log('MATRIX:', msg.text()));

  await page.goto('http://localhost:3000/test-matrix.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__READY === true, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  // Test at t = 0.40 (down-left across Card 03)
  await page.evaluate(() => window.__updateCar(0.40));
  await page.screenshot({ path: 'scripts/test-matrix-0.40.png' });

  // Test at t = 0.60 (sweeping down-right across Core Disciplines)
  await page.evaluate(() => window.__updateCar(0.60));
  await page.screenshot({ path: 'scripts/test-matrix-0.60.png' });

  console.log('Saved test-matrix screenshots!');
  await browser.close();
})();
