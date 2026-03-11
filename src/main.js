import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import RAPIER from "@dimforge/rapier3d";
import Stats from "stats.js";

/**
 * Setup
 */
const canvas = document.querySelector("canvas.webgl");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const gui = new GUI();
const debugObject = {};

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Objects
 */
// Cage
const cage = new THREE.Group();

const cagePlane = new THREE.PlaneGeometry(10, 10);
const cageMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.9,
  metalness: 0.9,
  transparent: true,
  opacity: 0.5,
});

const planeBottom = new THREE.Mesh(cagePlane, cageMaterial);
planeBottom.position.set(0, 0, 0);
planeBottom.rotation.x = -Math.PI / 2;
planeBottom.receiveShadow = true;
cage.add(planeBottom);

const planeLeft = new THREE.Mesh(cagePlane, cageMaterial);
planeLeft.position.set(-5, 5, 0);
planeLeft.rotation.y = Math.PI / 2;
planeLeft.receiveShadow = true;
cage.add(planeLeft);

const planeRight = new THREE.Mesh(cagePlane, cageMaterial);
planeRight.position.set(5, 5, 0);
planeRight.rotation.y = -Math.PI / 2;
planeRight.receiveShadow = true;
cage.add(planeRight);

const planeBack = new THREE.Mesh(cagePlane, cageMaterial);
planeBack.position.set(0, 5, 5);
planeBack.rotation.y = Math.PI;
planeBack.receiveShadow = true;
cage.add(planeBack);

const planeFrontMat = cageMaterial.clone();
planeFrontMat.opacity = 0.1;

const planeFront = new THREE.Mesh(cagePlane, planeFrontMat);
planeFront.position.set(0, 5, -5);
planeFront.rotation.y = Math.PI;
planeFront.receiveShadow = true;
cage.add(planeFront);

cage.rotation.y = Math.PI / 2;
cage.position.y -= 5;

scene.add(cage);

// Sphere
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/indian_face.jpg");

const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);

/**
 * Physics
 */
const gravity = new RAPIER.Vector3(0, -9.81, 0);
const world = new RAPIER.World(gravity);

// Cage collider
const size = 5;
const height = 5;
const thickness = 0.01;

// cage floor
const floorDesc = RAPIER.ColliderDesc.cuboid(
  size,
  thickness,
  size,
).setTranslation(0, -height, 0);
world.createCollider(floorDesc);

// 2. Build the Z-Axis Walls (Front and Back)
const zWallDesc = RAPIER.ColliderDesc.cuboid(size, height, thickness);

zWallDesc.setTranslation(0, 0, size);
world.createCollider(zWallDesc);

zWallDesc.setTranslation(0, 0, -size);
world.createCollider(zWallDesc);

// 3. Build the X-Axis Walls (Left and Right)
const xWallDesc = RAPIER.ColliderDesc.cuboid(thickness, height, size);

xWallDesc.setTranslation(size, 0, 0);
world.createCollider(xWallDesc);

xWallDesc.setTranslation(-size, 0, 0);
world.createCollider(xWallDesc);

// Sphere physics
const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 0.0, 0.0);

const colliderDesc = RAPIER.ColliderDesc.ball(0.5)
  .setRestitution(1)
  .setMass(1.5)
  .setFriction(0.1);

gui.add(colliderDesc, "restitution", 0, 2).name("Restitution");
gui.add(colliderDesc, "mass", 0, 3).name("Mass");
gui.add(colliderDesc, "friction", 0, 1).name("Friction");

/**
 * Utils
 */
const spheres = [];

debugObject.minBallSize = 1;
debugObject.maxBallSize = 1.5;
gui.add(debugObject, "minBallSize", 0.5, 1.5, 0.1).name("Min Ball Size");

function createSphere() {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  const x = (Math.random() - 0.5) * 8;
  const y = 8;
  const z = (Math.random() - 0.5) * 8;

  sphere.position.set(x, y, z);
  sphere.receiveShadow = true;
  sphere.castShadow = true;

  const scale =
    Math.random() * (debugObject.maxBallSize - debugObject.minBallSize) +
    debugObject.minBallSize;
  sphere.scale.set(scale, scale, scale);
  sphere.rotation.y = Math.PI + (Math.random() - 0.5);
  sphere.rotation.x = Math.random() - 0.5;
  sphere.rotation.z = Math.random() - 0.5;
  scene.add(sphere);

  const body = world.createRigidBody(bodyDesc.setTranslation(x, y, z));
  world.createCollider(colliderDesc, body);

  sphere.userData.physicsBody = body;

  spheres.push(sphere);
}

function removeSphere(sphere) {
  world.removeRigidBody(sphere.userData.physicsBody);
  scene.remove(sphere);
  spheres.splice(spheres.indexOf(sphere), 1);
}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(1, 20, 1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.mapSize.set(1024 / 2, 1024 / 2);
scene.add(directionalLight);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(-12, 6, 0);
scene.add(camera);

// const axisHelper = new THREE.AxesHelper(1);
// scene.add(axisHelper);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  opacity: 0.5,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = true;

/**
 * Events
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// EXPLOSIONSSSS!!!!!#"%"##
const raycaster = new THREE.Raycaster();
const clickSound = new Audio("/hit_sound.mp3");
clickSound.volume = 0.2;

debugObject.force = 100;
gui.add(debugObject, "force", 50, 200, 1).name("Click Force");

window.addEventListener("pointerdown", (event) => {
  // 1. Normalize mouse position (-1 to 1)
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  // 2. Aim the laser from the camera through the mouse
  raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

  // 3. Fire the laser! Check if it hits any of our balls
  const intersects = raycaster.intersectObjects(spheres);

  if (intersects.length > 0) {
    clickSound.currentTime = 0;
    clickSound.volume = 0.2 * Math.random() + 0.1;
    clickSound.play();
  }

  // 4. Did we hit anything?
  intersects.forEach((intersect) => {
    // Get the object that was hit
    const hitMesh = intersect.object;

    // Retrieve physics body
    const bodyToExplode = hitMesh.userData.physicsBody;

    if (bodyToExplode) {
      const force = {
        x: (Math.random() - 0.5) * debugObject.force,
        y: debugObject.force,
        z: (Math.random() - 0.5) * debugObject.force,
      };

      bodyToExplode.applyImpulse(force, true);
    }
  });
});

/**
 * Audio
 */
const audio = new Audio("/indian_song.mp3");
audio.loop = true;
audio.volume = 0.2;
audio.play();

/**
 * Animate
 */
const timer = new THREE.Timer();

const timeStep = 1 / 60;
let accumulatedTime = 0;

let lastSphereTime = 0;
debugObject.spawnRate = 50;
gui.add(debugObject, "spawnRate", 0, 100, 1).name("Spawn Rate");

const animate = () => {
  stats.begin();

  // updates
  timer.update();
  controls.update();

  const deltaTime = Math.min(timer.getDelta(), 0.1);
  accumulatedTime += deltaTime;
  lastSphereTime += deltaTime;

  while (accumulatedTime >= timeStep) {
    world.step();
    accumulatedTime -= timeStep;
  }

  if (debugObject.spawnRate > 0) {
    if (debugObject.spawnRate <= 50) {
      // Exponential mapping: rate 50 → ~0.016s (every frame), rate 1 → ~5s
      const t = debugObject.spawnRate / 50;
      const spawnInterval = Math.pow(5 / 0.016, 1 - t) * 0.016;
      if (lastSphereTime >= spawnInterval) {
        createSphere();
        lastSphereTime = 0;
      }
    } else {
      // Above 50: spawn multiple spheres per frame
      const spawnCount = Math.round(
        ((debugObject.spawnRate - 50) / 50) * 9 + 1,
      );
      for (let i = 0; i < spawnCount; i++) createSphere();
    }
  }

  // update spheres
  for (const sphere of [...spheres]) {
    sphere.position.copy(sphere.userData.physicsBody.translation());
    if (sphere.position.y < -50) {
      removeSphere(sphere);
    }
  }

  // render
  renderer.render(scene, camera);

  stats.end();
  requestAnimationFrame(animate);
};

animate();
