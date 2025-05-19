
import { SerpData, SerpAnalysisState, SerpSelection } from './serp-types';
import { Cluster, KeywordGroup, ContentCluster } from './cluster-types';
import { Solution } from './solution-types';
import { OutlineSection } from './outline-types';
import { Document, DocumentAnalysis, DocumentStructure } from './document-types';
import { SolutionIntegrationMetrics, SeoImprovement } from './seo-types';
import { ContentType, ContentFormat, ContentIntent } from './content-types';

export interface Step {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  visited: boolean;
  analyzed?: boolean;
}

export interface ContentBuilderState {
  // Navigation
  activeStep: number;
  completedSteps: number[];
  steps: Step[];
  
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
  contentTitle: string | null;
  suggestedTitles: string[];
  
  // SERP Data
  serpData: SerpData | null;
  serpSelections: SerpSelection[];
  serpAnalysisState: SerpAnalysisState;
  isAnalyzing: boolean;
  
  // Outline
  outline: OutlineSection[];
  outlineSections: OutlineSection[];
  
  // Content
  content: string;
  isGenerating: boolean;
  isSaving: boolean;
  
  // SEO
  seoScore: number;
  seoImprovements: SeoImprovement[];
  optimizationSkipped: boolean;
  
  // Selected Cluster
  selectedCluster: ContentCluster | null;
  
  // Meta Information
  metaTitle: string | null;
  metaDescription: string | null;
  slugOverride: string | null;
  
  // Document Structure
  documentStructure: DocumentStructure | null;
  
  // Solution Integration
  solutionIntegrationMetrics: SolutionIntegrationMetrics | null;
  
  // Additional Instructions
  additionalInstructions: string;
  
  // Saved Draft
  savedDraftId: string | null;
  wordCountLimit: number | null;
}
