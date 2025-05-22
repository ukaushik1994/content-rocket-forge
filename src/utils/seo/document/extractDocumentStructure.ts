
import { DocumentStructure, DocumentHeading } from '@/contexts/content-builder/types';

/**
 * Extracts document structure from markdown content
 */
export const extractDocumentStructure = (content: string): DocumentStructure => {
  // If content is empty, return a basic structure
  if (!content) {
    return {
      hasSingleH1: false,
      hasLogicalHierarchy: true,
      headings: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      paragraphs: [],
      lists: [],
      images: [],
      links: [],
      metadata: {
        wordCount: 0,
        characterCount: 0
      }
    };
  }
  
  // Extract headings by level
  const headings: DocumentHeading[] = [];
  const h1: string[] = [];
  const h2: string[] = [];
  const h3: string[] = [];
  const h4: string[] = [];
  const h5: string[] = [];
  const h6: string[] = [];
  const paragraphs: string[] = [];
  const lists: string[] = [];
  const images: { alt: string; src: string }[] = [];
  const links: { text: string; href: string }[] = [];
  
  // Process content line by line
  const lines = content.split('\n');
  
  // Process each line
  lines.forEach(line => {
    // Extract headings
    const h1Match = line.match(/^# (.+)/);
    const h2Match = line.match(/^## (.+)/);
    const h3Match = line.match(/^### (.+)/);
    const h4Match = line.match(/^#### (.+)/);
    const h5Match = line.match(/^##### (.+)/);
    const h6Match = line.match(/^###### (.+)/);
    
    // Extract lists
    const listItemMatch = line.match(/^[*\-+] (.+)/);
    const orderedListMatch = line.match(/^\d+\. (.+)/);
    
    // Extract images
    const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    
    // Extract links (outside of images)
    const linkMatches = [...line.matchAll(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g)];
    
    if (h1Match) {
      headings.push({ level: 1, text: h1Match[1] });
      h1.push(h1Match[1]);
    }
    else if (h2Match) {
      headings.push({ level: 2, text: h2Match[1] });
      h2.push(h2Match[1]);
    }
    else if (h3Match) {
      headings.push({ level: 3, text: h3Match[1] });
      h3.push(h3Match[1]);
    }
    else if (h4Match) {
      headings.push({ level: 4, text: h4Match[1] });
      h4.push(h4Match[1]);
    }
    else if (h5Match) {
      headings.push({ level: 5, text: h5Match[1] });
      h5.push(h5Match[1]);
    }
    else if (h6Match) {
      headings.push({ level: 6, text: h6Match[1] });
      h6.push(h6Match[1]);
    }
    else if (listItemMatch || orderedListMatch) {
      const listContent = listItemMatch ? listItemMatch[1] : orderedListMatch![1];
      lists.push(listContent);
    }
    else if (imageMatch) {
      images.push({ alt: imageMatch[1], src: imageMatch[2] });
    }
    else if (line.trim().length > 0 && !line.startsWith('>')) {
      // Basic paragraph detection (non-empty line that's not a blockquote)
      paragraphs.push(line.trim());
    }
    
    // Process links separately to handle multiple links per line
    if (linkMatches.length > 0) {
      linkMatches.forEach(match => {
        links.push({ text: match[1], href: match[2] });
      });
    }
  });
  
  // Check for single H1
  const h1Count = headings.filter(h => h.level === 1).length;
  const hasSingleH1 = h1Count === 1;
  
  // Check heading hierarchy
  let hasLogicalHierarchy = true;
  let previousLevel = 0;
  
  for (const heading of headings) {
    // A heading can be at most one level deeper than the previous heading
    if (heading.level > previousLevel + 1) {
      hasLogicalHierarchy = false;
      break;
    }
    previousLevel = heading.level;
  }
  
  // Create metadata object
  const metadata = {
    wordCount: content.split(/\s+/).filter(Boolean).length,
    characterCount: content.length
  };
  
  // Create and return the complete document structure
  return {
    hasSingleH1,
    hasLogicalHierarchy,
    headings,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    paragraphs,
    lists,
    images,
    links,
    metadata
  };
};
