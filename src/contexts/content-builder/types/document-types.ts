
export interface DocumentHeading {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtext?: string;
  type?: string;
}

export interface DocumentStructure {
  // Original properties
  headings: DocumentHeading[];
  paragraphs: number;
  images?: number;
  lists?: number;
  tables?: number;
  links?: number;
  totalWords?: number;
  readingTime?: number;
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  
  // Add properties used in DocumentStructureCard and DocumentStructureAnalysis
  h1?: DocumentHeading[];
  h2?: DocumentHeading[];
  h3?: DocumentHeading[];
  h4?: DocumentHeading[];
  h5?: DocumentHeading[];
  h6?: DocumentHeading[];
  
  // Additional metadata properties used in extractDocumentStructure
  metadata?: {
    wordCount: number;
    characterCount: number;
  }
}
