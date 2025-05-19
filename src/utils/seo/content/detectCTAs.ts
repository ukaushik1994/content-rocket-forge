
import { CTAInfo } from './types';

/**
 * Detects call-to-action phrases in the content
 * @param content The content to analyze
 * @returns Object with CTA detection results
 */
export const detectCTAs = (content: string): CTAInfo => {
  // Common CTA phrases to check for
  const ctaPhrases = [
    'sign up',
    'get started',
    'try it free',
    'learn more',
    'contact us',
    'subscribe',
    'download',
    'buy now',
    'register',
    'start your free trial',
    'book a demo',
    'get in touch',
    'request a quote',
    'click here'
  ];
  
  const foundCTAs: string[] = [];
  let foundText = '';
  
  // Check for each CTA phrase in the content
  ctaPhrases.forEach(phrase => {
    // Case insensitive search
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = content.match(regex);
    
    if (matches && matches.length > 0) {
      foundCTAs.push(phrase);
      
      // Extract surrounding context (sentence)
      const sentenceRegex = new RegExp(`[^.!?]*\\b${phrase}\\b[^.!?]*[.!?]`, 'gi');
      const contextMatches = content.match(sentenceRegex);
      
      if (contextMatches && contextMatches.length > 0) {
        foundText = [...new Set(contextMatches)].join(' ');
      }
    }
  });
  
  return {
    hasCTA: foundCTAs.length > 0,
    ctaText: foundCTAs,
    count: foundCTAs.length,
    texts: foundText ? [foundText] : []
  };
};
