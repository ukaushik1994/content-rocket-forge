import { ContentBuilderState, ContentBuilderAction, OutlineSection } from './types';

export const contentBuilderReducer = (
  state: ContentBuilderState,
  action: ContentBuilderAction
): ContentBuilderState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        activeStep: action.payload,
        steps: state.steps.map((step, index) => 
          index === action.payload ? { ...step, visited: true } : step
        )
      };
      
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          step.id === action.payload ? { ...step, completed: true } : step
        )
      };
      
    case 'MARK_STEP_VISITED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          step.id === action.payload ? { ...step, visited: true } : step
        )
      };
      
    case 'MARK_STEP_ANALYZED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          step.id === action.payload ? { ...step, analyzed: true } : step
        )
      };
      
    case 'SKIP_OPTIMIZATION_STEP':
      return {
        ...state,
        optimizationSkipped: true
      };
      
    case 'SET_MAIN_KEYWORD':
      return {
        ...state,
        mainKeyword: action.payload
      };
      
    case 'ADD_SEARCHED_KEYWORD':
      if (state.searchedKeywords.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        searchedKeywords: [...state.searchedKeywords, action.payload]
      };
      
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
      
      // Check if this item already exists in serpSelections
      const existingItemIndex = state.serpSelections.findIndex(
        item => item.type === type && item.content === content
      );
      
      let updatedSelections;
      
      if (existingItemIndex >= 0) {
        // Item exists, toggle its selection state
        updatedSelections = [...state.serpSelections];
        updatedSelections[existingItemIndex] = {
          ...updatedSelections[existingItemIndex],
          selected: !updatedSelections[existingItemIndex].selected
        };
        
        // If deselected, remove it from the list
        if (!updatedSelections[existingItemIndex].selected) {
          updatedSelections = updatedSelections.filter((_, i) => i !== existingItemIndex);
        }
      } else {
        // Item doesn't exist, add it as selected
        updatedSelections = [
          ...state.serpSelections,
          { type, content, selected: true }
        ];
      }
      
      return {
        ...state,
        serpSelections: updatedSelections
      };
    }
      
    case 'SET_OUTLINE':
      // Convert OutlineSection[] to string[] if needed
      const outlineValue = Array.isArray(action.payload) && action.payload.length > 0 && 
        typeof action.payload[0] !== 'string' 
          ? (action.payload as OutlineSection[]).map(section => section.title) 
          : action.payload;
          
      return {
        ...state,
        outline: outlineValue as string[]
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
        isSaving: action.payload
      };
      
    case 'ADD_KEYWORD':
      if (state.selectedKeywords.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedKeywords: [...state.selectedKeywords, action.payload]
      };
      
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
      
    case 'APPLY_SEO_IMPROVEMENT':
      return {
        ...state,
        seoImprovements: state.seoImprovements.map(improvement => 
          improvement.id === action.payload 
            ? { ...improvement, applied: true } 
            : improvement
        )
      };
      
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

    case 'SET_DOCUMENT_STRUCTURE':
      return {
        ...state,
        documentStructure: action.payload
      };

    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return {
        ...state,
        solutionIntegrationMetrics: action.payload
      };

    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return {
        ...state,
        additionalInstructions: action.payload
      };
      
    default:
      return state;
  }
};
