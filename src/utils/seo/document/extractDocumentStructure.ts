
import { DocumentStructure } from '@/contexts/content-builder/types';

/**
 * Extracts document structure from content
 */
export const extractDocumentStructure = (content: string): DocumentStructure => {
  // Extract headings
  const h1Regex = /^# (.+)$/gm;
  const h2Regex = /^## (.+)$/gm;
  const h3Regex = /^### (.+)$/gm;
  const h4Regex = /^#### (.+)$/gm;
  const h5Regex = /^##### (.+)$/gm;
  const h6Regex = /^###### (.+)$/gm;
  
  // Extract other elements
  const paragraphRegex = /^(?!#)(.*[a-zA-Z].*)$/gm;
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  const listItemRegex = /^[-*+] (.+)$/gm;
  const numberedListItemRegex = /^\d+\. (.+)$/gm;
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  
  // Extract headings
  const h1 = [...content.matchAll(h1Regex)].map(match => match[1]);
  const h2 = [...content.matchAll(h2Regex)].map(match => match[1]);
  const h3 = [...content.matchAll(h3Regex)].map(match => match[1]);
  const h4 = [...content.matchAll(h4Regex)].map(match => match[1]);
  const h5 = [...content.matchAll(h5Regex)].map(match => match[1]);
  const h6 = [...content.matchAll(h6Regex)].map(match => match[1]);
  
  // Build headings array
  const headings = [
    ...h1.map(text => ({ level: 1, text })),
    ...h2.map(text => ({ level: 2, text })),
    ...h3.map(text => ({ level: 3, text })),
    ...h4.map(text => ({ level: 4, text })),
    ...h5.map(text => ({ level: 5, text })),
    ...h6.map(text => ({ level: 6, text }))
  ].sort((a, b) => {
    const aPos = content.indexOf(`${'#'.repeat(a.level)} ${a.text}`);
    const bPos = content.indexOf(`${'#'.repeat(b.level)} ${b.text}`);
    return aPos - bPos;
  });
  
  // Extract paragraphs
  const paragraphs = [...content.matchAll(paragraphRegex)]
    .map(match => match[1])
    .filter(text => text.trim().length > 0)
    .map(text => ({ text }));
  
  // Extract lists
  const listItems = [...content.matchAll(listItemRegex)].map(match => match[1]);
  const numberedListItems = [...content.matchAll(numberedListItemRegex)].map(match => match[1]);
  
  // Combine lists
  const lists = [
    { type: 'unordered', items: listItems },
    { type: 'ordered', items: numberedListItems }
  ].filter(list => list.items.length > 0);
  
  // Extract images
  const images = [...content.matchAll(imageRegex)].map(match => ({
    alt: match[1],
    src: match[2]
  }));
  
  // Extract links
  const links = [...content.matchAll(linkRegex)].map(match => ({
    text: match[1],
    href: match[2],
    url: match[2]
  }));
  
  // Calculate metadata
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const characterCount = content.length;
  
  // Check if document has a single H1
  const hasSingleH1 = h1.length === 1;
  
  // Check if document has logical heading hierarchy
  let hasLogicalHierarchy = true;
  let currentLevel = 1;
  
  for (const heading of headings) {
    if (heading.level > currentLevel + 1) {
      hasLogicalHierarchy = false;
      break;
    }
    currentLevel = Math.max(currentLevel, heading.level);
  }

  // Create headingCounts object
  const headingCounts = {
    h1: h1.length,
    h2: h2.length,
    h3: h3.length,
    h4: h4.length,
    h5: h5.length,
    h6: h6.length
  };
  
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
    headingCounts,
    paragraphs,
    lists,
    images,
    links,
    metadata: {
      wordCount,
      characterCount
    }
  };
};
