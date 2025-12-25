/**
 * gravity.js
 * The "Natural Law" of the Bubble-Verse.
 * Stabilized for Deterministic Warp Navigation.
 */

export const GravityEngine = {
  
  /**
   * THE GENESIS: Convert text into a starting coordinate [x, y, z]
   * Fixed: Uses the "Focal Word" to ensure Search and Ignite match.
   */
  calculateOrigin(text) {
    if (!text) return { x: 0, y: 0, z: 0 };

    // 1. Find the "Focal Word" (the longest word) to act as the anchor
    const words = text.toLowerCase().replace(/[^a-z ]/g, "").split(/\s+/);
    const focalWord = words.sort((a, b) => b.length - a.length)[0] || "void";

    let x = 0, y = 0, z = 0;

    // 2. Deterministic Hash based ONLY on the focal word
    for (let i = 0; i < focalWord.length; i++) {
        const charCode = focalWord.charCodeAt(i);
        // Use prime multipliers to spread the coordinates across the void
        if (i % 3 === 0) x += charCode * 131;
        if (i % 3 === 1) y += charCode * 137;
        if (i % 3 === 2) z += charCode * 139;
    }

    // 3. Map to a 5000-unit play area
    // This ensures bubbles aren't too far for the camera to reach
    return {
      x: (x % 4000) - 2000,
      y: (y % 4000) - 2000,
      z: (z % 4000) - 2000
    };
  },

  /**
   * SEMANTIC GRAVITY: Calculate the "Pull" between two bubbles
   */
  calculateAttraction(text1, text2) {
    const similarity = this.getSimilarity(text1, text2);
    // Only similar thoughts pull each other (similarity > 20%)
    return similarity > 0.2 ? similarity : 0;
  },

  /**
   * THE BRAIN: Jaccard Similarity
   */
  getSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const s1 = new Set(text1.toLowerCase().split(/\s+/));
    const s2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    return intersection.size / union.size;
  },

  /**
   * THE ENTROPY: Natural Expansion
   */
  applyEntropy(bubble) {
    const pushStrength = 0.001; 
    const observationFactor = 1 / ((bubble.views || 0) + 1);
    
    return {
      x: bubble.x * (1 + pushStrength * observationFactor),
      y: bubble.y * (1 + pushStrength * observationFactor),
      z: bubble.z * (1 + pushStrength * observationFactor)
    };
  },

  /**
   * THE HEAT DEATH
   */
  shouldDissipate(bubble) {
    const distance = Math.sqrt(bubble.x**2 + bubble.y**2 + bubble.z**2);
    return distance > 20000 && (bubble.views || 0) < 5;
  }
};