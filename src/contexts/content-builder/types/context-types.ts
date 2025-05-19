
import { ContentBuilderState } from './state-types';
import { ContentBuilderAction } from './action-types';
import { ContentType, ContentFormat, ContentIntent } from './content-types';
import { OutlineSection } from './outline-types';
import { ContentCluster } from './cluster-types';
import { Solution } from './solution-types';
import { SeoImprovement } from './seo-types';
import { SerpData } from './serp-types';

export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Navigation actions
  navigateToStep: (step: number) => void;
  
  // Keyword actions
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  selectCluster: (cluster: ContentCluster | null) => void;
  
  // Content type actions
  setContentType: (contentType: ContentType) => void;
  setContentFormat: (format: ContentFormat) => void;
  setContentIntent: (intent: ContentIntent) => void;
  
  // SERP actions
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  
  // Content actions
  setOutline: (outline: string[]) => void;
  setOutlineSections: (sections: OutlineSection[]) => void;
  setContent: (content: string) => void;
  updateContent: (content: string) => void;
  generateContent: (outline: OutlineSection[]) => Promise<void>;
  saveContent: (options: { title: string; content: string }) => Promise<boolean>;
  setAdditionalInstructions: (instructions: string) => void;
  setContentTitle: (title: string) => void;
  setSuggestedTitles: (titles: string[]) => void;
  setMetaTitle: (title: string) => void;
  setMetaDescription: (description: string) => void;
  
  // SEO actions
  setSeoScore: (score: number) => void;
  addSeoImprovement: (improvement: SeoImprovement) => void;
  applySeoImprovement: (id: string) => void;
  skipOptimization: () => void;
  setSolutionIntegrationMetrics: (metrics: any) => void;
  
  // Solution actions
  selectSolution: (solution: Solution | null) => void;
}
