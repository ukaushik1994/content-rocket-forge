
/**
 * Utility for detecting Call-to-Action elements in content
 */

/**
 * Detect Call-to-Action elements in content
 */
export const detectCTAs = (content: string): { hasCTA: boolean; ctaText: string[] } => {
  const ctaMarkers = [
    'click here',
    'sign up',
    'register',
    'subscribe',
    'download',
    'learn more',
    'get started',
    'try now',
    'contact us',
    'buy now',
    'order now'
  ];
  
  const foundCTAs: string[] = [];
  
  // Check each sentence for CTA markers
  const sentences = content.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    for (const marker of ctaMarkers) {
      if (lowerSentence.includes(marker)) {
        foundCTAs.push(sentence.trim());
        break;
      }
    }
  }
  
  // Remove duplicates
  const uniqueCTAs = [...new Set(foundCTAs)];
  
  return {
    hasCTA: uniqueCTAs.length > 0,
    ctaText: uniqueCTAs
  };
};
