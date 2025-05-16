
/**
 * Document structure type definitions
 */

export interface DocumentHeading {
  level: number;
  text: string;
}

export interface DocumentParagraph {
  text: string;
}

export interface DocumentList {
  type: string;
  items: string[];
}

export interface DocumentImage {
  src: string;
  alt: string;
}

export interface DocumentLink {
  href: string;
  url: string;
  text: string;
}

export interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
}

export interface DocumentStructure {
  // Basic counts
  totalWordCount?: number;
  paragraphCount?: number;
  sentenceCount?: number;
  
  // Readability metrics
  readability?: {
    score: number;
    level: string;
  };
  
  // Heading counts
  headingCounts?: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    h5?: number;
    h6?: number;
  };
  
  // Heading content arrays
  h1?: string[];
  h2?: string[];
  h3?: string[];
  h4?: string[];
  h5?: string[];
  h6?: string[];
  
  // Structure validation flags
  hasSingleH1?: boolean;
  hasLogicalHierarchy?: boolean;
  hasIntroduction?: boolean;
  hasConclusion?: boolean;
  hasFAQSection?: boolean;
  
  // Content elements
  headings?: DocumentHeading[];
  paragraphs?: DocumentParagraph[];
  lists?: DocumentList[];
  images?: DocumentImage[];
  links?: DocumentLink[];
  metadata?: DocumentMetadata;
}
