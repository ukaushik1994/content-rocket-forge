
import React from 'react';
import { ContentBuilderState } from './state-types';
import { ContentBuilderAction } from './action-types';
import { ContentCluster } from './cluster-types';
import { OutlineSection } from './outline-types';

export interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  
  // Navigation actions
  navigateToStep: (step: number) => void;
  goToStep: (stepIndex: number) => void;
  prevStep: () => void;
  nextStep: () => void;
  
  // Keywords actions
  setMainKeyword: (keyword: string) => void;
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  selectCluster: (cluster: ContentCluster | null) => void;
  
  // SERP analysis actions
  analyzeKeyword: (keyword: string, regions?: string[]) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  setSelectedRegions: (regions: string[]) => void;
  
  // Outline actions
  addOutlineSection: (title: string, level: number) => void;
  updateOutlineSection: (sectionId: string, title: string, level: number) => void;
  removeOutlineSection: (sectionId: string) => void;
  reorderOutlineSections: (sections: OutlineSection[]) => void;
  setOutline: (outline: string[]) => void;
  setOutlineSections: (sections: OutlineSection[]) => void;
  
  // Content actions
  generateContent: () => Promise<void>;
  updateContent: (content: string) => void;
  setContent: (content: string) => void;
  setContentTitle: (title: string) => void;
  
  // Settings actions
  setContentType: (type: string) => void;
  setContentFormat: (format: string) => void;
  setContentIntent: (intent: string) => void;
  
  // SEO actions
  setSeoScore: (score: number) => void;
  updateMetaTitle: (title: string) => void;
  updateMetaDescription: (description: string) => void;
  setMetaTitle: (title: string) => void;
  setMetaDescription: (description: string) => void;
  
  // Review actions
  updateAdditionalInstructions: (instructions: string) => void;
  setAdditionalInstructions: (instructions: string) => void;
}
