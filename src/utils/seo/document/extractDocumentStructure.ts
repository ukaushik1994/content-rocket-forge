
/**
 * Utility functions for analyzing document structure and headings
 */

import { DocumentStructure } from '@/contexts/content-builder/types';

/**
 * Extract document structure from HTML content
 */
export const extractDocumentStructure = (htmlContent: string): DocumentStructure => {
  // Parse the markdown content (simulated for now)
  const lines = htmlContent.split('\n');
  
  // Extract headings
  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];
  const h4: string[] = [];
  const h5: string[] = [];
  const h6: string[] = [];
  const headings = [];
  
  // Count paragraphs, lists, etc.
  let paragraphs = 0;
  const lists = [];
  let images = 0;
  let tables = 0;
  let totalWords = 0;
  
  // Process each line to identify structure elements
  lines.forEach(line => {
    // Count words
    const words = line.trim().split(/\s+/).filter(Boolean);
    totalWords += words.length;
    
    // Check for headings
    if (line.startsWith('# ')) {
      const text = line.substring(2).trim();
      h1.push(text);
      headings.push({ level: 1, text });
    } else if (line.startsWith('## ')) {
      const text = line.substring(3).trim();
      h2.push(text);
      headings.push({ level: 2, text });
    } else if (line.startsWith('### ')) {
      const text = line.substring(4).trim();
      h3.push(text);
      headings.push({ level: 3, text });
    } else if (line.startsWith('#### ')) {
      const text = line.substring(5).trim();
      h4.push(text);
      headings.push({ level: 4, text });
    } else if (line.startsWith('##### ')) {
      const text = line.substring(6).trim();
      h5.push(text);
      headings.push({ level: 5, text });
    } else if (line.startsWith('###### ')) {
      const text = line.substring(7).trim();
      h6.push(text);
      headings.push({ level: 6, text });
    }
    
    // Check for paragraphs (simplified)
    else if (line.trim().length > 0 && !line.trim().startsWith('-') && !line.trim().startsWith('*')) {
      paragraphs++;
    }
    
    // Check for lists (simplified)
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      lists.push({ type: 'unordered', items: 1 });
    } else if (line.trim().match(/^\d+\.\s/)) {
      lists.push({ type: 'ordered', items: 1 });
    }
    
    // Check for images (simplified)
    if (line.includes('![')) {
      images++;
    }
    
    // Check for tables (simplified)
    if (line.includes('|') && line.includes('-')) {
      tables++;
    }
  });
  
  // Check if document has exactly one H1
  const hasSingleH1 = h1.length === 1;
  
  // Check for logical heading hierarchy
  let hasLogicalHierarchy = true;
  let lastLevel = 0;
  
  for (const heading of headings) {
    if (heading.level > lastLevel + 1 && lastLevel !== 0) {
      hasLogicalHierarchy = false;
      break;
    }
    lastLevel = heading.level;
  }
  
  return {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    hasSingleH1,
    hasLogicalHierarchy,
    headings,
    paragraphs,
    lists,
    images,
    tables,
    totalWords
  };
};
