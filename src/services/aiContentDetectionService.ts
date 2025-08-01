
export interface AiDetectionResult {
  confidenceScore: number;
  isAiGenerated: boolean;
  reasons: string[];
}

export async function detectAIContent(content: string): Promise<AiDetectionResult> {
  try {
    // Mock implementation for now
    const words = content.split(/\s+/).filter(Boolean);
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    
    // Simple heuristics for AI detection
    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const repetitiveWords = findRepetitiveWords(content);
    
    let confidenceScore = 20; // Base score assuming mostly human
    
    if (avgSentenceLength > 20) confidenceScore += 15;
    if (repetitiveWords > 5) confidenceScore += 10;
    if (content.includes('as an AI') || content.includes('I apologize')) confidenceScore += 40;
    
    confidenceScore = Math.min(100, confidenceScore);
    
    return {
      confidenceScore,
      isAiGenerated: confidenceScore > 50,
      reasons: confidenceScore > 50 ? ['High repetitive patterns detected'] : []
    };
  } catch (error) {
    console.error('Error detecting AI content:', error);
    return {
      confidenceScore: 0,
      isAiGenerated: false,
      reasons: []
    };
  }
}

function findRepetitiveWords(content: string): number {
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount: { [key: string]: number } = {};
  
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.values(wordCount).filter(count => count > 3).length;
}
