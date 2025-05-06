
/**
 * Utility functions for content rewriting
 */

/**
 * Get the type of improvement based on recommendation text
 */
export const getImprovementType = (recommendation: string): string => {
  const lowerRec = recommendation.toLowerCase();
  
  if (lowerRec.includes('keyword')) return 'keyword';
  if (lowerRec.includes('heading')) return 'heading';
  if (lowerRec.includes('sentence') || lowerRec.includes('paragraph')) return 'content';
  if (lowerRec.includes('readability')) return 'readability';
  if (lowerRec.includes('length')) return 'length';
  
  return 'other';
};

/**
 * Get rewrite instructions based on recommendation type
 */
export const getRewriteInstructions = (type: string, recommendation: string): string => {
  switch (type) {
    case 'keyword':
      return `Optimize this content based on the following recommendation: "${recommendation}". 
              Maintain the original meaning but adjust keyword density.`;
      
    case 'heading':
      return `Restructure this content to add proper headings based on the recommendation: "${recommendation}".
              Use # for main headings and ## for subheadings.`;
      
    case 'content':
      return `Rewrite this content to improve clarity and structure based on: "${recommendation}".
              Focus on sentence and paragraph structure while maintaining content meaning.`;
      
    case 'readability':
      return `Improve the readability of this content based on: "${recommendation}".
              Use shorter sentences, simpler words, and better paragraph structure.`;
      
    case 'length':
      return `Expand this content based on: "${recommendation}".
              Add relevant details, examples, and explanations to reach the recommended length.`;
      
    default:
      return `Improve this content based on the following recommendation: "${recommendation}".`;
  }
};
