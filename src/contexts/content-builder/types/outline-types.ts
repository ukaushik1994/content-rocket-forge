
export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  content?: string;
  expand?: boolean;
  children?: OutlineSection[];
}

export interface OutlineGenerationParams {
  mainKeyword: string;
  secondaryKeywords?: string[];
  contentType?: string;
  competitorHeadings?: string[];
  serpQuestions?: string[];
  customInstructions?: string;
}
