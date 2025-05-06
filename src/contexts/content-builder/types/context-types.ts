
/**
 * Context-related type definitions
 */

import { ContentBuilderState } from './state-types';
import { ContentBuilderAction } from './action-types';
import { ContentType, ContentFormat, ContentIntent, SaveContentParams } from './content-types';
import { Solution } from './solution-types';
import { OutlineSection } from './outline-types';

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
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  
  // Content Actions
  setContentTitle: (title: string) => void;
  setContentType: (type: ContentType) => void;
  setContentFormat: (format: ContentFormat) => void;
  setContentIntent: (intent: ContentIntent) => void;
  generateContent: (outline: OutlineSection[]) => Promise<void>;
  saveContent: (options: { title: string; content: string }) => Promise<void>;
  setContent: (content: string) => void;
  
  // Meta Actions
  setMetaTitle: (title: string) => void;
  setMetaDescription: (description: string) => void;
  
  // SEO Actions
  analyzeSeo: (content: string) => Promise<void>;
  applySeoImprovement: (id: string) => void;
  skipOptimizationStep: () => void;

  // Advanced Content Actions
  saveContentToDraft: (options: SaveContentParams) => Promise<string | null>;
  saveContentToPublished: (options: SaveContentParams) => Promise<string | null>;
  setAdditionalInstructions: (instructions: string) => void;
}
