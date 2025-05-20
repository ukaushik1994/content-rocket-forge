
import { ContentBuilderState, ContentBuilderAction } from './types/index';

export const contentBuilderReducer = (state: ContentBuilderState, action: ContentBuilderAction): ContentBuilderState => {
  switch (action.type) {
    // Navigation actions
    case 'SET_CURRENT_STEP':
      return { ...state, activeStep: action.payload };
      
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
      
    case 'MARK_STEP_ANALYZED':
      return {
        ...state,
        steps: state.steps.map((step, index) => 
          index === action.payload ? { ...step, analyzed: true } : step
        )
      };
      
    case 'SKIP_OPTIMIZATION_STEP':
      return {
        ...state,
        optimizationSkipped: true
      };

    // Keyword actions
    case 'SET_MAIN_KEYWORD':
      return { ...state, mainKeyword: action.payload };

    case 'ADD_KEYWORD':
      if (state.selectedKeywords.includes(action.payload)) {
        return state;
      }
      return { ...state, selectedKeywords: [...state.selectedKeywords, action.payload] };

    case 'REMOVE_KEYWORD':
      return { 
        ...state, 
        selectedKeywords: state.selectedKeywords.filter(kw => kw !== action.payload) 
      };

    case 'ADD_SEARCHED_KEYWORD':
      if (state.searchedKeywords.includes(action.payload)) {
        return state;
      }
      return { ...state, searchedKeywords: [...state.searchedKeywords, action.payload] };
      
    case 'SET_SELECTED_KEYWORD':
      return { ...state, selectedKeyword: action.payload };

    // SERP actions
    case 'SET_SERP_DATA':
      return { ...state, serpData: action.payload };
      
    case 'SET_IS_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
      
    case 'TOGGLE_SERP_SELECTION':
      const { type, content } = action.payload;
      
      // Find if we already have this selection
      const existingSelectionIndex = state.serpSelections.findIndex(
        sel => sel.type === type && sel.content === content
      );
      
      if (existingSelectionIndex > -1) {
        // Toggle selection state
        const updatedSelections = [...state.serpSelections];
        updatedSelections[existingSelectionIndex] = {
          ...updatedSelections[existingSelectionIndex],
          selected: !updatedSelections[existingSelectionIndex].selected
        };
        
        return { ...state, serpSelections: updatedSelections };
      } else {
        // Add new selection
        const newSelection = {
          type,
          content,
          selected: true
        };
        
        return { ...state, serpSelections: [...state.serpSelections, newSelection] };
      }
      
    case 'SET_PREFERRED_SERP_PROVIDER':
      return { ...state, preferredSerpProvider: action.payload };

    // Content definition actions
    case 'SET_CONTENT_TYPE':
      return { ...state, contentType: action.payload };
      
    case 'SET_CONTENT_FORMAT':
      return { ...state, contentFormat: action.payload };
      
    case 'SET_CONTENT_INTENT':
      return { ...state, contentIntent: action.payload };
      
    case 'SELECT_SOLUTION':
      return { ...state, selectedSolution: action.payload };

    // Titles actions
    case 'SET_CONTENT_TITLE':
      return { ...state, contentTitle: action.payload };
      
    case 'SET_SUGGESTED_TITLES':
      return { ...state, suggestedTitles: action.payload };

    // Outline actions
    case 'SET_OUTLINE':
      return { ...state, outline: action.payload };
      
    case 'SET_OUTLINE_SECTIONS':
      return { ...state, outlineSections: action.payload };

    // Content actions
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
      
    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.payload };
      
    case 'SET_IS_SAVING':
      return { ...state, isSaving: action.payload };

    // SEO actions
    case 'SET_SEO_SCORE':
      return { ...state, seoScore: action.payload };
      
    case 'SET_SEO_IMPROVEMENTS':
      return { ...state, seoImprovements: action.payload };
      
    case 'APPLY_SEO_IMPROVEMENT':
      return {
        ...state,
        seoImprovements: state.seoImprovements.map(improvement => 
          improvement.id === action.payload ? 
            { ...improvement, applied: true } : 
            improvement
        )
      };
      
    case 'SET_SELECTED_CLUSTER':
      return { ...state, selectedCluster: action.payload };
      
    case 'SET_META_TITLE':
      return { ...state, metaTitle: action.payload };
      
    case 'SET_META_DESCRIPTION':
      return { ...state, metaDescription: action.payload };
      
    case 'SET_DOCUMENT_STRUCTURE':
      return { ...state, documentStructure: action.payload };
      
    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return { ...state, solutionIntegrationMetrics: action.payload };
      
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return { ...state, additionalInstructions: action.payload };
      
    default:
      return state;
  }
};
