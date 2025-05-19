
import { DocumentStructure } from "@/contexts/content-builder/types/document-types";

export const extractDocumentStructure = (content: string): DocumentStructure => {
  // Find all h1, h2, h3, h4 tags
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>|# (.*?)(?:\n|$)/g;
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>|## (.*?)(?:\n|$)/g;
  const h3Regex = /<h3[^>]*>(.*?)<\/h3>|### (.*?)(?:\n|$)/g;
  const h4Regex = /<h4[^>]*>(.*?)<\/h4>|#### (.*?)(?:\n|$)/g;
  
  // Find paragraphs, lists, and images
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>|(?:^|\n)([^#<>\n].+?)(?:\n|$)/g;
  const listItemRegex = /<li[^>]*>(.*?)<\/li>|\n[\s-]*([^\n]+)/g;
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
  
  // Extract headings
  const h1 = extractMatches(content, h1Regex);
  const h2 = extractMatches(content, h2Regex);
  const h3 = extractMatches(content, h3Regex);
  const h4 = extractMatches(content, h4Regex);
  
  // Count paragraphs, lists, and images
  const paragraphs = (content.match(paragraphRegex) || []).length;
  const listItems = (content.match(listItemRegex) || []).length;
  const images = (content.match(imgRegex) || []).length;
  
  // Check for logical hierarchy
  const hasSingleH1 = h1.length === 1;
  const hasLogicalHierarchy = checkLogicalHierarchy(h1, h2, h3, h4);
  
  return {
    h1,
    h2,
    h3,
    h4,
    paragraphs,
    lists: listItems,
    images,
    hasSingleH1,
    hasLogicalHierarchy
  };
};

const extractMatches = (content: string, regex: RegExp): string[] => {
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    // The first capture group is for HTML tags, the second for markdown
    const heading = match[1] || match[2];
    if (heading && heading.trim()) {
      matches.push(heading.trim());
    }
  }
  
  return matches;
};

const checkLogicalHierarchy = (h1: string[], h2: string[], h3: string[], h4: string[]): boolean => {
  // If there are no headings, hierarchy is considered valid
  if (h1.length + h2.length + h3.length + h4.length === 0) {
    return true;
  }
  
  // H1 should exist if any other headings exist
  if (h1.length === 0 && (h2.length > 0 || h3.length > 0 || h4.length > 0)) {
    return false;
  }
  
  // H3 should not exist without H2
  if (h2.length === 0 && h3.length > 0) {
    return false;
  }
  
  // H4 should not exist without H3
  if (h3.length === 0 && h4.length > 0) {
    return false;
  }
  
  return true;
};
