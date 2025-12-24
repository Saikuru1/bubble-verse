/**
 * camera.js
 * The "Thrusters of the Voyager."
 * Unified Desktop (Keyboard/Mouse) and Mobile (Touch) momentum-based flight.
 */

import * as THREE from 'three';

export const FlightController = {
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  lookDirection: new THREE.Euler(0, 0, 0, 'YXZ'),
  keys: {},
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  touchStart: new THREE.Vector2(),

  init(camera, renderer) {
    this.camera = camera;

    if (this.isMobile) {
      this.initTouchControls(renderer.domElement);
    } else {
      this.initKeyboardControls(renderer);
    }
  },

  // --- DESKTOP LOGIC ---
  initKeyboardControls(renderer) {
    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);

    renderer.domElement.addEventListener('click', () => {
      renderer.domElement.requestPointerLock();
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === renderer.domElement) {
        this.lookDirection.y -= e.movementX * 0.002;
        this.lookDirection.x -= e.movementY * 0.002;
        this.lookDirection.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.lookDirection.x));
        this.camera.quaternion.setFromEuler(this.lookDirection);
      }
    });
  },

  // --- MOBILE LOGIC ---
  initTouchControls(el) {
    el.addEventListener('touchstart', (e) => {
      this.touchStart.set(e.touches[0].pageX, e.touches[0].pageY);
    }, { passive: false });

    el.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.pageX - this.touchStart.x;
      const dy = touch.pageY - this.touchStart.y;

      // Left half = Move | Right half = Look
      if (this.touchStart.x < window.innerWidth / 2) {
        this.velocity.z -= dy * 0.005; 
        this.velocity.x += dx * 0.005;
      } else {
        this.lookDirection.y -= dx * 0.005;
        this.lookDirection.x -= dy * 0.005;
        this.camera.quaternion.setFromEuler(this.lookDirection);
      }
      this.touchStart.set(touch.pageX, touch.pageY);
    }, { passive: false });
  },

  /**
   * Called every frame by main.js
   */
  update(delta) {
    const speed = 60.0;
    const friction = 0.95; 

    if (!this.isMobile) {
      // Desktop Directional Input
      this.direction.z = Number(this.keys['KeyW'] || false) - Number(this.keys['KeyS'] || false);
      this.direction.x = Number(this.keys['KeyD'] || false) - Number(this.keys['KeyA'] || false);
      this.direction.y = Number(this.keys['Space'] || false) - Number(this.keys['ShiftLeft'] || false);
      this.direction.normalize();

      if (this.keys['KeyW'] || this.keys['KeyS']) this.velocity.z -= this.direction.z * speed * delta;
      if (this.keys['KeyA'] || this.keys['KeyD']) this.velocity.x -= this.direction.x * speed * delta;
      if (this.keys['Space'] || this.keys['ShiftLeft']) this.velocity.y += this.direction.y * speed * delta;
    }

    // Apply Friction (Momentum decay)
    this.velocity.multiplyScalar(friction);

    // Apply translation relative to camera orientation
    this.camera.translateX(this.velocity.x);
    this.camera.translateY(this.velocity.y);
    this.camera.translateZ(this.velocity.z);
  }
};