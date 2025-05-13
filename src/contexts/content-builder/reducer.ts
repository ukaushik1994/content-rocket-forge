
import { ContentBuilderState, ContentBuilderAction } from './types';
import { v4 as uuid } from 'uuid';

/**
 * Main reducer for the Content Builder
 */
export const contentBuilderReducer = (
  state: ContentBuilderState, 
  action: ContentBuilderAction
): ContentBuilderState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        // Mark the step as visited once navigated to it
        steps: state.steps.map((step, index) => 
          index === action.payload 
            ? { ...step, visited: true } 
            : step
        )
      };
      
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === action.payload 
            ? { ...step, completed: true, visited: true } 
            : step
        )
      };
      
    case 'MARK_STEP_VISITED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === action.payload 
            ? { ...step, visited: true } 
            : step
        )
      };
      
    case 'MARK_STEP_ANALYZED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === action.payload 
            ? { ...step, analyzed: true } 
            : step
        )
      };
      
    case 'SKIP_OPTIMIZATION_STEP':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === 5 
            ? { ...step, completed: true, visited: true } 
            : step
        )
      };
      
    case 'SET_MAIN_KEYWORD':
      return {
        ...state,
        mainKeyword: action.payload
      };
      
    case 'ADD_SEARCHED_KEYWORD':
      // Only add if the keyword doesn't already exist in the list
      if (!state.searchedKeywords.includes(action.payload)) {
        return {
          ...state,
          searchedKeywords: [action.payload, ...state.searchedKeywords].slice(0, 10)  // Keep most recent 10
        };
      }
      return state;
      
    case 'SET_SERP_DATA':
      return {
        ...state,
        serpData: action.payload
      };
      
    case 'SET_IS_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.payload
      };
      
    case 'TOGGLE_SERP_SELECTION': {
      const { type, content } = action.payload;
      
      // Check if this item already exists in selections
      const existingIndex = state.serpSelections.findIndex(
        item => item.type === type && item.content === content
      );
      
      let updatedSelections;
      
      if (existingIndex >= 0) {
        // Item exists, toggle its selection state
        updatedSelections = [...state.serpSelections];
        updatedSelections[existingIndex] = {
          ...updatedSelections[existingIndex],
          selected: !updatedSelections[existingIndex].selected
        };
      } else {
        // Item doesn't exist, add it as selected
        updatedSelections = [
          ...state.serpSelections,
          {
            id: uuid(),
            type,
            content,
            selected: true,
            timestamp: new Date().toISOString()
          }
        ];
      }
      
      return {
        ...state,
        serpSelections: updatedSelections
      };
    }
      
    case 'SET_OUTLINE':
      return {
        ...state,
        outline: action.payload
      };
      
    case 'SET_OUTLINE_SECTIONS':
      return {
        ...state,
        outlineSections: action.payload
      };
      
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.payload
      };
      
    case 'SET_IS_GENERATING':
      return {
        ...state,
        isGenerating: action.payload
      };
      
    case 'SET_IS_SAVING':
      return {
        ...state,
        isSavingData: action.payload
      };
      
    case 'ADD_KEYWORD':
      // Only add if not already present
      if (!state.selectedKeywords.includes(action.payload)) {
        return {
          ...state,
          selectedKeywords: [...state.selectedKeywords, action.payload]
        };
      }
      return state;
      
    case 'REMOVE_KEYWORD':
      return {
        ...state,
        selectedKeywords: state.selectedKeywords.filter(kw => kw !== action.payload)
      };
      
    case 'SELECT_CLUSTER':
      return {
        ...state,
        selectedCluster: action.payload
      };
      
    case 'SET_CONTENT_TITLE':
      return {
        ...state,
        contentTitle: action.payload
      };
      
    case 'SET_SUGGESTED_TITLES':
      return {
        ...state,
        suggestedTitles: action.payload
      };
      
    case 'SET_SEO_SCORE':
      return {
        ...state,
        seoScore: action.payload
      };
      
    case 'ADD_SEO_IMPROVEMENT':
      return {
        ...state,
        seoImprovements: [...state.seoImprovements, action.payload]
      };
      
    case 'SET_SEO_IMPROVEMENTS':
      return {
        ...state,
        seoImprovements: action.payload
      };
      
    case 'APPLY_SEO_IMPROVEMENT': {
      const id = action.payload;
      return {
        ...state,
        seoImprovements: state.seoImprovements.map(improvement =>
          improvement.id === id 
            ? { ...improvement, applied: true }
            : improvement
        )
      };
    }
      
    case 'SET_CONTENT_TYPE':
      return {
        ...state,
        contentType: action.payload
      };
      
    case 'SET_CONTENT_FORMAT':
      return {
        ...state,
        contentFormat: action.payload
      };
      
    case 'SET_CONTENT_INTENT':
      return {
        ...state,
        contentIntent: action.payload
      };
      
    case 'SELECT_SOLUTION':
      return {
        ...state,
        selectedSolution: action.payload
      };
      
    case 'SET_META_TITLE':
      return {
        ...state,
        metaTitle: action.payload
      };
      
    case 'SET_META_DESCRIPTION':
      return {
        ...state,
        metaDescription: action.payload
      };
      
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return {
        ...state,
        additionalInstructions: action.payload
      };
      
    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return {
        ...state,
        solutionIntegrationMetrics: action.payload
      };
      
    case 'SET_SELECTED_REGIONS':
      return {
        ...state,
        selectedRegions: action.payload
      };
      
    default:
      return state;
  }
};
