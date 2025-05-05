
import React from 'react';
import { ContentBuilderState, ContentBuilderAction, ContentCluster } from './types';
import { toast } from 'sonner';

export interface ContentBuilderActions {
  navigateToStep: (stepIndex: number) => void;
  analyzeKeyword: (keyword: string) => Promise<void>;
  addContentFromSerp: (content: string, type: string) => void;
  generateOutlineFromSelections: () => void;
  saveContentToDraft: (data: any) => Promise<void>;
  saveContentToPublished: (data: any) => Promise<void>;
}

export const createContentBuilderActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
): ContentBuilderActions => {
  
  const navigateToStep = (stepIndex: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepIndex });
  };
  
  const analyzeKeyword = async (keyword: string) => {
    // Implementation will be in the context file
    console.log("Analyzing keyword:", keyword);
    return Promise.resolve();
  };
  
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({ 
      type: 'TOGGLE_SERP_SELECTION', 
      payload: { type, content } 
    });
  };
  
  const generateOutlineFromSelections = () => {
    // In a real implementation, this would process selections and create an outline
    const basicOutline = [
      "Introduction",
      "Key Points",
      "Main Content Section 1",
      "Main Content Section 2",
      "Conclusion"
    ];
    
    dispatch({ type: 'SET_OUTLINE', payload: basicOutline });
  };
  
  const saveContentToDraft = async (data: any) => {
    console.log("Saving to draft:", data);
    toast.success("Content saved to drafts");
    return Promise.resolve();
  };
  
  const saveContentToPublished = async (data: any) => {
    console.log("Publishing content:", data);
    toast.success("Content published successfully");
    return Promise.resolve();
  };
  
  return {
    navigateToStep,
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    saveContentToDraft,
    saveContentToPublished
  };
};
