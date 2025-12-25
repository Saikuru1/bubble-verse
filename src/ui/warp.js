/**
 * warp.js
 * The "Navigational Computer."
 */
import * as THREE from 'three';
import { GravityEngine } from '../physics/gravity.js';

export const WarpDrive = {
  isWarping: false,
  targetPos: new THREE.Vector3(),
  
  init(camera) {
    this.camera = camera;
    const searchInput = document.getElementById('warp-search');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) this.engage(query);
        searchInput.blur(); 
      }
    });
  },

  engage(query) {
    // 1. Get the target coordinates
    const coords = GravityEngine.calculateOrigin(query);
    
    // 2. THE FIX: Stop 150 units back on the Z axis 
    // This ensures we are LOOKING at the bubble, not inside it.
    this.targetPos.set(coords.x, coords.y, coords.z + 150);
    this.isWarping = true;
    
    console.log(`Warping to: ${query} at coords:`, coords);
  },

  update() {
    if (!this.isWarping) return;

    // 3. Smoothly slide the camera toward the target
    this.camera.position.lerp(this.targetPos, 0.05);

    // 4. Force the camera to keep looking at the target center while flying
    // We subtract the 150 offset to look at the actual math origin
    const lookAtPos = new THREE.Vector3(this.targetPos.x, this.targetPos.y, this.targetPos.z - 150);
    this.camera.lookAt(lookAtPos);

    // 5. Stop warping once we are close enough
    if (this.camera.position.distanceTo(this.targetPos) < 1) {
      this.isWarping = false;
    }
  }
};