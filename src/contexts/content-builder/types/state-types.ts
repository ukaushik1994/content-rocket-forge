
/**
 * State-related type definitions 
 */

import { ContentBuilderStep } from './step-types';
import { SerpSelection } from './serp-types';
import { ContentType, ContentFormat, ContentIntent } from './content-types';
import { Solution, SolutionIntegrationMetrics } from './solution-types';
import { OutlineSection } from './outline-types';
import { SeoImprovement } from './seo-types';
import { ContentCluster } from './cluster-types';
import { DocumentStructure } from './document-types';

// Content Builder State
export interface ContentBuilderState {
  // Navigation
  activeStep: number;
  steps: ContentBuilderStep[];
  
  // Keywords
  mainKeyword: string;
  selectedKeywords: string[];
  searchedKeywords: string[];
  
  // Content Type
  contentType: ContentType;
  contentFormat: ContentFormat;
  contentIntent: ContentIntent;
  
  // Solutions
  selectedSolution: Solution | null;
  
  // Titles
  contentTitle: string;
  suggestedTitles: string[];
  
  // SERP Data
  serpData: any;
  serpSelections: SerpSelection[];
  isAnalyzing: boolean;
  
  // Outline
  outline: string[];
  outlineSections: OutlineSection[];
  
  // Content
  content: string;
  isGenerating: boolean;
  isSaving: boolean;
  
  // SEO
  seoScore: number;
  seoImprovements: SeoImprovement[];
  optimizationSkipped: boolean; // New field to track if optimization was skipped
  
  // Selected Cluster
  selectedCluster: ContentCluster | null;

  // Meta Information
  metaTitle: string | null;
  metaDescription: string | null;

  // Document Structure
  documentStructure: DocumentStructure | null;

  // Solution Integration
  solutionIntegrationMetrics: SolutionIntegrationMetrics | null;

  // Additional Instructions
  additionalInstructions: string;
}
