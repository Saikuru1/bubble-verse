/**
 * gun.js - The "Shared Nervous System"
 */
import 'gun'; // This loads the library globally via the importmap
const Gun = window.Gun; 

// Connect to a public relay
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);

export const StarMap = {
  space: gun.get('universal-bubble-verse-v1'),

  broadcast(cid, coords) {
    this.space.get(cid).put({
      cid: cid,
      x: coords.x,
      y: coords.y,
      z: coords.z,
      label: coords.label || "Thought",
      timestamp: Date.now(),
      views: 1
    });
  },

  observe(callback) {
    this.space.map().on((data, cid) => {
      if (data && data.cid) {
        callback(data);
      }
    });
  },

  pulse(cid) {
    const bubble = this.space.get(cid);
    bubble.get('views').once((v) => {
      bubble.put({ views: (v || 0) + 1 });
    });
  }
};