/**
 * NT Solar Academy - Three.js 3D Interactive Viewer Module
 * Loads and renders the GLB model (LLK_exchange_site.glb) with full orbit, touch & keyboard controls,
 * interactive equipment hotspots, and resilient error recovery.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initThreeViewer({ stage, status, controls, section, modelUrl }) {
  if (!stage) return null;

  let disposed = false, visible = false, raf = 0, lastFrame = 0, dragging = false;
  let showHotspots = true;
  const hotspotMarkers = [];

  const pointerAbort = new AbortController();
  const uiAbort = new AbortController();
  const activePointers = new Map();

  // Robust Error Display Handler
  const showFailure = (title, error) => {
    const detail = error?.message || String(error || 'ไม่พบรายละเอียดจากตัวโหลด');
    console.error(`[MODULE 12 3D ERROR] ${title}:`, error);

    try {
      if (raf) cancelAnimationFrame(raf);
      renderer?.domElement?.remove();
    } catch (e) {
      console.warn('Pre-cleanup warning', e);
    }

    stage.querySelector('.stage-placeholder')?.remove();
    stage.querySelector('.stage-hotspots')?.remove();

    let box = stage.querySelector('.stage-fallback');
    if (!box) {
      box = document.createElement('div');
      box.className = 'stage-fallback';
      stage.appendChild(box);
    }
    box.replaceChildren();

    const icon = document.createElement('span');
    icon.className = 'stage-fallback-icon';
    icon.textContent = '⚠';

    const heading = document.createElement('b');
    heading.textContent = title;

    const message = document.createElement('p');
    message.className = 'stage-fallback-msg';
    message.textContent = 'สาเหตุที่ตรวจพบ: ' + detail;

    const path = document.createElement('code');
    path.className = 'stage-error-path';
    path.textContent = 'Model URL: ' + modelUrl;

    const hint = document.createElement('small');
    hint.textContent = 'คำแนะนำ: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต ไฟล์ GLB หรือเปิดดูผ่านลิงก์สำรองด้านล่าง';

    const actions = document.createElement('div');
    actions.className = 'stage-fallback-actions';

    const reloadBtn = document.createElement('button');
    reloadBtn.type = 'button';
    reloadBtn.className = 'btn btn-yellow';
    reloadBtn.textContent = '↻ ลองโหลดใหม่อีกครั้ง';
    reloadBtn.addEventListener('click', () => window.location.reload());

    const arLink = document.createElement('a');
    arLink.href = 'https://solar-ar-llk.netlify.app/';
    arLink.target = '_blank';
    arLink.rel = 'noopener noreferrer';
    arLink.className = 'btn btn-glass';
    arLink.textContent = 'เปิด LLK_SolarAR ↗';

    actions.append(reloadBtn, arLink);
    box.append(icon, heading, message, path, hint, actions);

    if (status) {
      status.textContent = 'โหลดโมเดลไม่สำเร็จ: ' + detail;
      status.classList.add('is-error');
      status.classList.remove('is-ready');
    }
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visual = stage.closest('.module11-visual');
  const moduleSection = section || document.getElementById('3d-learning') || document.getElementById('module12');
  let autoRotate = !reducedMotion.matches;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#071c2c');
  const camera = new THREE.PerspectiveCamera(38, Math.max(stage.clientWidth, 1) / Math.max(stage.clientHeight, 1), 0.1, 120);
  const compact = window.matchMedia('(max-width: 650px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: !compact, alpha: false, powerPreference: 'high-performance' });
  } catch (err) {
    showFailure('ไม่สามารถเริ่ม WebGL Renderer ได้', err);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.35 : 1.75));
  renderer.setSize(Math.max(stage.clientWidth, 1), Math.max(stage.clientHeight, 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute('aria-label', 'โมเดลสถานี NT แบบสามมิติ กด Tab เพื่อเลือก จากนั้นใช้ปุ่มลูกศรหมุน +/− ซูม R คืนมุมมอง และ F เต็มจอ');
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('role', 'application');
  stage.appendChild(renderer.domElement);

  // Lighting Rig
  scene.add(new THREE.HemisphereLight(0xe8f3ff, 0x52606b, 2.1));
  const keyLight = new THREE.DirectionalLight(0xfff0c7, 2.8);
  keyLight.position.set(6, 10, 8);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x80bce0, 1.4);
  fillLight.position.set(-7, 4, -5);
  scene.add(fillLight);

  // Environment Ground & Grid
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.MeshStandardMaterial({ color: 0x142b3a, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);
  const grid = new THREE.GridHelper(16, 32, 0x31546a, 0x203a4d);
  grid.position.y = 0.012;
  scene.add(grid);

  // Camera Orbit Targets & Spherical Coordinates
  const target = new THREE.Vector3(), homeTarget = new THREE.Vector3();
  let theta = 0.62, phi = 1.04, radius = 12, desiredRadius = 12;
  let homeTheta = 0.62, homePhi = 1.04, homeRadius = 12, minRadius = 4.5;
  const maxRadius = 27, minPhi = 0.18, maxPhi = Math.PI - 0.18;

  // Hotspots Container
  const hotspotsContainer = document.createElement('div');
  hotspotsContainer.className = 'stage-hotspots';
  stage.appendChild(hotspotsContainer);

  const control = controls || {
    auto: document.getElementById('autoRotateToggle'),
    hotspots: document.getElementById('hotspotsToggle'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut'),
    reset: document.getElementById('resetView'),
    explore: document.getElementById('exploreMode'),
    focus: document.getElementById('focusMode'),
    fullscreen: document.getElementById('fullscreenModel')
  };

  const updateToggle = () => {
    if (control.auto) {
      control.auto.setAttribute('aria-pressed', String(autoRotate));
      const b = control.auto.querySelector('b');
      if (b) b.textContent = autoRotate ? 'ON' : 'OFF';
      control.auto.title = autoRotate ? 'ปิดการหมุนอัตโนมัติ' : 'เปิดการหมุนอัตโนมัติ';
      control.auto.classList.toggle('is-active', autoRotate);
    }
    if (control.hotspots) {
      control.hotspots.setAttribute('aria-pressed', String(showHotspots));
      const b = control.hotspots.querySelector('b');
      if (b) b.textContent = showHotspots ? 'ON' : 'OFF';
      control.hotspots.title = showHotspots ? 'ซ่อนจุดชี้ระบุอุปกรณ์' : 'แสดงจุดชี้ระบุอุปกรณ์';
      control.hotspots.classList.toggle('is-active', showHotspots);
    }
  };

  const setAutoRotate = value => {
    autoRotate = Boolean(value) && !reducedMotion.matches;
    updateToggle();
    requestFrame();
  };

  const toggleHotspots = value => {
    showHotspots = typeof value === 'boolean' ? value : !showHotspots;
    hotspotsContainer.style.display = showHotspots ? 'block' : 'none';
    updateToggle();
    requestFrame();
  };

  const resetView = () => {
    theta = homeTheta;
    phi = homePhi;
    target.copy(homeTarget);
    desiredRadius = homeRadius;
    if (status) {
      status.textContent = 'โมเดลพร้อมสำรวจ';
    }
    requestFrame();
  };

  const focusModel = () => {
    target.copy(homeTarget);
    desiredRadius = homeRadius;
    requestFrame();
  };

  const setExplore = () => {
    if (control.explore) control.explore.setAttribute('aria-pressed', 'true');
    resetView();
  };

  if (control.fullscreen) {
    control.fullscreen.disabled = !visual || typeof visual.requestFullscreen !== 'function';
  }

  // Model & Mesh Bounds Calculator
  const visibleBounds = root => {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().makeEmpty();
    root.traverse(object => {
      if (!object.isMesh || !object.geometry) return;
      let node = object;
      while (node && node !== root.parent) {
        if (!node.visible) return;
        node = node.parent;
      }
      if (!object.geometry.boundingBox) object.geometry.computeBoundingBox();
      if (object.geometry.boundingBox) box.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
    });
    return box;
  };

  // Hotspots Definitions corresponding to actual nodes in LLK_exchange_site.glb
  const hotspotsDef = [
    {
      id: 'pv-modules',
      label: '01',
      name: 'แผง Solar Rooftop',
      detail: 'แผงโมโนคริสตัลไลน์ 12 แผง กำลังผลิตรวม 6.6 kWp พร้อมแคลมป์ยึดบนหลังคาชุมสาย NT',
      nodeName: 'Step5_PV_Module_R1_C3',
      fallbackPos: new THREE.Vector3(0, 1.85, 0),
      focusRadius: 7.2,
      focusTheta: 0.52,
      focusPhi: 0.98
    },
    {
      id: 'structure',
      label: '02',
      name: 'โครงสร้างรองรับแผง',
      detail: 'คาน Rafters, แป Rails และเสา BasePlates อะลูมิเนียมมาตรฐานความปลอดภัยวิศวกรรม',
      nodeName: 'Step2_Rafters',
      fallbackPos: new THREE.Vector3(0, 1.35, -0.4),
      focusRadius: 6.8,
      focusTheta: 1.15,
      focusPhi: 1.08
    },
    {
      id: 'dc-wiring',
      label: '03',
      name: 'ระบบไฟฟ้า & อาคารชุมสาย',
      detail: 'สายเคเบิล DC Solar Cable เดินท่อเชื่อมต่อไปยังตู้ SMU01 และอินเวอร์เตอร์สถานี',
      nodeName: 'Step7_DC_Cable',
      fallbackPos: new THREE.Vector3(-1.1, 0.9, 0.9),
      focusRadius: 7.5,
      focusTheta: -0.68,
      focusPhi: 1.12
    }
  ];

  const focusHotspot = hotspotId => {
    const marker = hotspotMarkers.find(m => m.def.id === hotspotId);
    if (!marker) return;
    target.copy(marker.pos);
    desiredRadius = marker.def.focusRadius;
    theta = marker.def.focusTheta;
    phi = marker.def.focusPhi;
    if (status) {
      status.textContent = 'โฟกัส: ' + marker.def.name;
    }
    requestFrame();
  };

  // Load GLB Model
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    gltf => {
      if (disposed) {
        disposeModelResources(gltf.scene);
        return;
      }
      try {
        const model = gltf.scene;
        model.updateMatrixWorld(true);

        // Hide lattice tower for clearer rooftop focus
        const tower = model.getObjectByName('Lattice_Tower');
        if (tower) tower.visible = false;
        model.updateMatrixWorld(true);

        const bounds = visibleBounds(model);
        if (bounds.isEmpty()) {
          disposeModelResources(model);
          showFailure('GLB โหลดแล้วแต่ไม่พบ Mesh ที่แสดงผลได้', new Error('ไม่พบ visible Mesh ใน Scene Graph'));
          return;
        }

        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 7 / (Math.max(size.x, size.y, size.z) || 1);
        const frame = new THREE.Group();
        frame.add(model);
        scene.add(frame);
        frame.scale.setScalar(scale);
        frame.position.set(-center.x * scale, -bounds.min.y * scale + 0.08, -center.z * scale);
        frame.updateMatrixWorld(true);

        const fitted = visibleBounds(frame);
        const fittedSize = fitted.getSize(new THREE.Vector3());
        const sphere = fitted.getBoundingSphere(new THREE.Sphere());
        fitted.getCenter(homeTarget);

        minRadius = Math.max(4.5, sphere.radius * 1.12);
        homeRadius = Math.max(minRadius * 1.35, Math.min(18, Math.max(fittedSize.x, fittedSize.y, fittedSize.z) * 1.8));
        homeTheta = theta = 0.62;
        homePhi = phi = 1.04;
        radius = desiredRadius = homeRadius;
        target.copy(homeTarget);

        if (control.focus) control.focus.disabled = false;

        // Initialize Hotspots
        hotspotMarkers.length = 0;
        hotspotsContainer.replaceChildren();

        hotspotsDef.forEach(def => {
          const worldPos = def.fallbackPos.clone();
          const node = model.getObjectByName(def.nodeName);
          if (node) {
            node.updateMatrixWorld(true);
            node.getWorldPosition(worldPos);
            worldPos.y += 0.28;
          }

          const pin = document.createElement('button');
          pin.className = 'hotspot-pin';
          pin.type = 'button';
          pin.setAttribute('aria-label', `${def.name}: ${def.detail}`);
          pin.innerHTML = `
            <span class="hotspot-pulse"></span>
            <span class="hotspot-badge">${def.label}</span>
            <span class="hotspot-name">${def.name}</span>
            <div class="hotspot-card" role="tooltip">
              <b>${def.name}</b>
              <p>${def.detail}</p>
              <span class="hotspot-action">คลิกเพื่อโฟกัสมุมมอง ⌖</span>
            </div>
          `;

          pin.addEventListener('click', e => {
            e.stopPropagation();
            focusHotspot(def.id);
          });

          hotspotsContainer.appendChild(pin);
          hotspotMarkers.push({ el: pin, pos: worldPos, def });
        });

        // Remove loading placeholder cleanly
        stage.querySelector('.stage-placeholder')?.remove();

        if (status) {
          status.textContent = tower ? 'โมเดลพร้อมสำรวจ · ซ่อน Lattice_Tower' : 'โมเดลพร้อมสำรวจ';
          status.classList.add('is-ready');
          status.classList.remove('is-error');
        }

        requestFrame();
      } catch (err) {
        showFailure('โหลด GLB ได้ แต่เตรียม Scene ไม่สำเร็จ', err);
      }
    },
    xhr => {
      if (status && xhr.total) {
        status.textContent = 'กำลังโหลดโมเดลสถานี NT… ' + Math.round((xhr.loaded / xhr.total) * 100) + '%';
      }
    },
    err => {
      if (!disposed) showFailure('โหลดโมเดล GLB ไม่สำเร็จ', err);
    }
  );

  // Pointer & Touch Events
  let lastPointer = null, lastPinchDistance = 0;
  const pointDistance = () => {
    const p = [...activePointers.values()];
    return p.length < 2 ? 0 : Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  };

  renderer.domElement.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    renderer.domElement.focus({ preventScroll: true });
    renderer.domElement.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragging = true;
    lastFrame = 0;
    if (activePointers.size === 1) lastPointer = { x: e.clientX, y: e.clientY };
    else { lastPointer = null; lastPinchDistance = pointDistance(); }
    if (control.explore) control.explore.setAttribute('aria-pressed', 'true');
  }, { signal: pointerAbort.signal });

  renderer.domElement.addEventListener('pointermove', e => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size > 1) {
      const d = pointDistance();
      if (lastPinchDistance > 0 && d > 0) desiredRadius = THREE.MathUtils.clamp((desiredRadius * lastPinchDistance) / d, minRadius, maxRadius);
      lastPinchDistance = d;
      lastPointer = null;
      requestFrame();
      return;
    }
    if (lastPointer) {
      theta -= (e.clientX - lastPointer.x) * 0.0052;
      phi = THREE.MathUtils.clamp(phi + (e.clientY - lastPointer.y) * 0.004, minPhi, maxPhi);
    }
    lastPointer = { x: e.clientX, y: e.clientY };
    requestFrame();
  }, { signal: pointerAbort.signal });

  const endPointer = e => {
    activePointers.delete(e.pointerId);
    dragging = activePointers.size > 0;
    lastPinchDistance = activePointers.size > 1 ? pointDistance() : 0;
    lastPointer = activePointers.size === 1 ? [...activePointers.values()][0] : null;
    if (!dragging) requestFrame();
  };
  renderer.domElement.addEventListener('pointerup', endPointer, { signal: pointerAbort.signal });
  renderer.domElement.addEventListener('pointercancel', endPointer, { signal: pointerAbort.signal });
  renderer.domElement.addEventListener('lostpointercapture', endPointer, { signal: pointerAbort.signal });

  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    desiredRadius = THREE.MathUtils.clamp(desiredRadius * Math.exp(e.deltaY * 0.001), minRadius, maxRadius);
    requestFrame();
  }, { passive: false, signal: pointerAbort.signal });

  renderer.domElement.addEventListener('dblclick', e => {
    e.preventDefault();
    focusModel();
  }, { signal: pointerAbort.signal });

  // Keyboard Navigation
  renderer.domElement.addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,select,[contenteditable="true"]') || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key.toLowerCase();
    let handled = true;
    if (k === 'arrowleft') theta += 0.12;
    else if (k === 'arrowright') theta -= 0.12;
    else if (k === 'arrowup') phi = THREE.MathUtils.clamp(phi - 0.1, minPhi, maxPhi);
    else if (k === 'arrowdown') phi = THREE.MathUtils.clamp(phi + 0.1, minPhi, maxPhi);
    else if (k === '+' || k === '=') desiredRadius = Math.max(minRadius, desiredRadius * 0.86);
    else if (k === '-' || k === '_') desiredRadius = Math.min(maxRadius, desiredRadius * 1.16);
    else if (k === 'r') resetView();
    else if (k === 'h') toggleHotspots();
    else if (k === 'f' && control.fullscreen && !control.fullscreen.disabled) control.fullscreen.click();
    else handled = false;
    if (handled) {
      e.preventDefault();
      requestFrame();
    }
  }, { signal: uiAbort.signal });

  // UI Button Listeners
  control.auto?.addEventListener('click', () => setAutoRotate(!autoRotate), { signal: uiAbort.signal });
  control.hotspots?.addEventListener('click', () => toggleHotspots(!showHotspots), { signal: uiAbort.signal });
  control.zoomIn?.addEventListener('click', () => { desiredRadius = Math.max(minRadius, desiredRadius * 0.82); requestFrame(); }, { signal: uiAbort.signal });
  control.zoomOut?.addEventListener('click', () => { desiredRadius = Math.min(maxRadius, desiredRadius * 1.22); requestFrame(); }, { signal: uiAbort.signal });
  control.reset?.addEventListener('click', resetView, { signal: uiAbort.signal });
  control.explore?.addEventListener('click', setExplore, { signal: uiAbort.signal });
  control.focus?.addEventListener('click', focusModel, { signal: uiAbort.signal });

  control.fullscreen?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await visual.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err) {
      console.warn('Fullscreen is unavailable for this browser', err);
    }
  }, { signal: uiAbort.signal });

  const syncFullscreen = () => {
    if (control.fullscreen) {
      control.fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'ออกจากโหมดเต็มจอ (F)' : 'แสดงโมเดลเต็มจอ (F)');
    }
    requestFrame();
  };
  document.addEventListener('fullscreenchange', syncFullscreen, { signal: uiAbort.signal });

  const motionChanged = () => {
    if (reducedMotion.matches) setAutoRotate(false);
  };
  reducedMotion.addEventListener?.('change', motionChanged, { signal: uiAbort.signal });

  // Camera Orbit Projection
  const updateCamera = dt => {
    const blend = 1 - Math.exp(-5.5 * dt);
    radius += (desiredRadius - radius) * blend;
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(target);
  };

  // Render Loop & Hotspots Projection
  const projVec = new THREE.Vector3();
  const drawFrame = ts => {
    raf = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = lastFrame ? Math.min((ts - lastFrame) / 1000, 0.05) : 0;
    lastFrame = ts;
    if (autoRotate && !dragging) theta -= dt * 0.12;
    updateCamera(dt || 0.016);
    renderer.render(scene, camera);

    // Update Hotspots 2D Screen Positions
    if (showHotspots && hotspotMarkers.length > 0) {
      const w = stage.clientWidth, h = stage.clientHeight;
      for (let i = 0; i < hotspotMarkers.length; i++) {
        const marker = hotspotMarkers[i];
        projVec.copy(marker.pos).project(camera);
        if (projVec.z < 1) {
          const x = (projVec.x * 0.5 + 0.5) * w;
          const y = (-projVec.y * 0.5 + 0.5) * h;
          marker.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
          marker.el.style.opacity = '1';
          marker.el.style.pointerEvents = 'auto';
        } else {
          marker.el.style.opacity = '0';
          marker.el.style.pointerEvents = 'none';
        }
      }
    }

    if (autoRotate || dragging || Math.abs(desiredRadius - radius) > 0.002) {
      raf = requestAnimationFrame(drawFrame);
    }
  };

  function requestFrame() {
    if (visible && !disposed && !document.hidden && !raf) raf = requestAnimationFrame(drawFrame);
  }

  // Dynamic Resize Observer
  const resize = () => {
    if (disposed || !stage.isConnected) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    requestFrame();
  };
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(stage);
  if (!resizeObserver) window.addEventListener('resize', resize, { signal: uiAbort.signal });
  resize();

  // Visibility Intersection Observer
  let intersectionObserver = null;
  const updateVisibility = () => {
    const run = visible && !document.hidden;
    moduleSection?.classList.toggle('is-visible', run);
    if (run) requestFrame();
    else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
    }
  };

  intersectionObserver = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(entries => {
        visible = entries.some(x => x.isIntersecting);
        updateVisibility();
      }, { threshold: [0, 0.05, 0.15] })
    : null;

  if (intersectionObserver && moduleSection) {
    intersectionObserver.observe(moduleSection);
  } else {
    visible = true;
    updateVisibility();
  }

  document.addEventListener('visibilitychange', updateVisibility, { signal: uiAbort.signal });
  updateToggle();

  function cleanup() {
    if (disposed) return;
    disposed = true;
    try {
      if (raf) cancelAnimationFrame(raf);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      pointerAbort.abort();
      uiAbort.abort();
      renderer?.domElement?.remove();
      hotspotsContainer?.remove();
      disposeModelResources(scene);
      renderer?.renderLists?.dispose();
      renderer?.dispose();
    } catch (err) {
      console.warn('Cleanup error', err);
    }
  }

  return {
    cleanup,
    focusHotspot,
    resetView,
    setAutoRotate,
    toggleHotspots
  };
}

function disposeModelResources(root) {
  if (!root) return;
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(obj => {
    if (obj.geometry) geometries.add(obj.geometry);
    if (obj.material) {
      for (const material of Array.isArray(obj.material) ? obj.material : [obj.material]) {
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture) textures.add(value);
        }
      }
    }
  });
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}
