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
      // Avoid duplicates
      if (state.secondaryKeywords.includes(action.payload)) {
        return state;
      }
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
      // Mark the content type step as completed when a type is selected
      return { 
        ...state, 
        contentType: action.payload,
        steps: state.steps.map(step =>
          step.id === 1 ? { ...step, completed: true } : step
        )
      };
      
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
      // Mark content writing step as completed when content is added
      const contentLength = action.payload?.trim().length || 0;
      const shouldMarkCompleted = contentLength > 100;
      
      return { 
        ...state, 
        content: action.payload,
        steps: shouldMarkCompleted 
          ? state.steps.map(step =>
              step.id === 4 ? { ...step, completed: true } : step
            )
          : state.steps
      };
    
    // Additional action handlers
    case 'MARK_STEP_COMPLETED':
      // Only update if the step isn't already completed
      if (state.steps[action.payload].completed) {
        return state;
      }
      return {
        ...state,
        steps: state.steps.map((step, index) =>
          index === action.payload ? { ...step, completed: true } : step
        ),
      };
      
    case 'SET_MAIN_KEYWORD':
      // Update both main keyword and page title
      return { 
        ...state, 
        mainKeyword: action.payload,
        contentTitle: state.contentTitle || `Complete Guide to ${action.payload}`
      };
      
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
      // Mark solutions step as completed
      return { 
        ...state, 
        selectedSolution: action.payload,
        steps: state.steps.map(step =>
          step.id === 1 ? { ...step, completed: true } : step
        )
      };
      
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
      // Mark outline step as completed when we have outline sections
      return { 
        ...state, 
        outline: action.payload,
        steps: state.steps.map(step =>
          step.id === 3 ? { ...step, completed: true } : step
        )
      };
      
    case 'ADD_OUTLINE_SECTION':
      // Mark outline step as completed when we add sections
      const newOutline = [...state.outline, action.payload];
      return {
        ...state,
        outline: newOutline,
        steps: state.steps.map(step =>
          step.id === 3 ? { ...step, completed: true } : step
        )
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
      // Auto-complete optimization step if score is high enough
      const isScoreGoodEnough = action.payload >= 70;
      
      return { 
        ...state, 
        seoScore: action.payload,
        steps: isScoreGoodEnough 
          ? state.steps.map(step =>
              step.id === 5 ? { ...step, completed: true } : step
            )
          : state.steps
      };
      
    case 'SET_ADDITIONAL_INSTRUCTIONS':
      return { ...state, additionalInstructions: action.payload };

    // New SEO improvement actions
    case 'SET_SEO_IMPROVEMENTS':
      return { ...state, seoImprovements: action.payload };
      
    case 'APPLY_SEO_IMPROVEMENT': {
      // Mark the optimization step as completed if enough improvements are applied
      const updatedImprovements = state.seoImprovements 
        ? state.seoImprovements.map(improvement => 
            improvement.id === action.payload 
              ? { ...improvement, applied: true } 
              : improvement
          )
        : [];
      
      const appliedCount = updatedImprovements.filter(imp => imp.applied).length;
      const totalCount = updatedImprovements.length;
      const shouldMarkCompleted = totalCount > 0 && appliedCount / totalCount >= 0.7; // 70% applied
      
      return {
        ...state,
        seoImprovements: updatedImprovements,
        steps: shouldMarkCompleted 
          ? state.steps.map(step =>
              step.id === 5 ? { ...step, completed: true } : step
            )
          : state.steps
      };
    }
      
    // New action handlers for final review step
    case 'SET_META_TITLE':
      return { ...state, metaTitle: action.payload };
      
    case 'SET_META_DESCRIPTION':
      return { ...state, metaDescription: action.payload };
      
    case 'SET_DOCUMENT_STRUCTURE': {
      // Auto-complete final review step when document structure is set
      return { 
        ...state, 
        documentStructure: action.payload,
        steps: state.steps.map(step =>
          step.id === 6 ? { ...step, completed: true } : step
        )
      };
    }
    
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
          type: 'topRank', 
          content: item.title,
          source: item.link,
          selected: false
        });
      }
    });
  }
  
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
