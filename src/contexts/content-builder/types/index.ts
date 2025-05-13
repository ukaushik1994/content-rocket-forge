
// Import and re-export all types
export * from './state-types';
export * from './action-types';
export * from './serp-types';
export * from './cluster-types';
export * from './content-types';
export * from './document-types';

import { ContentBuilderState } from './state-types';
import { ContentBuilderAction } from './action-types';
import { ContentFormat, ContentIntent } from './content-types';
import { OutlineSection } from './document-types';
import { ContentCluster } from './cluster-types';
import { SerpSelection } from './serp-types';

// Context type
export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Navigation
  navigateToStep: (step: number) => void;
  
  // Keyword actions
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  
  // Content actions
  setContentTitle: (title: string) => void;
  setContentType: (type: string) => void;
  setContentFormat: (format: ContentFormat) => void;
  setContentIntent: (intent: ContentIntent) => void;
  setSuggestedTitles: (titles: string[]) => void;
  setContent: (content: string) => void;
  updateContent: (content: string) => void;
  setMetaTitle: (metaTitle: string) => void;
  setMetaDescription: (metaDescription: string) => void;
  
  // Outline actions
  setOutline: (outline: string[]) => void;
  setOutlineSections: (sections: OutlineSection[]) => void;
  addOutlineItem: (index: number) => void;
  removeOutlineItem: (index: number) => void;
  updateOutlineItem: (index: number, updatedItem: string | OutlineSection) => void;
  moveOutlineItem: (fromIndex: number, toIndex: number) => void;
  
  // Cluster actions
  selectCluster: (cluster: ContentCluster | null) => void;
  
  // SERP actions
  analyzeKeyword: (keyword: string, regions?: string[]) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  setSelectedRegions: (regions: string[]) => void;
  
  // Content generation actions
  generateContentRequest: (instructions?: string) => Promise<void>;
  
  // Solution actions
  setSelectedSolution: (solutionId: string | null) => void;
  setContentLeadIn: (leadIn: string) => void;
  
  // Additional instructions actions
  setAdditionalInstructions: (instructions: string) => void;
  
  // SEO actions
  updateSeoScore: (score: number) => void;
  addSeoImprovement: (improvement: any) => void;
  applySeoImprovement: (id: string) => void;
}
