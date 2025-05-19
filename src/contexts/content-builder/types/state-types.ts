
import { SerpData, SerpAnalysisState } from './serp-types';
import { Cluster, KeywordGroup } from './cluster-types';
import { Solution } from './solution-types';
import { OutlineSection } from './outline-types';
import { Document, DocumentAnalysis } from './document-types';
import { SolutionIntegrationMetrics } from './seo-types';

export interface ContentBuilderState {
  activeStep: number;
  completedSteps: number[];
  mainKeyword: string;
  selectedKeywords: string[];
  keywordClusters: Cluster[];
  serpData: SerpData | null;
  serpAnalysisState: SerpAnalysisState;
  outline: OutlineSection[];
  additionalInstructions: string;
  selectedSolution: Solution | null;
  content: string;
  contentTitle: string | null;
  contentDocument: Document | null;
  documentAnalysis: DocumentAnalysis | null;
  metaTitle: string | null;
  metaDescription: string | null;
  slugOverride: string | null;
  solutionIntegrationMetrics: SolutionIntegrationMetrics | null;
  savedDraftId: string | null;
  wordCountLimit: number | null;
}
