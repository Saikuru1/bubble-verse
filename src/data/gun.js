/**
 * gun.js
 * The "Shared Nervous System."
 * Syncs bubble coordinates and CIDs across all users in real-time.
 */

import Gun from 'gun';

// Connect to a few public "relay" peers to help discovery
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);

export const StarMap = {
  
  // 1. A reference to the "galaxy" of bubbles
  space: gun.get('universal-bubble-verse-v1'),

  /**
   * 2. Broadcast a new bubble to the universe
   * @param {string} cid - The IPFS hash from ipfs.js
   * @param {object} coords - {x, y, z} from gravity.js
   */
  broadcast(cid, coords) {
    this.space.get(cid).put({
      cid: cid,
      x: coords.x,
      y: coords.y,
      z: coords.z,
      timestamp: Date.now(),
      views: 1
    });
  },

  /**
   * 3. Listen for new bubbles appearing in the void
   * @param {function} callback - What to do when a bubble is found
   */
  observe(callback) {
    this.space.map().on((data, cid) => {
      if (data) {
        // This triggers whenever ANYONE in the world adds a bubble
        callback(data);
      }
    });
  },

  /**
   * 4. Update a bubble's mass (Entropy/View logic)
   */
  pulse(cid) {
    const bubble = this.space.get(cid);
    bubble.get('views').once((v) => {
      bubble.put({ views: (v || 0) + 1 });
    });
  }
};