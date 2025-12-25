/**
 * main.js
 * The "Engine of Sight."
 */
import * as THREE from 'three';
import { GravityEngine } from './physics/gravity.js';
import { StarMap } from './data/gun.js';
import { IPFSNode } from './data/ipfs.js';
import { FlightController } from './ui/camera.js';
import { Interaction } from './ui/interaction.js';
import { WarpDrive } from './ui/warp.js';
import { UserInput } from './ui/input.js';

// 1. Setup the Scene
const scene = new THREE.Scene();
// Start camera pulled back so we can see the origin
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 0, 300); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
const clock = new THREE.Clock();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 2. Initialize Controllers
FlightController.init(camera, renderer);
Interaction.init(camera, scene);
WarpDrive.init(camera);
UserInput.init(); 

// 3. Visual Helpers: The Starfield
function createStarfield() {
    const vertices = [];
    for (let i = 0; i < 5000; i++) {
        const x = THREE.MathUtils.randFloatSpread(15000);
        const y = THREE.MathUtils.randFloatSpread(15000);
        const z = THREE.MathUtils.randFloatSpread(15000);
        vertices.push(x, y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, transparent: true, opacity: 0.4 });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
}
createStarfield();

// 4. Bubble Management
const bubblesInSpace = new Map();

function createBubbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.8)'); 
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}
const sparkTexture = createBubbleTexture();

function createBubbleMesh(data) {
    // INCREASED SIZE: Base size of 15 + growth
    const size = 15 + (Math.log((data.views || 0) + 2) * 8); 
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        map: sparkTexture,
        transparent: true, 
        opacity: 0.9,
        blending: THREE.AdditiveBlending // Makes the bubble "glow"
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.x, data.y, data.z);
    mesh.userData = { cid: data.cid }; 

    // ADD A GLOW HALO: This makes the bubble visible even from extreme distances
    const spriteMaterial = new THREE.SpriteMaterial({
        map: sparkTexture,
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size * 8, size * 8, 1); // Halo is 8x the bubble size
    mesh.add(sprite);
    
    return mesh;
}

// 5. Sync with the Network
StarMap.observe((data) => {
    if (!data.cid) return;

    if (bubblesInSpace.has(data.cid)) {
        const mesh = bubblesInSpace.get(data.cid);
        // Smoothly update position if it drifts
        mesh.position.set(data.x, data.y, data.z);
        // Update size based on views
        const newSize = 1 + (Math.log((data.views || 0) + 2) * 0.5);
        mesh.scale.setScalar(newSize);
    } else {
        const newMesh = createBubbleMesh(data);
        scene.add(newMesh);
        bubblesInSpace.set(data.cid, newMesh);
        console.log("New bubble manifest at:", data.x, data.y, data.z);
    }
});

// 6. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    
    FlightController.update(delta);
    WarpDrive.update();
    
    // Slow drift of the entire scene for cinematic effect
    scene.rotation.y += 0.00005; 
    
    renderer.render(scene, camera);
}

// 7. Initialize IPFS and Start
IPFSNode.init().then(() => {
    console.log("Big Bang Initialized.");
    animate();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});