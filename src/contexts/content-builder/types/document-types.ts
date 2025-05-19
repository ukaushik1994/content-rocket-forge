
// Document-related type definitions

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

export interface DocumentAnalysis {
  wordCount: number;
  headingDistribution: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
  };
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface DocumentStructure {
  title?: string;
  headings?: {
    level: number;
    text: string;
    position: number;
  }[];
  paragraphs?: number | any[];
  lists?: any[] | number;
  tables?: number;
  images?: number | any[];
  links?: any[];
  metadata?: {
    wordCount: number;
    characterCount: number;
  };
  // Properties used in the components
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
}
