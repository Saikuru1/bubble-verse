/**
 * interaction.js
 * The "Dive" Mechanism.
 * Handles clicking bubbles and displaying the anonymous paper.
 */

import * as THREE from 'three';
import { IPFSNode } from '../data/ipfs.js';
import * as TWEEN from '@tweenjs/tween.js'; // Use the * as syntax

export const Interaction = {
  
  init(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('click', (e) => this.onInteract(e));
  },

  async onInteract(event) {
    // 1. Find what the user clicked in 3D space
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      const bubbleMesh = intersects[0].object;
      const cid = bubbleMesh.userData.cid;

      // 2. The "Dive" Animation
      this.zoomToBubble(bubbleMesh.position);

      // 3. Fetch the Matter from IPFS
      const text = await IPFSNode.resonate(cid);
      this.displayPaper(text);
    }
  },

  zoomToBubble(targetPos) {
    // Move camera close to the bubble smoothly
    new TWEEN.Tween(this.camera.position)
      .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z + 5 }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  },

  displayPaper(text) {
    const reader = document.createElement('div');
    reader.id = 'paper-overlay';
    reader.innerHTML = `
      <div class="paper-content">
        <p>${text}</p>
        <button id="close-paper">Back to Universe</button>
      </div>
    `;
    document.body.appendChild(reader);

    document.getElementById('close-paper').onclick = () => {
      reader.remove();
    };
  }
};