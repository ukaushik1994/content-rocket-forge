
/**
 * Context-related type definitions
 */

import { ContentBuilderState } from './state-types';
import { ContentBuilderAction } from './action-types';
import { ContentType, ContentFormat, ContentIntent, SaveContentParams } from './content-types';
import { Solution } from './solution-types';
import { OutlineSection } from './outline-types';
import { SolutionIntegrationMetrics } from './solution-types';

// Context Type
export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Navigation Actions
  navigateToStep: (step: number) => void;
  
  // Keyword Actions
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  
  // SERP Actions
  analyzeKeyword: (keyword: string, regions?: string[]) => Promise<any>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  
  // Content Actions
  setContentTitle: (title: string) => void;
  setContentType: (type: ContentType) => void;
  setContentFormat: (format: ContentFormat) => void;
  setContentIntent: (intent: ContentIntent) => void;
  generateContent: (outline: OutlineSection[]) => Promise<void>;
  saveContent: (options: { title: string; content: string }) => Promise<boolean>;
  setContent: (content: string) => void;
  updateContent: (content: string) => void;
  setOutline: (outline: string[]) => void;
  setOutlineSections: (sections: OutlineSection[]) => void;
  
  // Meta Actions
  setMetaTitle: (title: string) => void;
  setMetaDescription: (description: string) => void;
  
  // SEO Actions
  analyzeSeo: (content: string) => Promise<void>;
  applySeoImprovement: (id: string) => void;
  skipOptimizationStep: () => void;

  // Solution Actions
  selectSolution: (solution: Solution | null) => void;
  setSolutionIntegrationMetrics: (metrics: SolutionIntegrationMetrics) => void;

  // Advanced Content Actions
  saveContentToDraft: (options: SaveContentParams) => Promise<string | null>;
  saveContentToPublished: (options: SaveContentParams) => Promise<string | null>;
  setAdditionalInstructions: (instructions: string) => void;
  
  // SERP Region Settings
  setSelectedRegions: (regions: string[]) => void;
}
