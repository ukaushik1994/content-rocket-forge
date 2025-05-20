
/**
 * SERP-related type definitions
 */

export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
  metadata?: any;
}

export type SerpProvider = 'serpapi' | 'dataforseo' | 'mock';

export interface SerpProviderConfig {
  id: SerpProvider;
  name: string;
  description: string;
  requiresKey: boolean;
  isPrimary?: boolean;
}

export const SERP_PROVIDERS: SerpProviderConfig[] = [
  {
    id: 'serpapi',
    name: 'SERP API',
    description: 'Provides search engine results data',
    requiresKey: true,
    isPrimary: true
  },
  {
    id: 'dataforseo',
    name: 'DataForSEO',
    description: 'Enterprise SEO data platform',
    requiresKey: true
  },
  {
    id: 'mock',
    name: 'Mock Data',
    description: 'For testing purposes only',
    requiresKey: false
  }
];
