
export interface Solution {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  benefits: string[];
  useCases?: string[];
  websiteUrl?: string;
  logoUrl?: string;
  externalUrl?: string; 
  resources?: any[];
  painPoints?: string[];
  targetAudience?: string[];
  pricing?: {
    model: string;
    startingPrice?: string;
    hasFreeVersion?: boolean;
  };
}
