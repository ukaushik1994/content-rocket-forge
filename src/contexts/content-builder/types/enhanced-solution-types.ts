
export type ResourceCategory = 
  | 'documentation' 
  | 'video' 
  | 'tutorial' 
  | 'api' 
  | 'demo' 
  | 'blog' 
  | 'case-study' 
  | 'whitepaper'
  | 'other';

export interface EnhancedSolutionResource {
  id: string;
  title: string;
  url: string;
  category: ResourceCategory;
  description?: string;
  favicon?: string;
  isValidated?: boolean;
  validationStatus?: 'pending' | 'valid' | 'invalid';
  order: number;
}

export interface EnhancedSolution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  category: string;
  logoUrl: string | null;
  externalUrl: string | null;
  resources: EnhancedSolutionResource[];
  tags?: string[];
  shortDescription?: string;
  benefits?: string[];
  integrations?: string[];
  pricing?: {
    model: string;
    startingPrice?: string;
  };
  metadata?: {
    websiteTitle?: string;
    websiteDescription?: string;
    favicon?: string;
  };
}

export const RESOURCE_CATEGORIES: Array<{
  value: ResourceCategory;
  label: string;
  icon: string;
  description: string;
}> = [
  { value: 'documentation', label: 'Documentation', icon: 'Book', description: 'User guides, API docs, help articles' },
  { value: 'video', label: 'Video', icon: 'Video', description: 'Tutorials, demos, webinars' },
  { value: 'tutorial', label: 'Tutorial', icon: 'GraduationCap', description: 'Step-by-step guides' },
  { value: 'api', label: 'API Reference', icon: 'Code', description: 'API documentation and references' },
  { value: 'demo', label: 'Demo', icon: 'Play', description: 'Live demos and sandbox environments' },
  { value: 'blog', label: 'Blog Post', icon: 'FileText', description: 'Articles and blog posts' },
  { value: 'case-study', label: 'Case Study', icon: 'TrendingUp', description: 'Success stories and use cases' },
  { value: 'whitepaper', label: 'Whitepaper', icon: 'FileCheck', description: 'Research papers and whitepapers' },
  { value: 'other', label: 'Other', icon: 'Link', description: 'Other helpful resources' }
];
