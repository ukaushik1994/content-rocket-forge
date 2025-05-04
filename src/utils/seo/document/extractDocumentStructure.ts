
/**
 * Utility functions for analyzing document structure and headings
 */

import { DocumentStructure } from '@/contexts/content-builder/types';

/**
 * Extract document structure from HTML content
 */
export const extractDocumentStructure = (htmlContent: string): DocumentStructure => {
  // Create a temporary DOM parser in the browser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Check for single H1 tag
  const h1Tags = doc.querySelectorAll('h1');
  const hasSingleH1 = h1Tags.length === 1;
  
  // Check for logical heading hierarchy (e.g., H2 follows H1, H3 follows H2)
  let hasLogicalHierarchy = true;
  let lastHeadingLevel = 0;
  
  const headingTags = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  // Extract heading text content by level
  const h1 = Array.from(doc.querySelectorAll('h1')).map(el => el.textContent || '');
  const h2 = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent || '');
  const h3 = Array.from(doc.querySelectorAll('h3')).map(el => el.textContent || '');
  const h4 = Array.from(doc.querySelectorAll('h4')).map(el => el.textContent || '');
  const h5 = Array.from(doc.querySelectorAll('h5')).map(el => el.textContent || '');
  const h6 = Array.from(doc.querySelectorAll('h6')).map(el => el.textContent || '');
  
  for (const tag of headingTags) {
    const level = parseInt(tag.tagName.substring(1));
    
    if (level > lastHeadingLevel + 1 && lastHeadingLevel !== 0) {
      hasLogicalHierarchy = false;
      break;
    }
    
    lastHeadingLevel = level;
  }
  
  return {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    hasSingleH1,
    hasLogicalHierarchy
  };
};
