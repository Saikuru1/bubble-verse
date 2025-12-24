/**
 * warp.js
 * The "Navigational Computer."
 * Translates search queries into physical coordinates and flies the camera.
 */

import * as THREE from 'three';
import { GravityEngine } from '../physics/gravity.js';

export const WarpDrive = {
  isWarping: false,
  targetPos: new THREE.Vector3(),
  
  init(camera) {
    this.camera = camera;
    const searchInput = document.getElementById('warp-search');

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) this.engage(query);
        searchInput.blur(); // Close keyboard on mobile
      }
    });
  },

  engage(query) {
    // 1. Where does this word "live" in the universe?
    const coords = GravityEngine.calculateOrigin(query);
    
    // 2. Set the destination (offset slightly so we aren't inside the bubble)
    this.targetPos.set(coords.x, coords.y, coords.z + 20);
    this.isWarping = true;
    
    console.log(`Warping to semantic cluster: ${query}`);
  },

  update() {
    if (!this.isWarping) return;

    // 3. Smoothly slide the camera toward the target (Lerp)
    // 0.05 = 5% of the distance covered every frame
    this.camera.position.lerp(this.targetPos, 0.05);

    // 4. Stop warping once we are close enough
    if (this.camera.position.distanceTo(this.targetPos) < 1) {
      this.isWarping = false;
    }
  }
};