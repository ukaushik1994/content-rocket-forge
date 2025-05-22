
/**
 * Utility for detecting Call-to-Action elements in content
 */

/**
 * Detect Call-to-Action elements in content
 */
export const detectCTAs = (content: string): { hasCTA: boolean; ctaText: string[] } => {
  // If content is empty, return no CTAs
  if (!content) return { hasCTA: false, ctaText: [] };
  
  const ctaMarkers = [
    'click here',
    'sign up',
    'register',
    'subscribe',
    'download',
    'learn more',
    'get started',
    'try now',
    'try it',
    'contact us',
    'buy now',
    'order now',
    'shop now',
    'book now',
    'schedule now',
    'schedule a',
    'call us',
    'email us',
    'request a',
    'start your',
    'start today',
    'join now',
    'join today',
    'discover how',
    'find out',
    'explore',
    'visit our'
  ];
  
  // Additional patterns that might indicate a CTA
  const ctaPatterns = [
    /call .*? today/i,
    /visit .*? to learn more/i,
    /contact .*? for more information/i,
    /don't hesitate to/i,
    /don't wait/i,
    /act now/i,
    /limited time/i,
    /today only/i
  ];
  
  const foundCTAs: string[] = [];
  
  // Check each sentence for CTA markers
  const sentences = content.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    
    // Check for keyword markers
    let hasCTA = ctaMarkers.some(marker => lowerSentence.includes(marker));
    
    // If no keyword matches, check for patterns
    if (!hasCTA) {
      hasCTA = ctaPatterns.some(pattern => pattern.test(lowerSentence));
    }
    
    // If CTA found, add to list
    if (hasCTA) {
      foundCTAs.push(sentence.trim());
    }
  }
  
  // Remove duplicates
  const uniqueCTAs = [...new Set(foundCTAs)];
  
  return {
    hasCTA: uniqueCTAs.length > 0,
    ctaText: uniqueCTAs
  };
};
