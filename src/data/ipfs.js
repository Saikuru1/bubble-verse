import { createHelia } from 'helia';
import { strings } from '@helia/strings';

let helia;
let s;

export const IPFSNode = {
    async init() {
        if (helia) return;
        helia = await createHelia();
        s = strings(helia);
        console.log("IPFS Substance Engine Online.");
    },

    async crystallize(text) {
        // Save text and return the CID (Unique ID)
        const cid = await s.add(text);
        return cid.toString();
    },

    async hydrate(cid) {
        try {
            // Fetch text using the CID
            return await s.get(cid);
        } catch (e) {
            console.error("IPFS Hydration Error:", e);
            return "Lost in the void...";
        }
    }
};