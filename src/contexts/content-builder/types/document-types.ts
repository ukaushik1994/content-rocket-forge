
/**
 * Document-related type definitions
 */

export interface DocumentHeading {
  id: string;
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  position: number;
  content?: string;
}

export interface DocumentStructure {
  h1: DocumentHeading[];
  h2: DocumentHeading[];
  h3: DocumentHeading[];
  h4: DocumentHeading[];
  h5: DocumentHeading[];
  h6: DocumentHeading[];
  paragraphs: any[];
  images: any[];
  links: any[];
  lists: any[];
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  wordCount: number;
  readingTime: number;
  headings: DocumentHeading[];
}
