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

    const width = 393;
    const height = 1260;

    const scene = new THREE.Scene();

    // Perspective Camera at angled atelier isometric viewpoint
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 10000);
    // Camera is positioned at (W/2, -H/2 - 350, 1600) looking at (W/2, -H/2, 0)
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

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(width / 2 + 400, -height / 2 + 600, 900);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 100;
    sun.shadow.camera.far = 3000;
    sun.shadow.camera.left = -600;
    sun.shadow.camera.right = 600;
    sun.shadow.camera.top = 1000;
    sun.shadow.camera.bottom = -1000;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xddeeff, 1.1);
    fill.position.set(width / 2 - 400, -height / 2 - 600, 700);
    scene.add(fill);

    // Dynamic ground plane receiver
    const floorGeo = new THREE.PlaneGeometry(2500, 3000);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(width / 2, -height / 2, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Raycaster for projection
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

    // Geometry separator for individual wheels
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

    // SVG Path definition
    const pathD = 'M 0 25 C 80 35, 230 95, 310 170 C 355 220, 345 290, 240 360 C 150 415, 80 445, 90 510 C 110 610, 260 610, 280 700 C 300 790, 140 850, 115 930 C 95 1010, 150 1100, 220 1160 C 270 1200, 330 1225, 415 1240';
    const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svgPath.setAttribute('d', pathD);
    const totalLen = svgPath.getTotalLength();

    function getPathPointAt(t) {
      const p = svgPath.getPointAtLength(Math.max(0, Math.min(1, t)) * totalLen);
      return { x: p.x, y: p.y };
    }

    // Load BMW
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/models/bmw-m4.web.glb', (gltf) => {
      const car = gltf.scene;

      // Normalize size to scale 140px on mobile
      const box = new THREE.Box3().setFromObject(car);
      const size = new THREE.Vector3();
      box.getSize(size);
      const targetLength = 145; // 145px length
      const scale = targetLength / size.z;
      car.scale.setScalar(scale);

      // Re-center
      box.setFromObject(car);
      const center = new THREE.Vector3();
      box.getCenter(center);
      car.position.x -= center.x;
      car.position.y -= center.y;
      car.position.z -= box.min.z; // Wheels on ground

      // Materials setup
      car.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
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

      // Rig the 4 wheels
      const wheelParent = car.getObjectByName('WHeelsandrims_2');
      const wheelRig = { fl: {}, fr: {}, rl: {}, rr: {} };
      if (wheelParent) {
        const originalMeshes = [];
        wheelParent.traverse((child) => {
          if (child.isMesh) originalMeshes.push(child);
        });

        const wheelDefs = {
          fl: { center: new THREE.Vector3(0.55, 0.73, 0), test: (x, y) => x > 0 && y > 0 },
          fr: { center: new THREE.Vector3(-0.55, 0.73, 0), test: (x, y) => x < 0 && y > 0 },
          rl: { center: new THREE.Vector3(0.55, -0.73, 0), test: (x, y) => x > 0 && y < 0 },
          rr: { center: new THREE.Vector3(-0.55, -0.73, 0), test: (x, y) => x < 0 && y < 0 },
        };

        for (const [key, def] of Object.entries(wheelDefs)) {
          const steerGroup = new THREE.Group();
          steerGroup.position.copy(def.center);

          const spinGroup = new THREE.Group();
          steerGroup.add(spinGroup);

          for (const origMesh of originalMeshes) {
            const subGeo = extractSubGeometry(origMesh.geometry, def.test, def.center);
            if (subGeo) {
              const mesh = new THREE.Mesh(subGeo, origMesh.material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              spinGroup.add(mesh);
            }
          }
          wheelParent.add(steerGroup);
          wheelRig[key] = { steerGroup, spinGroup };
        }

        // Hide original merged wheel meshes
        for (const orig of originalMeshes) {
          orig.visible = false;
        }
      }

      // Root wrappers for car motion, yaw drift, and body suspension roll
      const carRoot = new THREE.Group();
      const carYaw = new THREE.Group();
      const carBody = new THREE.Group();

      scene.add(carRoot);
      carRoot.add(carYaw);
      carYaw.add(carBody);
      carBody.add(car);

      // Contact Ground Shadow mesh right under the car
      const contactGeo = new THREE.PlaneGeometry(90, 160);
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(64, 128, 10, 64, 128, 64);
      grad.addColorStop(0, 'rgba(0,0,0,0.85)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 256);

      const shadowTex = new THREE.CanvasTexture(canvas);
      const contactMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      });
      const contactShadow = new THREE.Mesh(contactGeo, contactMat);
      contactShadow.position.set(0, 0, 0.5);
      carYaw.add(contactShadow);

      // Function to update car at scroll progress t (0 to 1)
      function updateCar(t) {
        // Clamp t
        t = Math.max(0, Math.min(1, t));

        // Path positions
        const delta = 0.008;
        const p = getPathPointAt(t);
        const nextP = getPathPointAt(Math.min(1, t + delta));
        const prevP = getPathPointAt(Math.max(0, t - delta));

        // World translation on ground plane
        const worldPos = screenToWorld(p.x, p.y);
        carRoot.position.copy(worldPos);

        // Path tangent angle (screen: +X right, +Y down; Three: +X right, +Y up)
        const dx = nextP.x - prevP.x;
        const dy = nextP.y - prevP.y;
        const tangentAngle = Math.atan2(-dy, dx); // radians

        // Curvature / curvature rate: angle difference
        const nextNextP = getPathPointAt(Math.min(1, t + delta * 2));
        const dx2 = nextNextP.x - nextP.x;
        const dy2 = nextNextP.y - nextP.y;
        const nextTangent = Math.atan2(-dy2, dx2);
        let curvature = (nextTangent - tangentAngle) / delta;
        // Normalize curvature
        if (curvature > Math.PI) curvature -= Math.PI * 2;
        if (curvature < -Math.PI) curvature += Math.PI * 2;

        // Steering angle follows curve naturally:
        // Front wheels turn into the bend
        const steerAngle = THREE.MathUtils.clamp(-curvature * 0.12, -0.45, 0.45);
        if (wheelRig.fl.steerGroup) wheelRig.fl.steerGroup.rotation.z = steerAngle;
        if (wheelRig.fr.steerGroup) wheelRig.fr.steerGroup.rotation.z = steerAngle;

        // Wheel spinning proportional to path distance traveled
        const wheelCircumference = 32; // px
        const spinAngle = (t * totalLen / wheelCircumference) * Math.PI * 2;
        for (const key of ['fl', 'fr', 'rl', 'rr']) {
          if (wheelRig[key].spinGroup) {
            wheelRig[key].spinGroup.rotation.x = spinAngle;
          }
        }

        // Drift Yaw Slip Angle (oversteer sliding rear at high-curvature apexes)
        // At high curvature, the rear kicks outward (opposite to turn direction)
        const slipAngle = THREE.MathUtils.clamp(-curvature * 0.06, -0.28, 0.28);

        // Body roll under lateral g-forces (car leans away from turn)
        const bodyRoll = THREE.MathUtils.clamp(curvature * 0.03, -0.15, 0.15);
        // Suspension pitch (slight braking dive into turns, acceleration squat on exit)
        const bodyPitch = Math.abs(curvature) * 0.02;

        // Apply orientation to carRoot (align along tangent vector on XY plane)
        carRoot.rotation.set(0, 0, 0);
        carRoot.rotation.x = Math.PI / 2; // Flat on XY plane
        carRoot.rotation.y = tangentAngle - Math.PI / 2;

        // Drift slip yaw on carYaw
        carYaw.rotation.y = slipAngle;

        // Body suspension roll & pitch
        carBody.rotation.z = bodyRoll;
        carBody.rotation.x = bodyPitch;

        // Opacity transition at extreme ends
        const opacity = t < 0.05 ? t / 0.05 : (t > 0.95 ? (1 - t) / 0.05 : 1);
        renderer.domElement.style.opacity = opacity.toFixed(3);
      }

      window.__updateCar = (t) => {
        updateCar(t);
        renderer.render(scene, camera);
      };

      window.__CAR_LOADED = true;
      window.__updateCar(0.25);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('public/test-driving-full.html', testHtml);

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 1260, deviceScaleFactor: 2 });
  page.on('console', msg => console.log('DRIVING FULL:', msg.text()));

  await page.goto('http://localhost:3000/test-driving-full.html', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__CAR_LOADED === true, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  // Capture at 3 key moments:
  // 1. t = 0.22 (apex around Card 02)
  await page.evaluate(() => window.__updateCar(0.22));
  await page.screenshot({ path: 'scripts/test-drive-01-card02.png' });

  // 2. t = 0.40 (sweeping across Card 03)
  await page.evaluate(() => window.__updateCar(0.40));
  await page.screenshot({ path: 'scripts/test-drive-02-card03.png' });

  // 3. t = 0.85 (drifting across Car Painting photo)
  await page.evaluate(() => window.__updateCar(0.85));
  await page.screenshot({ path: 'scripts/test-drive-03-paint.png' });

  console.log('Saved 3 driving screenshots!');
  await browser.close();
})();
