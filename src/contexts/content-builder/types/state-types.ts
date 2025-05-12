
/**
 * State-related type definitions
 */

import { Step } from './step-types';
import { SerpSelection } from './serp-types';
import { ContentType, ContentFormat, ContentIntent } from './content-types';
import { ContentCluster } from './cluster-types';
import { Solution, SolutionIntegrationMetrics } from './solution-types';
import { SeoImprovement } from './seo-types';
import { OutlineSection } from './outline-types';

// Content Builder State
export interface ContentBuilderState {
  currentStep: number;
  steps: Step[];
  mainKeyword: string;
  selectedKeywords: string[];
  searchedKeywords: string[];
  serpData: any;
  isAnalyzing: boolean;
  isSavingData: boolean;
  serpSelections: SerpSelection[];
  outline: string[] | OutlineSection[];
  outlineSections: OutlineSection[];
  isGenerating: boolean;
  content: string;
  contentTitle: string;
  suggestedTitles: string[];
  selectedCluster: ContentCluster | null;
  contentType: ContentType;
  contentFormat: ContentFormat;
  contentIntent: ContentIntent;
  selectedSolution: Solution | null;
  seoScore: number;
  seoImprovements: SeoImprovement[];
  metaTitle: string;
  metaDescription: string;
  additionalInstructions: string; 
  solutionIntegrationMetrics: SolutionIntegrationMetrics;
  selectedRegions: string[]; // Add the selectedRegions property
}
