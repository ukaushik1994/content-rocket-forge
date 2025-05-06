
import { ContentBuilderState, ContentBuilderAction } from './types/index';

export const contentBuilderReducer = (
  state: ContentBuilderState, 
  action: ContentBuilderAction
): ContentBuilderState => {
  switch (action.type) {
    // Navigation Actions
    case 'SET_ACTIVE_STEP':
      return { ...state, activeStep: action.payload };
      
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map((step, index) => {
          if (step.id === action.payload) {
            return { ...step, completed: true };
          }
          return step;
        })
      };
      
    case 'MARK_STEP_ANALYZED':
      return {
        ...state,
        steps: state.steps.map((step, index) => {
          if (step.id === action.payload) {
            return { ...step, analyzed: true };
          }
          return step;
        })
      };
    
    // Keyword Actions  
    case 'SET_MAIN_KEYWORD':
      return { ...state, mainKeyword: action.payload };
      
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
      
    case 'ADD_SEARCHED_KEYWORD':
      if (state.searchedKeywords.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        searchedKeywords: [...state.searchedKeywords, action.payload]
      };
    
    // SERP Actions
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
      
    case 'SET_SERP_DATA':
      return { ...state, serpData: action.payload };
      
    case 'ADD_SERP_SELECTION':
      // Check if this item already exists
      const existingItem = state.serpSelections.find(
        item => item.type === action.payload.type && item.content === action.payload.content
      );
      
      if (existingItem) {
        // If it exists, toggle its selected state
        return {
          ...state,
          serpSelections: state.serpSelections.map(item => 
            (item.type === action.payload.type && item.content === action.payload.content)
              ? { ...item, selected: action.payload.selected }
              : item
          )
        };
      } else {
        // If it doesn't exist, add it
        return { 
          ...state, 
          serpSelections: [...state.serpSelections, action.payload] 
        };
      }
      
    case 'SET_SERP_SELECTIONS':
      return { ...state, serpSelections: action.payload };
      
    case 'TOGGLE_SERP_SELECTION':
      return {
        ...state,
        serpSelections: state.serpSelections.map(item => 
          (item.type === action.payload.type && item.content === action.payload.content)
            ? { ...item, selected: !item.selected }
            : item
        )
      };
      
    case 'REMOVE_SERP_SELECTION':
      return {
        ...state,
        serpSelections: state.serpSelections.filter(
          selection => !(selection.type === action.payload.type && selection.content === action.payload.content)
        )
      };
      
    case 'CLEAR_SERP_SELECTIONS':
      return { ...state, serpSelections: [] };
    
    // Content Type Actions  
    case 'SET_CONTENT_TYPE':
      return { ...state, contentType: action.payload };
      
    case 'SET_CONTENT_FORMAT':
      return { ...state, contentFormat: action.payload };
      
    case 'SET_CONTENT_INTENT':
      return { ...state, contentIntent: action.payload };
    
    // Outline Actions  
    case 'SET_OUTLINE':
      return { ...state, outline: action.payload };
      
    case 'SET_OUTLINE_SECTIONS':
      return { ...state, outlineSections: action.payload };
    
    // Content Actions  
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
      
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
      
    case 'UPDATE_CONTENT':
      return { ...state, content: action.payload };
      
    case 'SET_CONTENT_TITLE':
      return { ...state, contentTitle: action.payload };
      
    case 'SET_META_TITLE':
      return { ...state, metaTitle: action.payload };
      
    case 'SET_META_DESCRIPTION':
      return { ...state, metaDescription: action.payload };
      
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    
    // Solution Actions  
    case 'SET_SELECTED_SOLUTION':
      return { ...state, selectedSolution: action.payload };
      
    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return { ...state, solutionIntegrationMetrics: action.payload };
    
    // SEO Actions  
    case 'SET_SEO_SCORE':
      return { ...state, seoScore: action.payload };
      
    case 'SET_SEO_IMPROVEMENTS':
      return { ...state, seoImprovements: action.payload };
    
    case 'SET_SEO_ANALYSIS_RESULTS':
      return { ...state, seoAnalysisResults: action.payload };
      
    case 'SET_SEO_OPTIMIZATION_METRICS':
      return { ...state, seoOptimizationMetrics: action.payload };
      
    case 'APPLY_SEO_IMPROVEMENT':
      return {
        ...state,
        seoImprovements: state.seoImprovements.map(improvement => 
          improvement.id === action.payload
            ? { ...improvement, applied: true }
            : improvement
        )
      };
      
    case 'SKIP_OPTIMIZATION_STEP':
      return { ...state, optimizationSkipped: true };
    
    // Document Structure  
    case 'SET_DOCUMENT_STRUCTURE':
      return { ...state, documentStructure: action.payload };
    
    // Additional Instructions
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return { ...state, additionalInstructions: action.payload };
    
    // Cluster Actions
    case 'SET_SELECTED_CLUSTER':
      return { ...state, selectedCluster: action.payload };
      
    default:
      return state;
  }
};
