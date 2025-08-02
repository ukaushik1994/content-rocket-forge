
import { ContentBuilderState, ContentBuilderAction } from './types';

export const contentBuilderReducer = (
  state: ContentBuilderState,
  action: ContentBuilderAction
): ContentBuilderState => {
  switch (action.type) {
    case 'SET_MAIN_KEYWORD':
      return { ...state, mainKeyword: action.payload };
    case 'ADD_KEYWORD':
      return { 
        ...state, 
        selectedKeywords: [...state.selectedKeywords, action.payload] 
      };
    case 'REMOVE_KEYWORD':
      return {
        ...state,
        selectedKeywords: state.selectedKeywords.filter(k => k !== action.payload)
      };
    case 'SET_CONTENT_TYPE':
      return { ...state, contentType: action.payload };
    case 'SET_CONTENT_FORMAT':
      return { ...state, contentFormat: action.payload };
    case 'SET_CONTENT_INTENT':
      return { ...state, contentIntent: action.payload };
    case 'SET_CONTENT_TITLE':
      return { ...state, contentTitle: action.payload };
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_META_TITLE':
      return { ...state, metaTitle: action.payload };
    case 'SET_META_DESCRIPTION':
      return { ...state, metaDescription: action.payload };
    case 'SET_DOCUMENT_STRUCTURE':
      return { ...state, documentStructure: action.payload };
    case 'NAVIGATE_TO_STEP':
      return { ...state, activeStep: action.payload };
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map(step =>
          step.id === action.payload ? { ...step, completed: true } : step
        )
      };
    default:
      return state;
  }
};
