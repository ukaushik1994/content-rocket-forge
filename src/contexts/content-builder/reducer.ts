
import { ContentBuilderState, ContentBuilderAction, SerpSelection, SeoImprovement } from './types';

// Reducer function to handle state updates
export const contentBuilderReducer = (
  state: ContentBuilderState, 
  action: ContentBuilderAction
): ContentBuilderState => {
  switch (action.type) {
    case 'SET_ACTIVE_STEP':
      return { ...state, activeStep: action.payload };
      
    case 'COMPLETE_STEP':
      return {
        ...state,
        steps: state.steps.map(step =>
          step.id === action.payload ? { ...step, completed: true } : step
        ),
      };
      
    // Original action handlers
    case 'SET_PRIMARY_KEYWORD':
      return { ...state, primaryKeyword: action.payload };
      
    case 'ADD_SECONDARY_KEYWORD':
      return {
        ...state,
        secondaryKeywords: [...state.secondaryKeywords, action.payload],
      };
      
    case 'REMOVE_SECONDARY_KEYWORD':
      return {
        ...state,
        secondaryKeywords: state.secondaryKeywords.filter(k => k !== action.payload),
      };
      
    case 'SET_KEYWORD_CLUSTERS':
      return { ...state, keywordClusters: action.payload };
      
    case 'SET_CONTENT_TYPE':
      return { ...state, contentType: action.payload };
      
    case 'SET_CONTENT_FORMAT':
      return { ...state, contentFormat: action.payload };
      
    case 'SET_OUTLINE_TITLE':
      return { ...state, contentTitle: action.payload };
      
    case 'SET_OUTLINE_SECTIONS':
      // This needs to be adapted based on how your outline structure is used
      return { ...state };
      
    case 'SET_SERP_ANALYSIS_RESULTS':
      return { ...state, serpAnalysisResults: action.payload };
      
    case 'SET_SERP_KEYWORDS_SELECTED':
      return { ...state, serpKeywordsSelected: action.payload };
      
    case 'SET_SERP_QUESTIONS_SELECTED':
      return { ...state, serpQuestionsSelected: action.payload };
      
    case 'SET_IS_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
      
    case 'SET_IS_SAVING':
      return { ...state, isSaving: action.payload };
      
    case 'SET_IS_PUBLISHING':
      return { ...state, isPublishing: action.payload };
      
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    
    // Additional action handlers
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        steps: state.steps.map(step =>
          step.id === action.payload ? { ...step, completed: true } : step
        ),
      };
      
    case 'SET_MAIN_KEYWORD':
      return { ...state, mainKeyword: action.payload };
      
    case 'ADD_KEYWORD':
      if (state.selectedKeywords.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedKeywords: [...state.selectedKeywords, action.payload],
      };
      
    case 'REMOVE_KEYWORD':
      return {
        ...state,
        selectedKeywords: state.selectedKeywords.filter(k => k !== action.payload),
      };
      
    case 'SET_KEYWORDS':
      return { ...state, selectedKeywords: action.payload };
      
    case 'SELECT_CLUSTER':
      return {
        ...state,
        selectedCluster: action.payload,
        // If a cluster is selected, use its keywords
        selectedKeywords: action.payload ? action.payload.keywords : state.selectedKeywords,
      };
      
    case 'SELECT_SOLUTION':
      return { ...state, selectedSolution: action.payload };
      
    case 'SET_SERP_DATA':
      const newSelections = createSerpSelectionsFromData(action.payload);
      
      return { 
        ...state, 
        serpData: action.payload,
        serpSelections: newSelections
      };
      
    case 'ADD_SERP_SELECTION':
      return {
        ...state,
        serpSelections: [...state.serpSelections, action.payload]
      };
      
    case 'TOGGLE_SERP_SELECTION':
      return {
        ...state,
        serpSelections: state.serpSelections.map(item => 
          item.type === action.payload.type && item.content === action.payload.content
            ? { ...item, selected: !item.selected }
            : item
        )
      };
      
    case 'SET_OUTLINE':
      return { ...state, outline: action.payload };
      
    case 'ADD_OUTLINE_SECTION':
      return {
        ...state,
        outline: [...state.outline, action.payload],
      };
      
    case 'UPDATE_OUTLINE_SECTION': {
      const { id, section } = action.payload;
      return {
        ...state,
        outline: state.outline.map(item =>
          item.id === id ? { ...item, ...section } : item
        ),
      };
    }
      
    case 'REMOVE_OUTLINE_SECTION':
      return {
        ...state,
        outline: state.outline.filter(section => section.id !== action.payload),
      };
      
    case 'SET_CONTENT_TITLE':
      return { ...state, contentTitle: action.payload };
      
    case 'SET_SEO_SCORE':
      return { ...state, seoScore: action.payload };
      
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return { ...state, additionalInstructions: action.payload };

    // New SEO improvement actions
    case 'SET_SEO_IMPROVEMENTS':
      return { ...state, seoImprovements: action.payload };
      
    case 'APPLY_SEO_IMPROVEMENT':
      return {
        ...state,
        seoImprovements: state.seoImprovements 
          ? state.seoImprovements.map(improvement => 
              improvement.id === action.payload 
                ? { ...improvement, applied: true } 
                : improvement
            )
          : []
      };
      
    // New action handlers for final review step
    case 'SET_META_TITLE':
      return { ...state, metaTitle: action.payload };
      
    case 'SET_META_DESCRIPTION':
      return { ...state, metaDescription: action.payload };
      
    case 'SET_DOCUMENT_STRUCTURE':
      return { ...state, documentStructure: action.payload };
    
    case 'SET_SOLUTION_INTEGRATION_METRICS':
      return { ...state, solutionIntegrationMetrics: action.payload };
      
    default:
      return state;
  }
};

// Helper function to convert SERP data to selectable items
function createSerpSelectionsFromData(serpData: any): SerpSelection[] {
  if (!serpData) return [];
  
  const newSelections: SerpSelection[] = [];
  
  // Convert SERP data to selectable items
  if (serpData?.peopleAlsoAsk) {
    serpData.peopleAlsoAsk.forEach((item: any) => {
      newSelections.push({
        type: 'question',
        content: item.question,
        source: item.source,
        selected: false
      });
    });
  }
  
  if (serpData?.relatedSearches) {
    serpData.relatedSearches.forEach((item: any) => {
      newSelections.push({
        type: 'keyword',
        content: item.query,
        selected: false
      });
    });
  }
  
  if (serpData?.featuredSnippets) {
    serpData.featuredSnippets.forEach((item: any) => {
      newSelections.push({
        type: 'snippet',
        content: item.content,
        source: item.source,
        selected: false
      });
    });
  }

  if (serpData?.topResults) {
    serpData.topResults.forEach((item: any) => {
      if (item.snippet) {
        newSelections.push({
          type: 'topRank', // Changed from 'competitor' to 'topRank' for consistency
          content: item.title, // Using title instead of snippet for better overview
          source: item.link,
          selected: false
        });
      }
    });
  }
  
  // Add support for entities
  if (serpData?.entities) {
    serpData.entities.forEach((item: any) => {
      newSelections.push({
        type: 'entity',
        content: item.name,
        source: item.type,
        selected: false
      });
    });
  }
  
  // Add support for headings
  if (serpData?.headings) {
    serpData.headings.forEach((item: any) => {
      newSelections.push({
        type: 'heading',
        content: item.text,
        source: item.level,
        selected: false
      });
    });
  }
  
  // Add support for content gaps
  if (serpData?.contentGaps) {
    serpData.contentGaps.forEach((item: any) => {
      newSelections.push({
        type: 'contentGap',
        content: item.topic,
        source: item.description,
        selected: false
      });
    });
  }
  
  return newSelections;
}

