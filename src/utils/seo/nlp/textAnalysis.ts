
/**
 * Utility for basic NLP text analysis
 */

/**
 * Extract key phrases from text content based on frequency and relevance
 */
export const extractKeyPhrases = (text: string): string[] => {
  if (!text || typeof text !== 'string') return [];
  
  // Normalize text: lowercase and remove special characters
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split text into sentences for context
  const sentences = text.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
  
  // Get all 2-4 word phrases (poor man's n-gram)
  const phrases: Record<string, number> = {};
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    
    // Skip very short sentences
    if (words.length < 3) return;
    
    // Extract 2, 3, and 4-word phrases
    for (let n = 2; n <= 4; n++) {
      if (words.length >= n) {
        for (let i = 0; i <= words.length - n; i++) {
          const phrase = words.slice(i, i + n).join(' ');
          
          // Skip phrases with stopwords at beginning or end
          if (isStopWord(words[i]) || isStopWord(words[i + n - 1])) {
            continue;
          }
          
          // Skip very short phrases or phrases with special characters
          if (phrase.length < 5 || /[^\w\s]/g.test(phrase)) {
            continue;
          }
          
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    }
  });
  
  // Convert to array and sort by frequency
  const sortedPhrases = Object.entries(phrases)
    .filter(([phrase, count]) => count > 1) // Only phrases that appear multiple times
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .map(([phrase]) => phrase);
  
  return sortedPhrases.slice(0, 5); // Return top 5 key phrases
};

/**
 * Check if a word is a common stopword (words we want to ignore for analysis)
 */
const isStopWord = (word: string): boolean => {
  const stopwords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what', 
    'when', 'where', 'how', 'who', 'which', 'this', 'that', 'these', 'those', 
    'then', 'just', 'so', 'than', 'such', 'both', 'through', 'about', 'for', 
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 
    'do', 'does', 'did', 'to', 'at', 'in', 'on', 'by', 'with', 'from'
  ];
  
  return stopwords.includes(word.toLowerCase().trim());
};

/**
 * Get keyword density and related metrics for a specific keyword in content
 */
export const getKeywordDensity = (content: string, keyword: string) => {
  if (!content || !keyword) return { count: 0, density: '0%' };
  
  const normalizedContent = content.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();
  
  // Count exact matches
  const exactMatches = (normalizedContent.match(new RegExp(`\\b${normalizedKeyword}\\b`, 'g')) || []).length;
  
  // Count partial matches (for compound keywords)
  const partialMatches = normalizedKeyword.split(' ').length > 1 ? 
    (normalizedContent.match(new RegExp(normalizedKeyword, 'g')) || []).length - exactMatches : 
    0;
  
  // Total word count
  const wordCount = content.split(/\s+/).length;
  
  // Calculate density
  const density = wordCount > 0 ? (exactMatches / wordCount) * 100 : 0;
  
  return {
    count: exactMatches,
    partialCount: partialMatches,
    density: density.toFixed(2) + '%',
    wordCount
  };
};

/**
 * Calculate readability score using simplified Flesch Reading Ease
 */
export const calculateReadability = (content: string): number => {
  if (!content || typeof content !== 'string') return 0;
  
  // Split into sentences
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const sentenceCount = sentences.length;
  
  if (sentenceCount === 0) return 0;
  
  // Count words
  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  if (wordCount === 0) return 0;
  
  // Count syllables (simplified approximation)
  const syllableCount = words.reduce((count, word) => {
    return count + estimateSyllables(word);
  }, 0);
  
  // Calculate average sentence length
  const avgSentenceLength = wordCount / sentenceCount;
  
  // Calculate average syllables per word
  const avgSyllablesPerWord = syllableCount / wordCount;
  
  // Simplified Flesch Reading Ease score
  // https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests
  const readabilityScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Normalize score to 0-100 range
  return Math.min(100, Math.max(0, Math.round(readabilityScore)));
};

/**
 * Estimate the number of syllables in a word (simplified)
 */
const estimateSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  
  // Count vowel groups as syllables
  const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
  let count = 0;
  let previousIsVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousIsVowel) {
      count++;
    }
    previousIsVowel = isVowel;
  }
  
  // Account for silent 'e' at the end
  if (word.length > 2 && word.endsWith('e') && !vowels.includes(word[word.length - 2])) {
    count--;
  }
  
  // Every word has at least one syllable
  return Math.max(1, count);
};
