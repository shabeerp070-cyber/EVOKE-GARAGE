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

    // Perspective camera with top-down isometric/atelier angle
    const camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
    // Position camera looking down-angled at the center of the track
    const camDist = 1800;
    camera.position.set(width / 2, -height / 2 - 250, camDist);
    camera.lookAt(width / 2, -height / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(2);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Studio lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.8);
    sun.position.set(width / 2 + 300, -height / 2 + 500, 800);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xddeeff, 1.2);
    fill.position.set(width / 2 - 300, -height / 2 - 500, 600);
    scene.add(fill);

    // Ground shadow receiver
    const floorGeo = new THREE.PlaneGeometry(3000, 3000);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(width / 2, -height / 2, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Helper: Unproject 2D screen pixel (x, y) onto ground plane Z = 0
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

    // SVG Path definition from user screenshots
    const pathD = 'M 0 25 C 80 35, 230 95, 310 170 C 355 220, 345 290, 240 360 C 150 415, 80 445, 90 510 C 110 610, 260 610, 280 700 C 300 790, 140 850, 115 930 C 95 1010, 150 1100, 220 1160 C 270 1200, 330 1225, 415 1240';

    // Parse SVG path to sample points
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('d', pathD);
    const totalLen = svgPath.getTotalLength();

    function getPathPointAt(t) {
      const p = svgPath.getPointAtLength(t * totalLen);
      return { x: p.x, y: p.y };
    }

    // Load BMW model
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/models/bmw-m4.web.glb', (gltf) => {
      const car = gltf.scene;

      // Normalize size
      const box = new THREE.Box3().setFromObject(car);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      // On mobile screen (393px width), car length should be around 130px
      const targetLength = 130;
      const scale = targetLength / size.z;
      car.scale.setScalar(scale);

      // Re-center
      box.setFromObject(car);
      const center = new THREE.Vector3();
      box.getCenter(center);
      car.position.x -= center.x;
      car.position.y -= center.y;
      car.position.z -= box.min.z; // Wheels on Z = 0 ground plane

      // Materials setup
      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            if (node.material.name === 'Meshesbody151Mtl') {
              node.material.color.setHex(0xfafafa);
              node.material.roughness = 0.12;
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

      // Car root wrapper
      const carWrapper = new THREE.Group();
      carWrapper.add(car);
      scene.add(carWrapper);

      // Function to place car at progress t (0 to 1)
      function setProgress(t) {
        const p = getPathPointAt(t);
        const nextP = getPathPointAt(Math.min(t + 0.01, 1));
        const prevP = getPathPointAt(Math.max(t - 0.01, 0));

        const worldPos = screenToWorld(p.x, p.y);
        carWrapper.position.copy(worldPos);

        // Path tangent direction on screen
        const dx = nextP.x - prevP.x;
        const dy = nextP.y - prevP.y;
        // In screen coords: x is right, y is down
        // In Three coords: X is right, Y is up (so -dy)
        const angle = Math.atan2(-dy, dx); // radians

        // Orient car: in original model, +Z is forward, +Y is up.
        // We want car forward (+Z in local space) to point along (dx, -dy) in world (X, Y) plane
        carWrapper.rotation.set(0, 0, 0);
        // Rotate so +Z points along tangent vector in XY plane
        carWrapper.rotation.x = Math.PI / 2; // Lie flat on XY ground plane
        carWrapper.rotation.y = angle - Math.PI / 2;
      }

      window.__setProgress = (t) => {
        setProgress(t);
        renderer.render(scene, camera);
      };

      window.__CAR_READY = true;
      window.__setProgress(0.2); // Preview at t = 0.2 (Card 01 to Card 02)
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-3d-path.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 1260, deviceScaleFactor: 2 });
  page.on('console', msg => console.log('3D PATH:', msg.text()));

  await page.goto('http://localhost:3000/test-3d-path.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__CAR_READY === true, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: 'scripts/test-3d-path-preview.png' });
  console.log('Saved scripts/test-3d-path-preview.png');

  await browser.close();
})();
