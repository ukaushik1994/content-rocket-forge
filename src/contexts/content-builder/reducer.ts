
import { ContentBuilderState, ContentBuilderAction } from './types';
import { initialState } from './initialState';

export const contentBuilderReducer = (
  state: ContentBuilderState,
  action: ContentBuilderAction
): ContentBuilderState => {
  switch (action.type) {
    case 'SET_ACTIVE_STEP':
      return {
        ...state,
        activeStep: action.payload
      };
    
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === action.payload ? { ...step, completed: true } : step
        )
      };

    case 'MARK_STEP_VISITED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === action.payload ? { ...step, visited: true } : step
        )
      };
      
    case 'SET_MAIN_KEYWORD':
      return {
        ...state,
        mainKeyword: action.payload
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
        selectedKeywords: state.selectedKeywords.filter(keyword => keyword !== action.payload)
      };
      
    case 'SET_SELECTED_KEYWORDS':
      return {
        ...state,
        selectedKeywords: action.payload
      };

    case 'SELECT_CLUSTER':
      return {
        ...state,
        selectedCluster: action.payload
      };

    case 'SET_CONTENT_TYPE':
      return {
        ...state,
        contentType: action.payload
      };
      
    case 'SELECT_SOLUTION':
      return {
        ...state,
        selectedSolution: action.payload
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
      
    case 'SET_CONTENT_TITLE':
      return {
        ...state,
        contentTitle: action.payload
      };
      
    case 'SET_IS_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.payload
      };
      
    case 'SET_SERP_DATA':
      return {
        ...state,
        serpData: action.payload
      };
      
    case 'TOGGLE_SERP_SELECTION':
      const { type, content } = action.payload;
      const selectionExists = state.serpSelections.some(
        item => item.type === type && item.content === content
      );
      
      if (selectionExists) {
        // Remove it if it exists
        return {
          ...state,
          serpSelections: state.serpSelections.filter(
            item => !(item.type === type && item.content === content)
          )
        };
      } else {
        // Add it if it doesn't exist
        return {
          ...state,
          serpSelections: [...state.serpSelections, { type, content, selected: true }]
        };
      }
      
    case 'SET_OUTLINE':
      return {
        ...state,
        outline: Array.isArray(action.payload) ? action.payload : []
      };
      
    case 'SET_IS_GENERATING_OUTLINE':
      return {
        ...state,
        isGeneratingOutline: action.payload
      };
      
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.payload
      };
      
    case 'SET_IS_GENERATING_CONTENT':
      return {
        ...state,
        isGeneratingContent: action.payload
      };
      
    case 'SET_DOCUMENT_STRUCTURE':
      return {
        ...state,
        documentStructure: action.payload
      };
      
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return {
        ...state,
        additionalInstructions: action.payload
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
      
    case 'SET_SEO_SCORE':
      return {
        ...state,
        seoScore: action.payload
      };
      
    case 'SET_SELECTED_SOLUTION':
      return {
        ...state,
        selectedSolution: action.payload
      };
      
    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return {
        ...state,
        solutionIntegrationMetrics: action.payload
      };
      
    case 'SET_IS_SAVING':
      return {
        ...state,
        isSaving: action.payload
      };
      
    default:
      return state;
  }
};
