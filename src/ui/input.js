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
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
        
        try {
            // Start the sequence
            await this.launch(text);
            
            // Clean up UI
            box.value = '';
            box.style.height = 'auto';
            this.animateLaunch();
        } catch (err) {
            console.error("Ignition Failure:", err);
        } finally {
            button.style.pointerEvents = 'all';
            button.style.opacity = '1';
        }
      }
    });
  },

  async launch(text) {
    // A. Crystallize (IPFS)
    const cid = await IPFSNode.crystallize(text);

    // B. Validation: Stop if the matter didn't form
    if (!cid) {
        throw new Error("Matter failed to crystallize in the void.");
    }

    // C. Calculate Identity
    const label = NLP.extractLighthouse(text);
    const coords = GravityEngine.calculateOrigin(text);

    // D. Broadcast (GunDB)
    StarMap.broadcast(cid, {
      ...coords,
      label: label,
      timestamp: Date.now()
    });
    
    console.log(`Thought '${label}' flung into coordinates:`, coords);
  },

  animateLaunch() {
    const btn = document.getElementById('ignite-button');
    btn.classList.add('ignite-flash');
    setTimeout(() => {
        btn.classList.remove('ignite-flash');
    }, 500);
  }
};