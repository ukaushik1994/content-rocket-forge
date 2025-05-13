
export interface DocumentHeading {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtext?: string;
  type?: string;
}

export interface DocumentStructure {
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
}
