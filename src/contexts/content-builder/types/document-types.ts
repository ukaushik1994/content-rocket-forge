
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
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  headings: DocumentHeading[];
  paragraphs: DocumentParagraph[];
  lists: DocumentList[];
  images: DocumentImage[];
  links: DocumentLink[];
  metadata: DocumentMetadata;
}
