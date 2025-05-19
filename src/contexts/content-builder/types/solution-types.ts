
export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  benefits: string[]; // Required field
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  category: string;
  logoUrl: string | null;
  externalUrl: string | null;
  resources?: Array<{
    title: string;
    url: string;
  }>;
}
