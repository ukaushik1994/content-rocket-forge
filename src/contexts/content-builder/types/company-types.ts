
/**
 * Company-related type definitions
 */

export interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  industry: string;
  founded: string;
  size: string;
  mission: string;
  values: string[];
  website: string | null;
  logoUrl: string | null;
}

export interface BrandGuidelines {
  id: string;
  companyId: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  tone: string[];
  keywords: string[];
  doUse: string[];
  dontUse: string[];
  logoUsageNotes: string;
  brandAssetsUrl: string | null;
}

