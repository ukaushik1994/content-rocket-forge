import { ContentBuilderState, ContentBuilderAction } from './types';

export function contentBuilderReducer(
  state: ContentBuilderState,
  action: ContentBuilderAction
): ContentBuilderState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        steps: {
          ...state.steps,
          current: action.payload,
        },
      };
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: {
          ...state.steps,
          completed: state.steps.completed.includes(action.payload)
            ? state.steps.completed
            : [...state.steps.completed, action.payload],
        },
      };
    case 'SET_MAIN_KEYWORD':
      return {
        ...state,
        mainKeyword: action.payload,
      };
    case 'ADD_SEARCHED_KEYWORD':
      return {
        ...state,
        searchedKeywords: state.searchedKeywords.includes(action.payload)
          ? state.searchedKeywords
          : [...state.searchedKeywords, action.payload],
      };
    case 'SET_SERP_DATA':
      return {
        ...state,
        serpData: action.payload,
        serpError: null,
      };
    case 'SET_IS_ANALYZING':
      return {
        ...state,
        isAnalyzing: action.payload,
      };
    case 'TOGGLE_SERP_SELECTION':
      const { type, content } = action.payload;
      const currentSelections = [...state.serpSelections[type]];
      const index = currentSelections.indexOf(content);

      if (index === -1) {
        currentSelections.push(content);
      } else {
        currentSelections.splice(index, 1);
      }

      return {
        ...state,
        serpSelections: {
          ...state.serpSelections,
          [type]: currentSelections,
        },
      };
    case 'SET_OUTLINE':
      return {
        ...state,
        outline: action.payload,
      };
    case 'SET_CONTENT':
      return {
        ...state,
        content: action.payload,
      };
    case 'SET_TITLE':
      return {
        ...state,
        title: action.payload,
      };
    case 'SET_IS_GENERATING':
      return {
        ...state,
        isGenerating: action.payload,
      };
    case 'SET_SERP_ERROR':
      return {
        ...state,
        serpError: action.payload,
      };
    case 'SET_IS_GENERATING_OUTLINE':
      return {
        ...state,
        isGeneratingOutline: action.payload,
      };
    case 'SET_IS_GENERATING_CONTENT':
      return {
        ...state,
        isGeneratingContent: action.payload,
      };
    case 'SET_DOCUMENT_STRUCTURE':
      return {
        ...state,
        documentStructure: action.payload,
      };
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return {
        ...state,
        additionalInstructions: action.payload,
      };
    case 'SET_META_TITLE':
      return {
        ...state,
        metaTitle: action.payload,
      };
    case 'SET_META_DESCRIPTION':
      return {
        ...state,
        metaDescription: action.payload,
      };
    case 'SET_SEO_SCORE':
      return {
        ...state,
        seoScore: action.payload,
      };
    case 'SET_SELECTED_SOLUTION':
      return {
        ...state,
        selectedSolution: action.payload,
      };
    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return {
        ...state,
        solutionIntegrationMetrics: action.payload,
      };
    case 'SET_IS_SAVING':
      return {
        ...state,
        isSaving: action.payload,
      };
    case 'SET_SEO_IMPROVEMENTS':
      return {
        ...state,
        seoImprovements: action.payload,
      };
    case 'APPLY_SEO_IMPROVEMENT':
      return {
        ...state,
        seoImprovements: state.seoImprovements?.map(improvement =>
          improvement.id === action.payload
            ? { ...improvement, applied: true }
            : improvement
        ) || []
      };
    default:
      return state;
  }
}
