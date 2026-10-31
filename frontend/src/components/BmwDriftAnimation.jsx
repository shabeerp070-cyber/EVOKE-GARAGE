import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

gsap.registerPlugin(ScrollTrigger);

// Helper: Extract separate geometry for individual wheels from merged wheel meshes
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

export default function BmwDriftAnimation() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const svgPathRef = useRef(null);

  const [layout, setLayout] = useState({
    top: 4100,
    height: 1260,
    width: 393,
    isMobile: true,
    isReady: false,
  });

  // Measure bounds dynamically from DOM elements with debouncing and change thresholds
  useEffect(() => {
    let resizeTimer = null;
    const updateLayout = () => {
      const main = document.querySelector('main');
      const pillars = document.getElementById('about-pillars');
      const paintFrame = document.getElementById('service-paint-frame') || document.getElementById('paint');

      if (!pillars || !paintFrame) return;

      const mainRect = main ? main.getBoundingClientRect() : { top: 0, left: 0 };
      const pillarsRect = pillars.getBoundingClientRect();
      const paintRect = paintFrame.getBoundingClientRect();

      const top = Math.round(pillarsRect.top - mainRect.top - 15);
      const bottom = Math.round(paintRect.bottom - mainRect.top + 25);
      const height = Math.max(bottom - top, 800);
      const width = main ? main.offsetWidth : window.innerWidth;
      const isMobile = width < 768;

      setLayout((prev) => {
        // Only update state if values actually changed to prevent render loops
        if (
          prev.isReady &&
          Math.abs(prev.top - top) < 6 &&
          Math.abs(prev.height - height) < 10 &&
          Math.abs(prev.width - width) < 6 &&
          prev.isMobile === isMobile
        ) {
          return prev;
        }
        return {
          top,
          height,
          width,
          isMobile,
          isReady: true,
        };
      });
    };

    updateLayout();
    const t1 = setTimeout(updateLayout, 350);

    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLayout, 200);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    window.addEventListener('orientationchange', debouncedResize, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
    };
  }, []);

  const { width, height, isMobile, isReady, top } = layout;

  // Compute SVG Path string according to screen width and user screenshots
  const pathD = isMobile
    ? (() => {
        // Calibrated exact match to user's 3 yellow markup screenshots (iPhone 16: 393x852)
        const sx = width / 393;
        const sy = height / 1260;
        return `M ${0 * sx} ${25 * sy} C ${80 * sx} ${35 * sy}, ${230 * sx} ${95 * sy}, ${310 * sx} ${170 * sy} C ${355 * sx} ${220 * sy}, ${345 * sx} ${290 * sy}, ${240 * sx} ${360 * sy} C ${150 * sx} ${415 * sy}, ${80 * sx} ${445 * sy}, ${90 * sx} ${510 * sy} C ${110 * sx} ${610 * sy}, ${260 * sx} ${610 * sy}, ${280 * sx} ${700 * sy} C ${300 * sx} ${790 * sy}, ${140 * sx} ${850 * sy}, ${115 * sx} ${930 * sy} C ${95 * sx} ${1010 * sy}, ${150 * sx} ${1100 * sy}, ${220 * sx} ${1160 * sy} C ${270 * sx} ${1200 * sy}, ${330 * sx} ${1225 * sy}, ${415 * sx} ${1240 * sy}`;
      })()
    : (() => {
        // Desktop luxury path: sweeps above cards, rounds Card 03, sweeps down past header into paint photo
        const w = width;
        const h = height;
        return `M -60 25 C ${0.15 * w} 20, ${0.35 * w} 25, ${0.50 * w} 35 C ${0.70 * w} 50, ${0.92 * w} 120, ${0.88 * w} 250 C ${0.84 * w} 360, ${0.55 * w} 420, ${0.38 * w} 560 C ${0.25 * w} 680, ${0.42 * w} 750, ${0.40 * w} 880 C ${0.36 * w} 1000, ${0.22 * w} 1150, ${0.34 * w} 1320 C ${0.48 * w} 1440, ${0.72 * w} 1475, ${w + 80} 1485`;
      })();

  // Main 3D WebGL Driving Simulation Setup
  useEffect(() => {
    if (!isReady || !canvasRef.current || !svgPathRef.current || !containerRef.current) return;

    let isDisposed = false;
    const canvas = canvasRef.current;
    const svgPath = svgPathRef.current;
    const totalPathLen = svgPath.getTotalLength ? svgPath.getTotalLength() : 2000;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();

    // Perspective Camera at angled atelier isometric viewpoint
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 12000);
    // Camera looks down with luxury 3D perspective
    const camYOffset = isMobile ? -380 : -450;
    const camDist = isMobile ? 1650 : 2000;
    camera.position.set(width / 2, -height / 2 + camYOffset, camDist);
    camera.lookAt(width / 2, -height / 2, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile, // Disable expensive multisample antialiasing on mobile
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.setSize(width, height);
    // On mobile clamp DPR to 1.0 (huge GPU fill-rate boost on 3x screens). On desktop clamp to 1.5.
    const pixelRatio = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.0)
      : Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    
    // Directional shadow mapping enabled only on desktop (mobile uses zero-cost contactShadowMesh)
    renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) {
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    // Studio Atelier Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(width / 2 + 400, -height / 2 + 700, 950);
    sunLight.castShadow = !isMobile;
    if (!isMobile) {
      sunLight.shadow.mapSize.width = 512;
      sunLight.shadow.mapSize.height = 512;
      sunLight.shadow.camera.near = 100;
      sunLight.shadow.camera.far = 3500;
    }
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.2);
    fillLight.position.set(width / 2 - 400, -height / 2 - 600, 700);
    scene.add(fillLight);

    // Floor shadow receiver plane (only instantiated on desktop)
    let floorGeo = null;
    let floorMat = null;
    let floor = null;
    if (!isMobile) {
      floorGeo = new THREE.PlaneGeometry(width * 2.5, height * 2);
      floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.set(width / 2, -height / 2, 0);
      floor.receiveShadow = true;
      scene.add(floor);
    }

    // Raycaster for exact 2D Screen -> 3D World projection on Ground Plane
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

    function getPathPointAt(t) {
      const p = svgPath.getPointAtLength(Math.max(0, Math.min(1, t)) * totalPathLen);
      return { x: p.x, y: p.y };
    }

    // Car Groups hierarchy:
    // carRoot (translates along path) -> carYaw (drift slip angle) -> carBody (suspension roll/pitch) -> carModel
    const carRoot = new THREE.Group();
    const carYaw = new THREE.Group();
    const carBody = new THREE.Group();

    scene.add(carRoot);
    carRoot.add(carYaw);
    carYaw.add(carBody);

    // Ground Contact Shadow directly under the chassis
    const shadowGeo = new THREE.PlaneGeometry(isMobile ? 85 : 120, isMobile ? 155 : 220);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(64, 128, 12, 64, 128, 64);
    sGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
    sGrad.addColorStop(0.5, 'rgba(0,0,0,0.35)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.flipY = false;
    shadowTex.premultiplyAlpha = false;
    shadowTex.needsUpdate = true;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadowMesh.position.set(0, 0, 0.4);
    carYaw.add(contactShadowMesh);

    // Wheel rig references for steering & spinning
    const wheelRig = { fl: {}, fr: {}, rl: {}, rr: {} };
    const allocatedGeometries = [];
    let isCarLoaded = false;
    let isInViewport = false;
    let lastRenderedProgress = -1;

    // Load BMW 3D Model
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      '/models/bmw-m4.web.glb',
      (gltf) => {
        if (isDisposed) return;
        const car = gltf.scene;

        // Scale car to realistic proportions (Mobile: ~145px, Desktop: ~230px)
        const box = new THREE.Box3().setFromObject(car);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetLength = isMobile ? 145 : 230;
        const scale = targetLength / size.z;
        car.scale.setScalar(scale);

        // Center car model
        box.setFromObject(car);
        const center = new THREE.Vector3();
        box.getCenter(center);
        car.position.x -= center.x;
        car.position.y -= center.y;
        car.position.z -= box.min.z; // Sit wheels directly on ground plane Z = 0

        // PBR Materials setup
        car.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = !isMobile;
            node.receiveShadow = !isMobile;
            if (node.material) {
              const materials = Array.isArray(node.material) ? node.material : [node.material];
              materials.forEach((mat) => {
                ['map', 'emissiveMap', 'roughnessMap', 'metalnessMap', 'normalMap', 'aoMap', 'alphaMap'].forEach((mapProp) => {
                  if (mat[mapProp]) {
                    mat[mapProp].flipY = false;
                    mat[mapProp].premultiplyAlpha = false;
                  }
                });
              });

              if (node.material.name === 'Meshesbody151Mtl') {
                node.material.color.setHex(0xfafafa); // Pure Alpine White Paint
                node.material.roughness = 0.1;
                node.material.metalness = 0.15;
              }
              if (node.material.name && /rim|wheel/i.test(node.material.name)) {
                node.material.color.setHex(0x1a1a1a); // Shadowline Gunmetal / Black M Rims
                node.material.roughness = 0.22;
                node.material.metalness = 0.88;
              }
              if (node.material.name && /caliper/i.test(node.material.name)) {
                node.material.color.setHex(0x1e40af); // Electric Blue M Brake Caliper
                node.material.roughness = 0.2;
                node.material.metalness = 0.8;
              }
              if (node.material.name && /window|glass/i.test(node.material.name)) {
                node.material.transparent = true;
                node.material.opacity = 0.7;
                node.material.roughness = 0.05;
              }
            }
          }
        });

        // Rig the 4 individual wheels for steering & spinning
        const wheelParent = car.getObjectByName('WHeelsandrims_2');
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
                allocatedGeometries.push(subGeo);
                const mesh = new THREE.Mesh(subGeo, origMesh.material);
                mesh.castShadow = !isMobile;
                mesh.receiveShadow = !isMobile;
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

        carBody.add(car);
        isCarLoaded = true;

        // Render initial frame if already in viewport
        if (isInViewport) {
          updateDrivingSequence(0);
        }
      },
      undefined,
      (err) => {
        console.error('Failed to load BMW 3D GLB model:', err);
      }
    );

    // Update Driving Physics along Path at Progress t (0 to 1)
    function updateDrivingSequence(t) {
      if (isDisposed || !isCarLoaded || !isInViewport) return;
      t = Math.max(0, Math.min(1, t));

      // Avoid redundant calculations if progress has not shifted noticeably
      if (Math.abs(t - lastRenderedProgress) < 0.0003) return;
      lastRenderedProgress = t;

      // 1. Sample points for position, forward direction, and curvature
      const delta = 0.005;
      const p0 = getPathPointAt(Math.max(0, t - delta));
      const p1 = getPathPointAt(Math.min(1, t + delta));
      const currP = getPathPointAt(t);

      const w0 = screenToWorld(p0.x, p0.y);
      const w1 = screenToWorld(p1.x, p1.y);
      const currW = screenToWorld(currP.x, currP.y);

      // Car Translation in 3D
      carRoot.position.copy(currW);

      // 2. 3D Basis Alignment along Path Tangent
      const forward = new THREE.Vector3().subVectors(w1, w0).normalize();
      const up = new THREE.Vector3(0, 0, 1); // Roof faces camera along +Z
      const right = new THREE.Vector3().crossVectors(up, forward).normalize();

      // Construct right-handed rotation matrix (car forward is +Z, roof is +Y in local space)
      const basisMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
      carRoot.quaternion.setFromRotationMatrix(basisMatrix);

      // 3. Dynamic Curvature & Steering Angle
      const nextNextP = getPathPointAt(Math.min(1, t + delta * 2));
      const w2 = screenToWorld(nextNextP.x, nextNextP.y);
      const forwardNext = new THREE.Vector3().subVectors(w2, w1).normalize();

      // Signed angle change between forward vectors
      const crossZ = forward.x * forwardNext.y - forward.y * forwardNext.x;
      const curvature = crossZ / delta;

      // Front Wheels steer into the curve
      const steerAngle = THREE.MathUtils.clamp(-curvature * 0.16, -0.45, 0.45);
      if (wheelRig.fl.steerGroup) wheelRig.fl.steerGroup.rotation.z = steerAngle;
      if (wheelRig.fr.steerGroup) wheelRig.fr.steerGroup.rotation.z = steerAngle;

      // 4. Wheels Spinning proportional to physical distance traveled
      const wheelCircumference = isMobile ? 32 : 52;
      const spinAngle = (t * totalPathLen / wheelCircumference) * Math.PI * 2;
      for (const key of ['fl', 'fr', 'rl', 'rr']) {
        if (wheelRig[key].spinGroup) {
          wheelRig[key].spinGroup.rotation.x = spinAngle;
        }
      }

      // 5. Believable Drift Slip Angle, Acceleration Squat, and Body Roll
      // Drift slip: rear slides outward during high curvature apexes
      const slipAngle = THREE.MathUtils.clamp(-curvature * 0.08, -0.32, 0.32);
      carYaw.rotation.y = slipAngle;

      // Lateral Body Roll: car leans away from turn under centrifugal force
      const bodyRoll = THREE.MathUtils.clamp(curvature * 0.04, -0.15, 0.15);
      // Suspension pitch: slight braking dive into turn, squat on straight
      const bodyPitch = Math.abs(curvature) * 0.02;

      carBody.rotation.z = bodyRoll;
      carBody.rotation.x = bodyPitch;

      // 6. Smooth Opacity at Start and Exit
      const fadeDist = 0.04;
      const opacity = t < fadeDist ? t / fadeDist : (t > 1 - fadeDist ? (1 - t) / fadeDist : 1);
      
      // Zero-cost culling when completely faded out
      if (opacity <= 0.01) {
        canvas.style.opacity = '0';
        return;
      }
      canvas.style.opacity = opacity.toFixed(3);

      if (!isDisposed) {
        renderer.render(scene, camera);
      }
    }

    // 2. Setup ScrollTrigger driving synchronization with active viewport culling
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 95%',
        end: 'bottom 5%',
        scrub: isMobile ? 0.8 : 1.2,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          isInViewport = self.isActive;
          if (!self.isActive) {
            canvas.style.opacity = '0';
          }
        },
        onUpdate: (self) => {
          if (isDisposed || !isInViewport) return;
          updateDrivingSequence(self.progress);
        },
      });
    }, containerRef.current);

    return () => {
      isDisposed = true;
      ctx.revert();
      allocatedGeometries.forEach((geo) => geo.dispose());
      shadowTex.dispose();
      shadowMat.dispose();
      shadowGeo.dispose();
      if (floorMat) floorMat.dispose();
      if (floorGeo) floorGeo.dispose();
      renderer.dispose();
    };
  }, [isReady, pathD, width, height, isMobile]);

  return (
    <div
      ref={containerRef}
      id="bmw-drift-track"
      className="absolute left-0 w-full pointer-events-none select-none z-20 overflow-visible"
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
      aria-hidden="true"
    >
      {/* Invisible SVG Motion Path for length calculation & trajectory sampling */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-[3]"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          ref={svgPathRef}
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth="1"
        />
      </svg>

      {/* 3D WebGL Canvas for Realistic BMW Driving Animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[10] transform-gpu will-change-[opacity]"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
