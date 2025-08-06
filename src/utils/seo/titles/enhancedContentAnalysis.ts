/**
 * Enhanced content analysis for better title generation
 */

export interface ContentAnalysisResult {
  themes: string[];
  headings: string[];
  structure: string;
  contentType: string;
  valuePropositions: string[];
  keyPhrases: string[];
  sentimentTone: string;
  wordCount: number;
  readingLevel: string;
  mainTopics: string[];
}

/**
 * Analyze content to extract detailed information for title generation
 */
export function analyzeContentForTitles(content: string, mainKeyword: string): ContentAnalysisResult {
  // Extract headings and structure
  const headingMatches = content.match(/#{1,6}\s+([^\n]+)/g) || [];
  const headings = headingMatches
    .map(h => h.replace(/#{1,6}\s+/, '').trim())
    .slice(0, 10);

  // Analyze content structure and type
  const structure = detectContentStructure(content);
  const contentType = detectContentType(content, headings);
  
  // Extract themes and key phrases
  const themes = extractThemes(content, mainKeyword);
  const keyPhrases = extractKeyPhrases(content, mainKeyword);
  const mainTopics = extractMainTopics(content, mainKeyword);
  
  // Detect value propositions
  const valuePropositions = extractValuePropositions(content);
  
  // Analyze tone and complexity
  const sentimentTone = detectTone(content);
  const readingLevel = detectReadingLevel(content);
  
  return {
    themes,
    headings,
    structure,
    contentType,
    valuePropositions,
    keyPhrases,
    sentimentTone,
    wordCount: content.split(/\s+/).length,
    readingLevel,
    mainTopics
  };
}

/**
 * Detect the structural pattern of content
 */
function detectContentStructure(content: string): string {
  const hasNumberedSteps = /\d+\.\s|\bstep\s+\d+/i.test(content);
  const hasBulletPoints = /[-*•]\s/g.test(content);
  const hasComparisons = /(vs\.|versus|compared to|difference between|better than)/i.test(content);
  const hasQuestionsAnswers = /\?\s*\n/g.test(content);
  const hasCaseStudies = /(case study|example|real-world|study shows)/i.test(content);
  const hasListStructure = /(top\s+\d+|best\s+\d+|\d+\s+(ways|methods|tips|strategies))/i.test(content);
  
  if (hasNumberedSteps) return 'step-by-step';
  if (hasListStructure) return 'listicle';
  if (hasComparisons) return 'comparison';
  if (hasQuestionsAnswers) return 'faq';
  if (hasCaseStudies) return 'case-study';
  if (hasBulletPoints) return 'structured-guide';
  
  return 'comprehensive-guide';
}

/**
 * Determine the type of content based on patterns
 */
function detectContentType(content: string, headings: string[]): string {
  const lowerContent = content.toLowerCase();
  const allHeadings = headings.join(' ').toLowerCase();
  
  // Check for how-to patterns
  if (/(how to|steps to|guide to|tutorial)/i.test(content) || 
      /(how to|steps to|guide to)/i.test(allHeadings)) {
    return 'how-to';
  }
  
  // Check for review patterns
  if (/(review|rating|pros and cons|advantages|disadvantages)/i.test(content)) {
    return 'review';
  }
  
  // Check for comparison patterns
  if (/(compare|comparison|vs|versus|alternative)/i.test(content)) {
    return 'comparison';
  }
  
  // Check for educational content
  if (/(learn|understand|basics|fundamentals|introduction)/i.test(content)) {
    return 'educational';
  }
  
  // Check for problem-solving content
  if (/(problem|solution|fix|troubleshoot|resolve)/i.test(content)) {
    return 'problem-solving';
  }
  
  return 'informational';
}

/**
 * Extract key themes from content
 */
function extractThemes(content: string, mainKeyword: string): string[] {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = new Set([
    'this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 
    'said', 'each', 'which', 'their', 'time', 'would', 'about', 'more', 'many',
    'some', 'what', 'only', 'into', 'know', 'just', 'first', 'year', 'years',
    'when', 'them', 'people', 'could', 'other', 'after', 'very', 'being',
    'through', 'during', 'before', 'where', 'much', 'should', 'does', 'most'
  ]);
  
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    if (!stopWords.has(word) && word !== mainKeyword.toLowerCase()) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word)
    .filter(word => word.length > 4);
}

/**
 * Extract key phrases that could be used in titles
 */
function extractKeyPhrases(content: string, mainKeyword: string): string[] {
  const sentences = content.split(/[.!?]+/);
  const phrases: string[] = [];
  
  // Look for phrases that contain the main keyword
  sentences.forEach(sentence => {
    if (sentence.toLowerCase().includes(mainKeyword.toLowerCase())) {
      // Extract noun phrases and verb phrases
      const words = sentence.trim().split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        const twoWord = `${words[i]} ${words[i + 1]}`.replace(/[^\w\s]/g, '');
        const threeWord = i < words.length - 2 ? 
          `${words[i]} ${words[i + 1]} ${words[i + 2]}`.replace(/[^\w\s]/g, '') : '';
        
        if (twoWord.length > 8 && !phrases.includes(twoWord)) {
          phrases.push(twoWord);
        }
        if (threeWord.length > 12 && !phrases.includes(threeWord)) {
          phrases.push(threeWord);
        }
      }
    }
  });
  
  return phrases.slice(0, 6);
}

/**
 * Extract main topics from content
 */
function extractMainTopics(content: string, mainKeyword: string): string[] {
  const headings = content.match(/#{1,6}\s+([^\n]+)/g) || [];
  const topicWords = headings
    .map(h => h.replace(/#{1,6}\s+/, '').trim())
    .flatMap(heading => 
      heading.split(/\s+/)
        .filter(word => word.length > 4 && !word.toLowerCase().includes(mainKeyword.toLowerCase()))
    )
    .slice(0, 8);
  
  return [...new Set(topicWords)];
}

/**
 * Extract value propositions and benefits
 */
function extractValuePropositions(content: string): string[] {
  const benefitPatterns = [
    /\b(improve|increase|boost|enhance|optimize|maximize|reduce|save|achieve|master|learn|discover|unlock|transform|accelerate|streamline)\s+[\w\s]{1,30}/gi,
    /\b(better|faster|easier|more effective|more efficient|cost-effective|time-saving|proven|successful)\s+[\w\s]{1,20}/gi,
    /\b(help you|allows you to|enables you to|lets you)\s+[\w\s]{1,30}/gi
  ];
  
  const valueProps: string[] = [];
  
  benefitPatterns.forEach(pattern => {
    const matches = content.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim().toLowerCase();
      if (cleaned.length > 10 && cleaned.length < 60) {
        valueProps.push(cleaned);
      }
    });
  });
  
  return [...new Set(valueProps)].slice(0, 5);
}

/**
 * Detect the tone of the content
 */
function detectTone(content: string): string {
  const formalWords = ['furthermore', 'however', 'therefore', 'consequently', 'moreover'];
  const casualWords = ['you', 'your', 'we', 'our', 'let\'s', 'here\'s'];
  const technicalWords = ['implementation', 'methodology', 'algorithm', 'framework', 'architecture'];
  const friendlyWords = ['easy', 'simple', 'quick', 'fun', 'amazing', 'great'];
  
  const lowerContent = content.toLowerCase();
  
  const formalCount = formalWords.filter(word => lowerContent.includes(word)).length;
  const casualCount = casualWords.filter(word => lowerContent.includes(word)).length;
  const technicalCount = technicalWords.filter(word => lowerContent.includes(word)).length;
  const friendlyCount = friendlyWords.filter(word => lowerContent.includes(word)).length;
  
  if (technicalCount > 2) return 'technical';
  if (formalCount > casualCount) return 'formal';
  if (friendlyCount > 3) return 'friendly';
  if (casualCount > 5) return 'conversational';
  
  return 'neutral';
}

/**
 * Detect approximate reading level
 */
function detectReadingLevel(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/);
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Count complex words (3+ syllables)
  const complexWords = words.filter(word => countSyllables(word) >= 3).length;
  const complexWordRatio = complexWords / words.length;
  
  if (avgWordsPerSentence > 20 || complexWordRatio > 0.15) return 'advanced';
  if (avgWordsPerSentence > 15 || complexWordRatio > 0.10) return 'intermediate';
  return 'beginner';
}

/**
 * Simple syllable counter
 */
function countSyllables(word: string): number {
  const vowels = 'aeiouy';
  let count = 0;
  let prevIsVowel = false;
  
  for (const char of word.toLowerCase()) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevIsVowel) count++;
    prevIsVowel = isVowel;
  }
  
  return Math.max(1, count);
}