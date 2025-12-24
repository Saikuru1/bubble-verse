/**
 * ipfs.js
 * The "Matter" of the Universe.
 * Handles decentralized storage using Helia (IPFS).
 */

import { createHelia } from 'helia';
import { strings } from '@helia/strings';

let helia = null;
let s = null;

export const IPFSNode = {
  
  // 1. Initialize the node in the user's browser
  async init() {
    if (helia) return;
    
    // Creates a Helia node. The browser now starts 
    // looking for peers to connect to!
    helia = await createHelia();
    s = strings(helia);
    console.log("Universe Matter Initialized: Node is Online.");
  },

  // 2. Turn text into a "Star" (Add to IPFS)
  async crystallize(text) {
    if (!s) await this.init();
    
    // This turns the text into a unique Hash (CID)
    // If two people type the same thing, they get the same Hash.
    const cid = await s.add(text);
    return cid.toString();
  },

  // 3. Pull text from the void (Read from IPFS)
  async resonate(cid) {
    if (!s) await this.init();
    
    try {
      // Reaches out to the network to find the data
      return await s.get(cid);
    } catch (e) {
      // If the data is gone (Host or Die rule), it returns null
      console.error("The thought has dissipated into the void.");
      return null;
    }
  }
};