
/**
 * Utility for detecting Call-to-Action elements in content
 */

/**
 * Detect Call-to-Action elements in content
 */
export const detectCTAs = (content: string): { hasCTA: boolean; ctaText: string[] } => {
  const ctaPatterns = [
    // Action verbs with common CTAs
    /\b(try|start|get started|sign up|register|subscribe|join)\b/i,
    /\b(download|learn more|contact|book|schedule|request)\b/i,
    /\b(buy now|order now|purchase|shop|add to cart)\b/i,
    /\b(unlock|discover|explore|see how|find out)\b/i,
    /\b(claim|grab|get access|access now)\b/i,
    /\b(upgrade|choose plan|view plans|see pricing)\b/i,
    /\b(talk to|speak with|call us|email us|reach out)\b/i,
    /\b(apply now|enroll|get quote|request demo)\b/i,
    // Markdown buttons/links with action words
    /\[.*?(try|start|get|sign|download|learn|contact|book|schedule|buy|order)\b.*?\]\(.*?\)/i,
    // Imperative phrases
    /\b(don't miss|act now|limited time|today only)\b/i
  ];
  
  const foundCTAs: string[] = [];
  
  // Check each sentence for CTA patterns
  const sentences = content.split(/[.!?]+/);
  for (const sentence of sentences) {
    for (const pattern of ctaPatterns) {
      if (pattern.test(sentence)) {
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
