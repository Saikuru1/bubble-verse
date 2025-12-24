/**
 * input.js
 * The "Voice of the Voyager."
 * Handles multi-line text entry, keyword extraction, and the ignition sequence.
 */

import { IPFSNode } from '../data/ipfs.js';
import { GravityEngine } from '../physics/gravity.js';
import { StarMap } from '../data/gun.js';
import { NLP } from '../utils/nlp.js';

export const UserInput = {
  
  init() {
    // Create the HUD if it doesn't exist
    if (!document.getElementById('ui-layer')) {
      const hud = document.createElement('div');
      hud.id = 'ui-layer';
      hud.innerHTML = `
        <div id="input-container">
          <textarea id="whisper-box" placeholder="Write your thought..." maxlength="2000"></textarea>
          <div id="ignite-button" title="Ignite into the Void"></div>
        </div>
      `;
      document.body.appendChild(hud);
    }

    const box = document.getElementById('whisper-box');
    const button = document.getElementById('ignite-button');

    // 1. Auto-expand textarea as user types
    box.addEventListener('input', () => {
      box.style.height = 'auto';
      box.style.height = box.scrollHeight + 'px';
    });

    // 2. The Ignition Sequence
    button.addEventListener('click', async () => {
      const text = box.value.trim();
      if (text.length > 0) {
        button.style.pointerEvents = 'none'; // Prevent double-clicks
        button.style.opacity = '0.5';
        
        await this.launch(text);
        
        // Reset UI
        box.value = '';
        box.style.height = 'auto';
        button.style.pointerEvents = 'all';
        button.style.opacity = '1';
        this.animateLaunch();
      }
    });
  },

  /**
   * Transforms thought into matter and flings it into space.
   */
  async launch(text) {
    // A. Extract the Lighthouse (Top keyword)
    const label = NLP.extractLighthouse(text);

    // B. Store in IPFS (The Substance)
    const cid = await IPFSNode.crystallize(text);

    // C. Calculate Position (The Physics)
    const coords = GravityEngine.calculateOrigin(text);

    // D. Broadcast (The Identity)
    // We include the 'label' so other users see the floating word
    StarMap.broadcast(cid, {
      ...coords,
      label: label,
      timestamp: Date.now()
    });
  },

  animateLaunch() {
    const btn = document.getElementById('ignite-button');
    btn.classList.add('ignite-flash');
    setTimeout(() => btn.classList.remove('ignite-flash'), 500);
  }
};