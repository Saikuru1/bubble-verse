/**
 * main.js
 * The "Engine of Sight."
 * Central Hub: Initializes Scene, Physics, Flight, Data, and Warp.
 */

import * as THREE from 'three';
import { GravityEngine } from './physics/gravity.js';
import { StarMap } from './data/gun.js';
import { IPFSNode } from './data/ipfs.js';
import { FlightController } from './ui/camera.js';
import { Interaction } from './ui/interaction.js';
import { WarpDrive } from './ui/warp.js';

// 1. Setup the Scene & Essentials
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const clock = new THREE.Clock(); // Timing for smooth movement

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Sharpness for mobile
document.body.appendChild(renderer.domElement);

// 2. Initialize Controllers
FlightController.init(camera, renderer);
Interaction.init(camera, scene);
WarpDrive.init(camera);

// 3. The Bubble Container (Map CID -> Three.js Mesh)
const bubblesInSpace = new Map();

/**
 * Procedural Bubble Generation
 * Replaces the need for spark.png by drawing a radial gradient on a canvas.
 */
function createBubbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Create a radial gradient (The Glow)
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');     // Solid center
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');   // Soft inner
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');   // Fading edge
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');       // Transparent void

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}

const sparkTexture = createBubbleTexture();

function createBubbleMesh(data) {
  // Use views to determine size (Logarithmic growth)
  const size = Math.log(data.views + 2);
  const geometry = new THREE.SphereGeometry(size, 16, 16);
  
  // Apply the procedural texture to make the sphere look like a glowing bubble
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    map: sparkTexture,
    transparent: true, 
    opacity: 0.8 
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(data.x, data.y, data.z);
  
  // Attach metadata to the mesh so Interaction.js knows what it is
  mesh.userData = { cid: data.cid }; 
  
  return mesh;
}

// 4. Listen to the Universe (GunDB Sync)
StarMap.observe((data) => {
  if (bubblesInSpace.has(data.cid)) {
    const mesh = bubblesInSpace.get(data.cid);
    mesh.position.set(data.x, data.y, data.z);
    mesh.scale.setScalar(Math.log(data.views + 2));
  } else {
    const newMesh = createBubbleMesh(data);
    scene.add(newMesh);
    bubblesInSpace.set(data.cid, newMesh);
  }
});

// 5. The Pulse of the Universe (Render Loop)
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update flight momentum
  FlightController.update(delta);

  // Update Warp navigation
  WarpDrive.update();
  
  // Subtle ambient movement
  scene.rotation.y += 0.00005; 
  
  renderer.render(scene, camera);
}

// 6. Start the Engine
IPFSNode.init().then(() => {
    console.log("Big Bang Initialized.");
    animate();
});

// Handle Screen Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});