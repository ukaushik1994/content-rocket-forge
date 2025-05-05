import { ContentBuilderState, ContentBuilderAction, SerpSelection } from './types';

// Helper function to create SERP selections from data
const createSerpSelectionsFromData = (data: any): SerpSelection[] => {
  const selections: SerpSelection[] = [];
  
  // Process related searches (keywords)
  if (data.relatedSearches && Array.isArray(data.relatedSearches)) {
    data.relatedSearches.forEach((item: any) => {
      selections.push({
        type: 'keyword',
        content: item.query || item,
        source: 'Related searches',
        selected: false
      });
    });
  }
  
  // Process people also ask (questions)
  if (data.peopleAlsoAsk && Array.isArray(data.peopleAlsoAsk)) {
    data.peopleAlsoAsk.forEach((item: any) => {
      selections.push({
        type: 'question',
        content: item.question || item,
        source: item.source || 'People also ask',
        selected: false
      });
    });
  }
  
  // Process top results snippets
  if (data.topResults && Array.isArray(data.topResults)) {
    data.topResults.forEach((item: any) => {
      if (item.title) {
        selections.push({
          type: 'heading',
          content: item.title,
          source: `Rank ${item.position || '?'}`,
          selected: false
        });
      }
      if (item.snippet) {
        selections.push({
          type: 'snippet',
          content: item.snippet,
          source: item.title || `Rank ${item.position || '?'}`,
          selected: false
        });
      }
    });
  }
  
  // Process entities if available
  if (data.entities && Array.isArray(data.entities)) {
    data.entities.forEach((item: any) => {
      selections.push({
        type: 'entity',
        content: typeof item === 'string' ? item : (item.name || item.entity || ''),
        source: 'Knowledge graph',
        selected: false
      });
    });
  }
  
  // Process content gaps if available
  if (data.contentGaps && Array.isArray(data.contentGaps)) {
    data.contentGaps.forEach((item: any) => {
      selections.push({
        type: 'contentGap',
        content: typeof item === 'string' ? item : (item.topic || ''),
        source: 'Content gap analysis',
        selected: false
      });
    });
  }
  
  // Process headings if available
  if (data.headings && Array.isArray(data.headings)) {
    data.headings.forEach((item: any) => {
      selections.push({
        type: 'heading',
        content: typeof item === 'string' ? item : (item.text || ''),
        source: 'Common headings',
        selected: false
      });
    });
  }
  
  return selections;
};

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
      
      // Auto-complete linked steps for improved flow
      let updatedSteps = [...state.steps];
      updatedSteps[action.payload] = { ...updatedSteps[action.payload], completed: true };
      
      // If marking keyword step complete (step 0) and we have SERP data, also mark SERP step (step 2) complete
      if (action.payload === 0 && state.serpData) {
        updatedSteps[2] = { ...updatedSteps[2], completed: true };
      }
      
      // If marking SERP step complete (step 2), also mark keyword step (step 0) complete
      if (action.payload === 2) {
        updatedSteps[0] = { ...updatedSteps[0], completed: true };
      }
      
      return { ...state, steps: updatedSteps };
      
    case 'SET_MAIN_KEYWORD':
      // Update both main keyword and page title if not set yet
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
      
    case 'SET_SERP_DATA': {
      const newSelections = createSerpSelectionsFromData(action.payload);
      
      // If we already have selections, merge them to preserve selection state
      let mergedSelections = newSelections;
      if (state.serpSelections && state.serpSelections.length > 0) {
        // Create map of existing selections for quick lookup
        const existingSelectionsMap = new Map(
          state.serpSelections.map(s => [`${s.type}:${s.content}`, s.selected])
        );
        
        // Update new selections with previous selection state if they exist
        mergedSelections = newSelections.map(s => {
          const key = `${s.type}:${s.content}`;
          if (existingSelectionsMap.has(key)) {
            return { ...s, selected: existingSelectionsMap.get(key) || false };
          }
          return s;
        });
      }
      
      return { 
        ...state, 
        serpData: action.payload,
        serpSelections: mergedSelections
      };
    }
      
    case 'ADD_SERP_SELECTION':
      // Check if we already have this selection
      const existingIndex = state.serpSelections.findIndex(
        s => s.type === action.payload.type && s.content === action.payload.content
      );
      
      if (existingIndex >= 0) {
        // If it exists, update it
        const updatedSelections = [...state.serpSelections];
        updatedSelections[existingIndex] = {
          ...updatedSelections[existingIndex],
          selected: true
        };
        return {
          ...state,
          serpSelections: updatedSelections
        };
      } else {
        // Otherwise add it
        return {
          ...state,
          serpSelections: [...state.serpSelections, action.payload]
        };
      }
      
    case 'TOGGLE_SERP_SELECTION': {
      const { type, content } = action.payload;
      return {
        ...state,
        serpSelections: state.serpSelections.map(item => 
          item.type === type && item.content === content
            ? { ...item, selected: !item.selected }
            : item
        )
      };
    }
      
    case 'SET_OUTLINE':
      // Mark outline step as completed when we have outline sections
      const hasOutline = action.payload.length > 0;
      return { 
        ...state, 
        outline: action.payload,
        steps: hasOutline ? state.steps.map(step =>
          step.id === 3 ? { ...step, completed: true } : step
        ) : state.steps
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
      
    case 'SET_SEO_IMPROVEMENTS':
      return { ...state, seoImprovements: action.payload };
      
    case 'APPLY_SEO_IMPROVEMENT': {
      // Mark the improvement as applied
      const updatedImprovements = state.seoImprovements?.map(imp =>
        imp.id === action.payload ? { ...imp, applied: true } : imp
      ) || [];
      
      // Calculate new SEO score based on applied improvements
      const appliedImprovementsCount = updatedImprovements.filter(imp => imp.applied).length;
      const totalImprovementsCount = updatedImprovements.length;
      
      let newSeoScore = state.seoScore;
      if (totalImprovementsCount > 0) {
        // Increase score based on percentage of applied improvements
        const baseScore = Math.min(60, state.seoScore); // Cap base score
        const improvementBonus = 40 * (appliedImprovementsCount / totalImprovementsCount);
        newSeoScore = Math.min(100, baseScore + improvementBonus);
      }
      
      // Auto-complete optimization step if score is high enough
      const isScoreGoodEnough = newSeoScore >= 70;
      
      return { 
        ...state,
        seoImprovements: updatedImprovements,
        seoScore: newSeoScore,
        steps: isScoreGoodEnough 
          ? state.steps.map(step =>
              step.id === 5 ? { ...step, completed: true } : step
            )
          : state.steps
      };
    }
      
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
