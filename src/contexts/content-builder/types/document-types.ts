
export interface DocumentStructure {
  h1: string[]; 
  h2: string[];
  h3: string[];
  h4: string[];
  paragraphs: number | { text: string }[]; // Support both number and array
  lists: number | { type: string; items: string[] }[]; // Support both number and array
  images: number | { alt: string; src: string }[]; // Support both number and array
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
}

export interface DocumentAnalysis {
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  structure: DocumentStructure;
}
