/**
 * input.js
 * The "Voice of the Voyager."
 */
import { IPFSNode } from '../data/ipfs.js';
import { GravityEngine } from '../physics/gravity.js';
import { StarMap } from '../data/gun.js';
import { NLP } from '../utils/nlp.js';

export const UserInput = {
  init() {
    const box = document.getElementById('whisper-box');
    const button = document.getElementById('ignite-button');

    if (!box || !button) return;

    box.addEventListener('input', () => {
      box.style.height = 'auto';
      box.style.height = box.scrollHeight + 'px';
    });

    button.addEventListener('click', async () => {
      const text = box.value.trim();
      if (text.length > 0) {
        console.log("Ignition started for text:", text.substring(0, 20) + "...");
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
        
        try {
            await this.launch(text);
            box.value = '';
            box.style.height = 'auto';
            console.log("Launch successful.");
        } catch (err) {
            console.error("Launch failed:", err);
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
    // Function wrap to satisfy CSP
    setTimeout(() => {
        btn.classList.remove('ignite-flash');
    }, 500);
  }
};