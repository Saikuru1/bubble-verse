/**
 * input.js
 */
import { IPFSNode } from '../data/ipfs.js';
import { GravityEngine } from '../physics/gravity.js';
import { StarMap } from '../data/gun.js';
import { NLP } from '../utils/nlp.js';

export const UserInput = {
  init() {
    const box = document.getElementById('whisper-box');
    const button = document.getElementById('ignite-button');

    if (!box || !button) {
        console.error("UI Elements missing! Check your index.html IDs.");
        return;
    }

    box.addEventListener('input', () => {
      box.style.height = 'auto';
      box.style.height = box.scrollHeight + 'px';
    });

    button.addEventListener('click', async () => {
      console.log("Ignition Sequence Started..."); // Debug check
      const text = box.value.trim();
      
      if (text.length > 0) {
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
        
        try {
            await this.launch(text);
            console.log("Thought Launched Successfully!");
            box.value = '';
            box.style.height = 'auto';
        } catch (err) {
            console.error("Launch Failed:", err);
        } finally {
            button.style.pointerEvents = 'all';
            button.style.opacity = '1';
            this.animateLaunch();
        }
      }
    });
  },

  async launch(text) {
    const label = NLP.extractLighthouse(text);
    const cid = await IPFSNode.crystallize(text);
    const coords = GravityEngine.calculateOrigin(text);

    StarMap.broadcast(cid, {
      ...coords,
      label: label,
      timestamp: Date.now()
    });
  },

  animateLaunch() {
    const btn = document.getElementById('ignite-button');
    btn.classList.add('ignite-flash');
    // Using an arrow function here prevents CSP string-eval errors
    setTimeout(() => {
        btn.classList.remove('ignite-flash');
    }, 500);
  }
};