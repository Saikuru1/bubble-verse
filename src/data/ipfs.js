import { createHelia } from 'helia';
import { strings } from '@helia/strings';

let heliaNode = null;
let s = null;

export const IPFSNode = {
    /**
     * Initializes the Helia node if it hasn't been already.
     */
    async init() {
        if (heliaNode) return;
        try {
            heliaNode = await createHelia();
            s = strings(heliaNode);
            console.log("Universe Matter Initialized: IPFS is Online.");
        } catch (error) {
            console.error("IPFS Initialization Failed:", error);
        }
    },

    /**
     * Internal helper to make sure we don't try to use IPFS 
     * before it's finished booting up.
     */
    async ensureReady() {
        if (!heliaNode || !s) {
            console.log("Waiting for IPFS Substance Engine...");
            await this.init();
        }
    },

    /**
     * Converts raw text into a CID (Content Identifier).
     */
    async crystallize(text) {
        await this.ensureReady();
        try {
            const cid = await s.add(text);
            console.log("Substance Crystallized:", cid.toString());
            return cid.toString();
        } catch (error) {
            console.error("Crystallization Failed:", error);
            return null;
        }
    },

    /**
     * Retrieves raw text from a CID.
     */
    async hydrate(cid) {
        await this.ensureReady();
        try {
            // CID needs to be handled as a string or a CID object
            // s.get is very reliable once helia is ready
            const result = await s.get(cid);
            return result;
        } catch (e) {
            console.error("IPFS Hydration Error:", e);
            return "The void remains silent (Data not found).";
        }
    }
};