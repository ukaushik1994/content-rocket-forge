
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
  title: string;
  headings: {
    level: number;
    text: string;
    position: number;
  }[];
  paragraphs: number;
  lists: number;
  tables: number;
  images: number;
}
