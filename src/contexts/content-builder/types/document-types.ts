
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
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5?: number;
  h6?: number;
  paragraphs?: number;
  images?: number;
  lists?: number;
  tables?: number;
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
  readabilityScore?: number;
  wordCount?: number;
}
