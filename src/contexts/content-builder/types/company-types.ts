
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
  accentColor?: string | null;
  neutralColor?: string | null;
  fontFamily: string;
  secondaryFontFamily?: string | null;
  tone: string[];
  keywords: string[];
  brandPersonality?: string | null;
  missionStatement?: string | null;
  doUse: string[];
  dontUse: string[];
  logoUsageNotes: string;
  imageryGuidelines?: string | null;
  targetAudience?: string | null;
  brandStory?: string | null;
  brandValues?: string | null;
  brandAssetsUrl: string | null;
}
