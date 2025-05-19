
export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  created: Date;
  updated: Date;
  tags?: string[];
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  created: Date;
  metrics: {
    readability: number;
    wordCount: number;
    keywordDensity: number;
    sentenceLength: number;
    paragraphCount: number;
  };
}

export interface DocumentStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5?: string[];
  h6?: string[];
  paragraphs?: number;
  images?: number;
  lists?: number;
  tables?: number;
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  readabilityScore?: number;
  wordCount?: number;
}
