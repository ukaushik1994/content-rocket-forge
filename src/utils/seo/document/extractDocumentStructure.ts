
import { DocumentHeading, DocumentStructure } from '@/contexts/content-builder/types';

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
  const h1Matches = [...content.matchAll(h1Regex)].map(match => ({
    text: match[1],
    level: 'h1' as const
  }));
  
  const h2Matches = [...content.matchAll(h2Regex)].map(match => ({
    text: match[1],
    level: 'h2' as const
  }));
  
  const h3Matches = [...content.matchAll(h3Regex)].map(match => ({
    text: match[1],
    level: 'h3' as const
  }));
  
  const h4Matches = [...content.matchAll(h4Regex)].map(match => ({
    text: match[1],
    level: 'h4' as const
  }));
  
  const h5Matches = [...content.matchAll(h5Regex)].map(match => ({
    text: match[1],
    level: 'h5' as const
  }));
  
  const h6Matches = [...content.matchAll(h6Regex)].map(match => ({
    text: match[1],
    level: 'h6' as const
  }));
  
  // Build headings array
  const headings = [
    ...h1Matches,
    ...h2Matches,
    ...h3Matches,
    ...h4Matches,
    ...h5Matches,
    ...h6Matches
  ].sort((a, b) => {
    const aPos = content.indexOf(`${'#'.repeat(a.level.charAt(1) as unknown as number)} ${a.text}`);
    const bPos = content.indexOf(`${'#'.repeat(b.level.charAt(1) as unknown as number)} ${b.text}`);
    return aPos - bPos;
  });
  
  // Extract paragraphs
  const paragraphs = [...content.matchAll(paragraphRegex)]
    .map(match => match[1])
    .filter(text => text.trim().length > 0)
    .length;
  
  // Extract lists
  const listItems = [...content.matchAll(listItemRegex)].map(match => match[1]);
  const numberedListItems = [...content.matchAll(numberedListItemRegex)].map(match => match[1]);
  
  // Calculate lists count
  const lists = listItems.length + numberedListItems.length;
  
  // Extract images
  const images = [...content.matchAll(imageRegex)].length;
  
  // Extract links
  const links = [...content.matchAll(linkRegex)].length;
  
  // Calculate metadata
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  
  // Check if document has a single H1
  const hasSingleH1 = h1Matches.length === 1;
  
  // Check if document has logical heading hierarchy
  let hasLogicalHierarchy = true;
  let currentLevel = 1;
  
  for (const heading of headings) {
    const headingLevel = parseInt(heading.level.charAt(1));
    if (headingLevel > currentLevel + 1) {
      hasLogicalHierarchy = false;
      break;
    }
    currentLevel = Math.max(currentLevel, headingLevel);
  }
  
  // Reading time estimation (average reading speed: 200 words per minute)
  const readingTime = Math.ceil(wordCount / 200);
  
  return {
    headings,
    paragraphs,
    images,
    lists,
    links,
    totalWords: wordCount,
    readingTime,
    hasSingleH1,
    hasLogicalHierarchy,
    h1: h1Matches,
    h2: h2Matches,
    h3: h3Matches,
    h4: h4Matches,
    h5: h5Matches,
    h6: h6Matches,
    metadata: {
      wordCount,
      characterCount: content.length
    }
  };
};
