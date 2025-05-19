
export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  content?: string;
  expand?: boolean;
}

export interface OutlineGenerationParams {
  mainKeyword: string;
  secondaryKeywords?: string[];
  contentType?: string;
  competitorHeadings?: string[];
  serpQuestions?: string[];
  customInstructions?: string;
}
