/**
 * gravity.js
 * The "Natural Law" of the Bubble-Verse.
 * Merged: Contains Origin Calculation, Attraction Logic, and Entropy.
 */

export const GravityEngine = {
  
  // 1. THE GENESIS: Convert text into a starting coordinate [x, y, z]
  calculateOrigin(text) {
    let x = 0, y = 0, z = 0;
    const cleanText = text.toLowerCase().replace(/[^a-z ]/g, "");
    const words = cleanText.split(" ");

    words.forEach((word, index) => {
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        // Distribute coordinates based on word position
        if (index % 3 === 0) x += charCode;
        if (index % 3 === 1) y += charCode;
        if (index % 3 === 2) z += charCode;
      }
    });

    // Constrain the universe size to a 10,000 unit cube
    return {
      x: (x % 10000) - 5000,
      y: (y % 10000) - 5000,
      z: (z % 10000) - 5000
    };
  },

  // 2. SEMANTIC GRAVITY: Calculate the "Pull" between two bubbles
  calculateAttraction(bubbleA, bubbleB) {
    const similarity = this.getSimilarity(bubbleA.text, bubbleB.text);
    
    // If they are similar (>20%), the force pulls them together
    const force = similarity > 0.2 ? similarity : 0;
    return force;
  },

  // 3. THE BRAIN: Jaccard Similarity (Checks for overlapping words)
  getSimilarity(text1, text2) {
    const s1 = new Set(text1.toLowerCase().split(/\s+/));
    const s2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...s1].filter(x => s2.has(x)));
    const union = new Set([...s1, ...s2]);
    return intersection.size / union.size;
  },

  // 4. THE ENTROPY: Natural Expansion & Decay
  applyEntropy(bubble) {
    // Every bubble feels a slight outward push from the center (0,0,0)
    const pushStrength = 0.01; 
    
    // If a bubble has few views, it drifts faster into the dark
    const observationFactor = 1 / (bubble.views + 1);
    
    return {
      x: bubble.x * (1 + pushStrength * observationFactor),
      y: bubble.y * (1 + pushStrength * observationFactor),
      z: bubble.z * (1 + pushStrength * observationFactor)
    };
  },

  // 5. THE HEAT DEATH: Check if the bubble should evaporate
  shouldDissipate(bubble) {
    const distanceFromCenter = Math.sqrt(bubble.x**2 + bubble.y**2 + bubble.z**2);
    const extremeVoid = 50000; // The boundary of existence
    
    // If it's too far out and unobserved, it "dies"
    return distanceFromCenter > extremeVoid && bubble.views < 5;
  }
};