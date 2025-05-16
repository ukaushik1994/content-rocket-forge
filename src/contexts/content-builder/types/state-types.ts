
import { ContentFormat, ContentIntent, ContentType } from './content-types';
import { ContentCluster } from './cluster-types';
import { Solution, SolutionIntegrationMetrics } from './solution-types';
import { SeoImprovement } from './seo-types';
import { OutlineSection } from './outline-types';
import { DocumentStructure } from './document-types';
import { SerpSelection } from './serp-types';
import { Step } from './step-types';

export interface ContentBuilderState {
  steps: Step[];
  currentStep: number;
  activeStep?: number;
  mainKeyword: string;
  searchedKeywords: string[];
  selectedKeywords: string[];
  selectedCluster: ContentCluster | null;
  serpData: any;
  serpSelections: SerpSelection[];
  isAnalyzing: boolean;
  outline: string[];
  outlineSections: OutlineSection[];
  content: string;
  isGenerating: boolean;
  isSavingData: boolean;
  contentTitle: string;
  suggestedTitles: string[];
  seoScore: number;
  seoImprovements: SeoImprovement[];
  contentType: ContentType;
  contentFormat: ContentFormat;
  contentIntent: ContentIntent;
  selectedSolution: Solution | null;
  metaTitle: string;
  metaDescription: string;
  documentStructure: DocumentStructure;
  solutionIntegrationMetrics: SolutionIntegrationMetrics;
  additionalInstructions: string;
  selectedRegions: string[];
}
