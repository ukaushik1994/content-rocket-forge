
/**
 * Types for the SERP API adapters
 */

import { SerpAnalysisResult } from "@/types/serp";
import { SerpProvider } from "@/contexts/content-builder/types/serp-types";

export interface SerpApiOptions {
  keyword: string;
  refresh?: boolean;
  limit?: number;
  location?: string;
  language?: string;
  device?: string;
}

export interface SerpApiAdapter {
  provider: SerpProvider;
  analyzeKeyword: (options: SerpApiOptions) => Promise<SerpAnalysisResult>;
  searchKeywords: (options: SerpApiOptions) => Promise<any[]>;
  searchRelatedKeywords: (options: SerpApiOptions) => Promise<string[]>;
  testApiKey: (apiKey: string) => Promise<boolean>;
}

export interface SerpApiResponse {
  success: boolean;
  data: any;
  error?: string;
}

export interface ApiKeyTestResult {
  isValid: boolean;
  provider: SerpProvider;
  message?: string;
}
