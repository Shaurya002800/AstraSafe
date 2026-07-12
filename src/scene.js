import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const colors = {
  background: 0x0b0e0f,
  floor: 0x151a19,
  line: 0x34413c,
  steel: 0x4b5552,
  steelDark: 0x242c2a,
  green: 0x66d49a,
  amber: 0xf1b84b,
  red: 0xf0645a,
  cyan: 0x76b9c4,
  white: 0xe9efea
};

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.68,
    metalness: options.metalness ?? 0.28,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0
  });
}

function box(width, height, depth, color, options) {
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color, options));
}

function makeLabel(text, accent = "#66d49a") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(10, 14, 15, 0.88)";
  context.fillRect(4, 4, 504, 120);
  context.strokeStyle = accent;
  context.lineWidth = 4;
  context.strokeRect(4, 4, 504, 120);
  context.fillStyle = "#e9efea";
  context.font = "600 42px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 256, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(3.6, 0.9, 1);
  return sprite;
}

function makeZone(name, position, accent) {
  const group = new THREE.Group();
  const padMaterial = material(0x1c2321, {
    emissive: accent,
    emissiveIntensity: 0.04,
    metalness: 0.08
  });
  const pad = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 4.4), padMaterial);
  pad.position.y = 0.08;
  group.add(pad);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(5.82, 0.18, 4.42)),
    new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.52 })
  );
  border.position.y = 0.09;
  group.add(border);

  const label = makeLabel(name, `#${accent.toString(16).padStart(6, "0")}`);
  label.position.set(-1.1, 0.82, -1.6);
  label.scale.multiplyScalar(0.72);
  group.add(label);
  group.position.copy(position);
  return { group, padMaterial, border };
}

function makeOven() {
  const group = new THREE.Group();
  const body = box(3.2, 2.1, 1.8, colors.steelDark, { metalness: 0.65, roughness: 0.4 });
  body.position.y = 1.15;
  group.add(body);

  for (let index = -1; index <= 1; index += 1) {
    const door = box(0.72, 1.38, 0.08, 0x303a37, { metalness: 0.72 });
    door.position.set(index * 0.92, 1.05, 0.94);
    group.add(door);
    const rim = new THREE.LineSegments(
      new THREE.EdgesGeometry(door.geometry),
      new THREE.LineBasicMaterial({ color: colors.amber, transparent: true, opacity: 0.35 })
    );
    rim.position.copy(door.position);
    group.add(rim);
  }

  const stack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.48, 2.5, 18),
    material(colors.steel, { metalness: 0.7, roughness: 0.35 })
  );
  stack.position.set(-1.1, 3.25, -0.45);
  group.add(stack);

  const pipe = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.14, 10, 28, Math.PI),
    material(colors.steel, { metalness: 0.72 })
  );
  pipe.rotation.set(0, Math.PI / 2, 0);
  pipe.position.set(1.55, 2.1, -0.2);
  group.add(pipe);
  return group;
}

function makeFan() {
  const group = new THREE.Group();
  const stand = box(0.32, 2.1, 0.32, colors.steel);
  stand.position.y = 1.05;
  group.add(stand);

  const housing = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.14, 12, 48),
    material(colors.steel, { metalness: 0.72, roughness: 0.34 })
  );
  housing.position.y = 2.25;
  group.add(housing);

  const blades = new THREE.Group();
  for (let index = 0; index < 5; index += 1) {
    const blade = box(0.2, 0.76, 0.08, colors.cyan, { metalness: 0.32, roughness: 0.4 });
    blade.position.y = 0.42;
    const holder = new THREE.Group();
    holder.add(blade);
    holder.rotation.z = (Math.PI * 2 * index) / 5;
    blades.add(holder);
  }
  blades.position.y = 2.25;
  group.add(blades);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16), material(colors.white));
  hub.rotation.x = Math.PI / 2;
  hub.position.set(0, 2.25, 0.08);
  group.add(hub);

  const status = new THREE.PointLight(colors.green, 2.2, 4);
  status.position.set(0, 2.25, 0.6);
  group.add(status);
  return { group, blades, status };
}

function makeSensor() {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.9, 12), material(colors.steel));
  pole.position.y = 0.95;
  group.add(pole);
  const headMaterial = material(colors.green, {
    emissive: colors.green,
    emissiveIntensity: 0.65,
    metalness: 0.12
  });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), headMaterial);
  head.position.y = 2;
  group.add(head);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.045, 8, 28),
    new THREE.MeshBasicMaterial({ color: colors.green, transparent: true, opacity: 0.72 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 2;
  group.add(ring);
  return { group, headMaterial, ring };
}

function makePermitBoard() {
  const group = new THREE.Group();
  const post = box(0.12, 1.55, 0.12, colors.steel);
  post.position.y = 0.78;
  group.add(post);
  const boardMaterial = material(0x353b32, {
    emissive: colors.amber,
    emissiveIntensity: 0.1,
    metalness: 0.12
  });
  const board = box(1.25, 0.78, 0.08, 0x353b32);
  board.material = boardMaterial;
  board.position.y = 1.72;
  group.add(board);
  const label = makeLabel("HW-204", "#f1b84b");
  label.position.set(0, 1.73, 0.08);
  label.scale.set(1.06, 0.28, 1);
  group.add(label);
  return { group, boardMaterial };
}

function makeWorker(accent) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.52, 6, 12), material(0xd3d9d5));
  body.position.y = 0.56;
  group.add(body);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), material(accent));
  helmet.position.y = 1.08;
  group.add(helmet);
  const marker = new THREE.PointLight(accent, 0.8, 2.2);
  marker.position.y = 1;
  group.add(marker);
  return group;
}

function makeGasCloud() {
  const group = new THREE.Group();
  const cloudMaterial = material(0x8dccaa, {
    transparent: true,
    opacity: 0.06,
    emissive: 0x4f9c78,
    emissiveIntensity: 0.12,
    metalness: 0,
    roughness: 1
  });
  const cloudlets = [];
  for (let index = 0; index < 10; index += 1) {
    const cloudlet = new THREE.Mesh(new THREE.SphereGeometry(0.45 + (index % 3) * 0.12, 16, 12), cloudMaterial.clone());
    cloudlet.position.set((index % 5) * 0.5 - 1, 0.5 + Math.floor(index / 5) * 0.45, (index % 2) * 0.45 - 0.2);
    cloudlet.scale.set(1.4, 0.72, 1);
    group.add(cloudlet);
    cloudlets.push(cloudlet);
  }
  group.visible = false;
  return { group, cloudlets };
}

function makeSparks() {
  const count = 42;
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: colors.amber, size: 0.09, transparent: true, opacity: 0.9 })
  );
  points.visible = false;
  return { points, positions, count };
}

export function createIncidentScene(container) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    container.classList.add("scene-unavailable");
    return { update() {}, destroy() {}, available: false };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.setAttribute("aria-label", "Interactive 3D view of Nova Steel Zone C");
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.background);
  scene.fog = new THREE.Fog(colors.background, 18, 34);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  camera.position.set(11.5, 10.2, 14.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = 9;
  controls.maxDistance = 24;
  controls.maxPolarAngle = Math.PI / 2.12;
  controls.target.set(0, 1.1, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.42;
  let compactCamera = null;

  function frameCamera(width) {
    const nextCompact = width < 640;
    if (nextCompact === compactCamera) return;
    compactCamera = nextCompact;
    if (nextCompact) {
      camera.position.set(14.5, 12.5, 21.5);
      controls.minDistance = 13;
      controls.maxDistance = 30;
    } else {
      camera.position.set(11.5, 10.2, 14.5);
      controls.minDistance = 9;
      controls.maxDistance = 24;
    }
    controls.target.set(0, 1.1, 0);
    controls.update();
  }

  scene.add(new THREE.HemisphereLight(0xc8e7df, 0x16201d, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(8, 13, 9);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(colors.cyan, 1.1);
  fillLight.position.set(-9, 6, -8);
  scene.add(fillLight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), material(colors.floor, { metalness: 0.02, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  scene.add(floor);

  const grid = new THREE.GridHelper(28, 28, colors.line, 0x26312d);
  grid.position.y = 0.01;
  scene.add(grid);

  const zoneA = makeZone("ZONE A / LOADING", new THREE.Vector3(-6.1, 0, 3.6), colors.cyan);
  const zoneB = makeZone("ZONE B / UTILITIES", new THREE.Vector3(6.1, 0, 3.6), colors.green);
  const zoneC = makeZone("ZONE C / HOT WORK", new THREE.Vector3(0, 0, -0.2), colors.amber);
  const zoneD = makeZone("ZONE D / MAINTENANCE", new THREE.Vector3(6.1, 0, -4.6), colors.cyan);
  [zoneA, zoneB, zoneC, zoneD].forEach((zone) => scene.add(zone.group));

  const oven = makeOven();
  oven.position.set(-0.5, 0.18, -0.25);
  zoneC.group.add(oven);

  const fan = makeFan();
  fan.group.position.set(2.15, 0.18, -0.45);
  zoneC.group.add(fan.group);
  const fanLabel = makeLabel("VF-2", "#76b9c4");
  fanLabel.position.set(2.15, 3.55, -0.45);
  fanLabel.scale.multiplyScalar(0.56);
  zoneC.group.add(fanLabel);

  const sensor = makeSensor();
  sensor.group.position.set(-2.2, 0.18, 1.25);
  zoneC.group.add(sensor.group);
  const sensorLabel = makeLabel("G7 / 42 PPM", "#66d49a");
  sensorLabel.position.set(-2.2, 3.05, 1.25);
  sensorLabel.scale.multiplyScalar(0.56);
  zoneC.group.add(sensorLabel);

  const permit = makePermitBoard();
  permit.group.position.set(1.9, 0.18, 1.25);
  zoneC.group.add(permit.group);

  const workerPositions = [
    new THREE.Vector3(-0.9, 0.18, 1.4),
    new THREE.Vector3(0.15, 0.18, 1.55),
    new THREE.Vector3(0.85, 0.18, 0.95)
  ];
  const workers = workerPositions.map((position, index) => {
    const worker = makeWorker(index === 2 ? colors.amber : colors.cyan);
    worker.position.copy(position);
    worker.visible = false;
    zoneC.group.add(worker);
    return worker;
  });

  const gas = makeGasCloud();
  gas.group.position.set(-1.55, 0.35, 0.4);
  zoneC.group.add(gas.group);

  const sparks = makeSparks();
  sparks.points.position.set(0.72, 1.05, 0.72);
  zoneC.group.add(sparks.points);

  let latest = {
    score: 0,
    fanDelayed: false,
    hotWorkActive: false,
    workerCount: 0,
    gasPpm: 42,
    gasRising: false
  };
  let animationFrame;
  const startTime = performance.now();

  function animateSparks(elapsed) {
    if (!latest.hotWorkActive) return;
    for (let index = 0; index < sparks.count; index += 1) {
      const phase = (elapsed * 1.9 + index * 0.37) % 1;
      const angle = index * 2.21;
      sparks.positions[index * 3] = Math.cos(angle) * phase * 0.72;
      sparks.positions[index * 3 + 1] = phase * 1.35;
      sparks.positions[index * 3 + 2] = Math.sin(angle) * phase * 0.58;
    }
    sparks.points.geometry.attributes.position.needsUpdate = true;
  }

  function animate() {
    const elapsed = (performance.now() - startTime) / 1000;
    controls.update();
    if (!latest.fanDelayed) fan.blades.rotation.z -= 0.055;
    sensor.ring.scale.setScalar(1 + Math.sin(elapsed * 2.8) * 0.08);
    zoneC.padMaterial.emissiveIntensity = latest.score >= 76
      ? 0.18 + Math.sin(elapsed * 3.4) * 0.08
      : latest.score >= 31 ? 0.1 : 0.04;
    gas.cloudlets.forEach((cloudlet, index) => {
      cloudlet.position.y += Math.sin(elapsed * 0.8 + index) * 0.0008;
      cloudlet.rotation.y += 0.0015 * (index % 2 ? 1 : -1);
    });
    animateSparks(elapsed);
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(animate);
  }

  const resizeObserver = new ResizeObserver(() => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    frameCamera(width);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });
  frameCamera(container.clientWidth);
  resizeObserver.observe(container);
  animate();

  return {
    available: true,
    update(snapshot) {
      const state = snapshot.risk.currentState;
      latest = {
        score: snapshot.risk.score,
        fanDelayed: state.fanDelayed,
        hotWorkActive: state.hotWorkActive,
        workerCount: state.workerCount,
        gasPpm: state.gasPpm,
        gasRising: state.gasTrend === "rising_fast"
      };

      workers.forEach((worker, index) => {
        worker.visible = index < state.workerCount;
      });
      sparks.points.visible = state.hotWorkActive;
      gas.group.visible = state.gasTrend === "rising_fast";
      const gasStrength = Math.max(0.08, Math.min(0.34, (state.gasPpm - 38) / 70));
      gas.cloudlets.forEach((cloudlet, index) => {
        cloudlet.material.opacity = gasStrength * (0.72 + (index % 3) * 0.1);
      });

      const incidentColor = snapshot.risk.score >= 76
        ? colors.red
        : snapshot.risk.score >= 31 ? colors.amber : colors.green;
      zoneC.padMaterial.emissive.setHex(incidentColor);
      zoneC.border.material.color.setHex(incidentColor);
      fan.status.color.setHex(state.fanDelayed ? colors.red : colors.green);
      fan.status.intensity = state.fanDelayed ? 3.2 : 2.2;
      sensor.headMaterial.color.setHex(state.gasTrend === "rising_fast" ? colors.amber : colors.green);
      sensor.headMaterial.emissive.setHex(state.gasTrend === "rising_fast" ? colors.amber : colors.green);
      permit.boardMaterial.emissiveIntensity = state.hotWorkActive ? 0.62 : 0.08;
      controls.autoRotateSpeed = snapshot.risk.score >= 76 ? 0.18 : 0.42;
    },
    destroy() {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    }
  };
}
