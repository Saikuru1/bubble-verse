/**
 * interaction.js
 * The "Bridge of Understanding."
 * Handles clicking bubbles and retrieving their inner thoughts.
 */
import * as THREE from 'three';
import { IPFSNode } from '../data/ipfs.js';

export const Interaction = {
    init(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Listen for clicks on the 3D canvas
        window.addEventListener('click', (e) => this.onIntersect(e));
    },

    async onIntersect(event) {
        // 1. Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 2. Raycast to find what we hit
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            // Find the first object that has our bubble data
            const clickedObject = intersects.find(obj => obj.object.userData.cid || obj.object.parent?.userData.cid);
            
            if (clickedObject) {
                const mesh = clickedObject.object.userData.cid ? clickedObject.object : clickedObject.object.parent;
                const cid = mesh.userData.cid;
                
                console.log("Interacting with Bubble:", cid);
                await this.displayThought(cid);
            }
        }
    },

    async displayThought(cid) {
        const overlay = document.getElementById('ui-layer');
        
        // Show a temporary "Loading" state so we don't see null
        const whisperBox = document.getElementById('whisper-box');
        const originalPlaceholder = whisperBox.placeholder;
        whisperBox.value = "";
        whisperBox.placeholder = "Retrieving thought from the IPFS void...";

        try {
            // 3. FETCH THE REAL DATA
            // This goes out to the IPFS network to find the actual text
            const content = await IPFSNode.hydrate(cid);
            
            if (content) {
                // SUCCESS: Fill the box with the recovered thought
                whisperBox.value = content;
                whisperBox.placeholder = originalPlaceholder;
                console.log("Substance Recovered:", content);
            } else {
                whisperBox.value = "The thought has evaporated...";
            }
        } catch (error) {
            console.error("Hydration Failed:", error);
            whisperBox.value = "Error: Could not reach this part of the network.";
        }
    }
};