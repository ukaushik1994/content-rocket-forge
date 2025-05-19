
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
  pricing?: {
    model: string;
    startingPrice?: string;
    hasFreeVersion?: boolean;
  };
}
