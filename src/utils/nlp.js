/**
 * nlp.js
 * The "Lighthouse Processor."
 * Identifies the most significant word to label the bubble.
 */

export const NLP = {
  
  // Words to ignore (The, and, a, etc.)
  stopWords: new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'you', 'that', 'this', 'for', 'was', 'with', 'on']),

  /**
   * Extracts the "Lighthouse Word"
   * @param {string} text 
   * @returns {string} - The most significant word
   */
  extractLighthouse(text) {
    const words = text.toLowerCase()
      .replace(/[^a-z ]/g, "") // Remove punctuation
      .split(/\s+/);

    const frequencyMap = {};
    
    words.forEach(word => {
      if (word.length < 4 || this.stopWords.has(word)) return;
      frequencyMap[word] = (frequencyMap[word] || 0) + 1;
    });

    // Sort by frequency and length (longer words are often more specific)
    const sorted = Object.keys(frequencyMap).sort((a, b) => {
      const scoreB = frequencyMap[b] * b.length;
      const scoreA = frequencyMap[a] * a.length;
      return scoreB - scoreA;
    });

    return sorted[0] || "Whisper"; // Fallback if text is too short
  }
};