
export interface DocumentStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  paragraphs: number;
  lists: number;
  images: number;
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
}

export interface DocumentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  structure: DocumentStructure;
}
