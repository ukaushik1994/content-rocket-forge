
/**
 * Utility function for detecting call-to-action (CTA) elements in content
 */

type CTAPositioning = 'none' | 'beginning' | 'middle' | 'end' | 'multiple';

interface CTAAnalysisResult {
  hasCTA: boolean;
  ctaCount: number;
  ctaPositioning: CTAPositioning;
  ctaPhrases: string[];
}

/**
 * Detects call to action phrases in content
 */
export function detectCTAs(content: string): CTAAnalysisResult {
  if (!content) {
    return { 
      hasCTA: false, 
      ctaCount: 0, 
      ctaPositioning: 'none',
      ctaPhrases: []
    };
  }
  
  // Common CTA phrases to check for
  const ctaPhrases = [
    "sign up", "subscribe", "register", "buy now", "shop now", "learn more",
    "get started", "try for free", "download now", "click here", "contact us",
    "book now", "get a quote", "join now", "call us", "read more", "find out more",
    "order now", "start your free trial", "schedule a demo", "request a consultation"
  ];
  
  // Regex to match CTA phrases (case insensitive)
  const ctaRegex = new RegExp(`\\b(${ctaPhrases.join('|')})\\b`, 'gi');
  const matches = content.match(ctaRegex) || [];
  
  const ctaCount = matches.length;
  const hasCTA = ctaCount > 0;
  
  // Determine positioning
  let ctaPositioning: CTAPositioning = 'none';
  
  if (hasCTA) {
    if (ctaCount > 1) {
      // If there's more than one CTA, check if they're in different sections
      const contentThirds = content.length / 3;
      let positions = matches.map(match => {
        const index = content.toLowerCase().indexOf(match.toLowerCase());
        if (index < contentThirds) return 'beginning';
        if (index < contentThirds * 2) return 'middle';
        return 'end';
      });
      
      // If we have CTAs in different positions, it's multiple
      const uniquePositions = [...new Set(positions)];
      if (uniquePositions.length > 1) {
        ctaPositioning = 'multiple';
      } else {
        ctaPositioning = uniquePositions[0] as CTAPositioning;
      }
    } else {
      // If there's only one CTA, determine which third of the content it's in
      const index = content.toLowerCase().indexOf(matches[0].toLowerCase());
      const contentThirds = content.length / 3;
      
      if (index < contentThirds) {
        ctaPositioning = 'beginning';
      } else if (index < contentThirds * 2) {
        ctaPositioning = 'middle';
      } else {
        ctaPositioning = 'end';
      }
    }
  }
  
  return {
    hasCTA,
    ctaCount,
    ctaPositioning,
    ctaPhrases: matches
  };
}
