
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
    'order now',
    'book a demo',
    'schedule a demo',
    'request demo',
    'start free trial',
    'free trial',
    'try for free',
    'get quote',
    'request pricing',
    'contact sales',
    'speak with',
    'talk to',
    'call us',
    'email us',
    'request info',
    'see pricing',
    'view plans',
    'choose plan',
    'upgrade now',
    'purchase',
    'apply now',
    'join now',
    'get access',
    'unlock',
    'discover more',
    'explore features',
    'see how'
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
