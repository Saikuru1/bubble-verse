/**
 * main.js
 */
import * as THREE from 'three';
import { GravityEngine } from './physics/gravity.js';
import { StarMap } from './data/gun.js';
import { IPFSNode } from './data/ipfs.js';
import { FlightController } from './ui/camera.js';
import { Interaction } from './ui/interaction.js';
import { WarpDrive } from './ui/warp.js';
import { UserInput } from './ui/input.js'; // Added Import

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const clock = new THREE.Clock();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 2. Initialize Controllers
FlightController.init(camera, renderer);
Interaction.init(camera, scene);
WarpDrive.init(camera);
UserInput.init(); // <--- CRITICAL FIX: This wakes up the Ignite button

const bubblesInSpace = new Map();

function createBubbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(0, 255, 255, 1)'); // Cyan center
  gradient.addColorStop(0.4, 'rgba(0, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const sparkTexture = createBubbleTexture();

function createBubbleMesh(data) {
  const size = Math.log((data.views || 0) + 2);
  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ffff, 
    map: sparkTexture,
    transparent: true, 
    opacity: 0.8 
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(data.x, data.y, data.z);
  mesh.userData = { cid: data.cid }; 
  return mesh;
}

StarMap.observe((data) => {
  if (bubblesInSpace.has(data.cid)) {
    const mesh = bubblesInSpace.get(data.cid);
    mesh.position.set(data.x, data.y, data.z);
    mesh.scale.setScalar(Math.log((data.views || 0) + 2));
  } else {
    const newMesh = createBubbleMesh(data);
    scene.add(newMesh);
    bubblesInSpace.set(data.cid, newMesh);
  }
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  FlightController.update(delta);
  WarpDrive.update();
  scene.rotation.y += 0.00005; 
  renderer.render(scene, camera);
}

IPFSNode.init().then(() => {
    console.log("Big Bang Initialized.");
    animate();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});