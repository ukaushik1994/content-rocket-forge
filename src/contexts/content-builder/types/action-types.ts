
/**
 * Action-related type definitions 
 */

// Content Builder Actions
export type ContentBuilderActionType =
  // Navigation actions
  | 'SET_CURRENT_STEP'
  | 'MARK_STEP_COMPLETED'
  | 'MARK_STEP_VISITED'
  | 'MARK_STEP_ANALYZED'
  | 'SKIP_OPTIMIZATION_STEP'

  // Keyword actions
  | 'SET_MAIN_KEYWORD'
  | 'ADD_KEYWORD'
  | 'REMOVE_KEYWORD'
  | 'ADD_SEARCHED_KEYWORD'
  | 'SET_SELECTED_KEYWORD' // Added this action

  // SERP actions
  | 'SET_SERP_DATA'
  | 'SET_IS_ANALYZING'
  | 'TOGGLE_SERP_SELECTION'
  | 'SET_PREFERRED_SERP_PROVIDER'

  // Content definition actions
  | 'SET_CONTENT_TYPE'
  | 'SET_CONTENT_FORMAT'
  | 'SET_CONTENT_INTENT'
  | 'SELECT_SOLUTION'

  // Title actions
  | 'SET_CONTENT_TITLE'
  | 'SET_SUGGESTED_TITLES'

  // Outline actions
  | 'SET_OUTLINE'
  | 'SET_OUTLINE_SECTIONS'

  // Content actions
  | 'SET_CONTENT'
  | 'SET_IS_GENERATING'
  | 'SET_IS_SAVING'

  // SEO actions
  | 'SET_SEO_SCORE'
  | 'SET_SEO_IMPROVEMENTS'
  | 'APPLY_SEO_IMPROVEMENT'

  // Cluster actions
  | 'SET_SELECTED_CLUSTER'

  // Meta information actions
  | 'SET_META_TITLE'
  | 'SET_META_DESCRIPTION'

  // Document structure actions
  | 'SET_DOCUMENT_STRUCTURE'

  // Solution integration actions
  | 'SET_SOLUTION_INTEGRATION_METRICS'

  // Additional instructions
  | 'SET_ADDITIONAL_INSTRUCTIONS';

// Content Builder Action
export interface ContentBuilderAction {
  type: ContentBuilderActionType;
  payload?: any;
}
