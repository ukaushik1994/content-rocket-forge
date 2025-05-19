
export interface Solution {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  benefits: string[] | string; // Make benefits optional or string for flexibility
  useCases?: string[];
  websiteUrl?: string;
  logoUrl?: string | null;
  externalUrl?: string | null; 
  resources?: any[];
  painPoints?: string[];
  targetAudience?: string[];
  pricing?: {
    model: string;
    startingPrice?: string;
    hasFreeVersion?: boolean;
  };
}
