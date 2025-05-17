
import { 
  ContentType, 
  ContentFormat, 
  ContentIntent,
  OutlineSection,
  SeoImprovement,
  Solution,
  ContentCluster,
  DocumentStructure,
  SolutionIntegrationMetrics
} from './index';

// Content Builder Action Types
export type ContentBuilderActionType = 
  // Navigation
  | 'SET_ACTIVE_STEP'
  | 'MARK_STEP_COMPLETED'
  | 'SET_CURRENT_STEP'
  | 'MARK_STEP_VISITED'
  | 'MARK_STEP_ANALYZED'
  
  // Keywords
  | 'SET_MAIN_KEYWORD'
  | 'ADD_KEYWORD'
  | 'REMOVE_KEYWORD'
  | 'SET_SEARCHED_KEYWORDS'
  | 'ADD_SEARCHED_KEYWORD'
  
  // Content Type
  | 'SET_CONTENT_TYPE'
  | 'SET_CONTENT_FORMAT'
  | 'SET_CONTENT_INTENT'
  
  // Solution
  | 'SELECT_SOLUTION'
  
  // SERP
  | 'SET_SERP_DATA'
  | 'ADD_SERP_SELECTION'
  | 'REMOVE_SERP_SELECTION'
  | 'TOGGLE_SERP_SELECTION'
  | 'SET_IS_ANALYZING'
  
  // Titles
  | 'SET_CONTENT_TITLE'
  | 'SET_SUGGESTED_TITLES'
  
  // Outline
  | 'SET_OUTLINE'
  | 'SET_OUTLINE_SECTIONS'
  
  // Content
  | 'SET_CONTENT'
  | 'SET_IS_GENERATING'
  | 'SET_IS_SAVING'
  
  // SEO
  | 'SET_SEO_SCORE'
  | 'SET_SEO_IMPROVEMENTS'
  | 'SKIP_OPTIMIZATION_STEP'
  | 'SET_OPTIMIZATION_SKIPPED'
  | 'ADD_SEO_IMPROVEMENT'
  | 'APPLY_SEO_IMPROVEMENT'
  
  // Clusters
  | 'SET_SELECTED_CLUSTER'
  | 'SELECT_CLUSTER'
  
  // Meta
  | 'SET_META_TITLE'
  | 'SET_META_DESCRIPTION'
  
  // Document
  | 'SET_DOCUMENT_STRUCTURE'
  
  // Solution Integration
  | 'SET_SOLUTION_INTEGRATION_METRICS'
  
  // Additional Instructions
  | 'SET_ADDITIONAL_INSTRUCTIONS';

// Content Builder Action
export interface ContentBuilderAction {
  type: ContentBuilderActionType;
  payload?: any;
}
