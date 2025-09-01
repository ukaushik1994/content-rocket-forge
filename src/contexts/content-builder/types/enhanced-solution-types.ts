
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

export interface MarketData {
  size?: string;
  growthRate?: string;
  geographicAvailability?: string[];
  complianceRequirements?: string[];
}

export interface CompetitorInfo {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: string;
  pricing?: string;
}

export interface TechnicalSpecs {
  systemRequirements?: string[];
  supportedPlatforms?: string[];
  apiCapabilities?: string[];
  securityFeatures?: string[];
  performanceMetrics?: string[];
  uptimeGuarantee?: string;
}

export interface PricingModel {
  model: 'subscription' | 'one-time' | 'usage-based' | 'freemium' | 'enterprise' | 'custom';
  startingPrice?: string;
  tiers: Array<{
    name: string;
    price: string;
    features: string[];
    limitations?: string[];
  }>;
  customPricing?: boolean;
  freeTrialDuration?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics?: Array<{
    label: string;
    value: string;
    improvement?: string;
  }>;
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
}

export interface SolutionMetrics {
  adoptionRate?: string;
  customerSatisfaction?: string;
  roi?: string;
  implementationTime?: string;
  supportResponse?: string;
  usageAnalytics?: Array<{
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export type PersonaCategory = 'end_user' | 'decision_maker' | 'influencer';

export interface SolutionPersona {
  id: string;
  solutionId: string;
  personaCategory: PersonaCategory;
  personaName: string;
  roleTitle: string;
  typicalGoals: string[];
  painPoints: string[];
  preferredTone: string;
  keyTopics: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
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
  
  // Enhanced data fields
  marketData?: MarketData;
  competitors?: CompetitorInfo[];
  technicalSpecs?: TechnicalSpecs;
  pricing?: PricingModel;
  caseStudies?: CaseStudy[];
  metrics?: SolutionMetrics;
  
  // Positioning & differentiation
  uniqueValuePropositions?: string[];
  positioningStatement?: string;
  keyDifferentiators?: string[];
  
  // User personas
  personas?: SolutionPersona[];
  
  metadata?: {
    websiteTitle?: string;
    websiteDescription?: string;
    favicon?: string;
    lastUpdated?: string;
    completeness?: number;
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

export const PERSONA_CATEGORIES: Array<{
  value: PersonaCategory;
  label: string;
  icon: string;
  description: string;
  examples: string[];
}> = [
  { 
    value: 'end_user', 
    label: 'End User', 
    icon: 'User', 
    description: 'Direct users of the solution',
    examples: ['Developers', 'Marketing Managers', 'Sales Reps', 'Content Creators']
  },
  { 
    value: 'decision_maker', 
    label: 'Decision Maker', 
    icon: 'Crown', 
    description: 'Key decision makers and budget holders',
    examples: ['CTOs', 'VPs', 'Directors', 'CEOs']
  },
  { 
    value: 'influencer', 
    label: 'Influencer', 
    icon: 'Users', 
    description: 'Technical influencers and advisors',
    examples: ['Tech Leads', 'Architects', 'Consultants', 'Analysts']
  }
];
