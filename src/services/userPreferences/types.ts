
export interface PromptTemplate {
  id: string;
  name: string;
  formatType: string; // e.g., 'blog', 'social-twitter', etc.
  description?: string;
  promptTemplate: string;
  structureTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandGuidelines {
  brandName: string;
  brandTone: string;
  targetAudience: string;
  keyValues: string[];
  doGuidelines: string[];
  dontGuidelines: string[];
  companyDescription?: string;
  updatedAt: Date;
}

export interface UserPreferences {
  defaultAiProvider?: 'openai' | 'anthropic' | 'gemini';
  enableAiFallback?: boolean;
  promptTemplates?: PromptTemplate[];
  brandGuidelines?: BrandGuidelines;
  // We can add more user preferences here in the future
}
