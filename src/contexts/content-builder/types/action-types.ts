
import { Step } from './step-types';
import { SerpSelection } from './serp-types';
import { ContentType, ContentFormat, ContentIntent } from './content-types';
import { ContentCluster } from './cluster-types';
import { Solution } from './solution-types';
import { SeoImprovement } from './seo-types';
import { OutlineSection } from './outline-types';
import { DocumentStructure } from './document-types';

// Define all possible action types
export type ContentBuilderActionType = 
  | 'SET_CURRENT_STEP'
  | 'MARK_STEP_COMPLETED'
  | 'MARK_STEP_VISITED'
  | 'MARK_STEP_ANALYZED'
  | 'SKIP_OPTIMIZATION_STEP'
  | 'SET_MAIN_KEYWORD'
  | 'ADD_SEARCHED_KEYWORD'
  | 'SET_SERP_DATA'
  | 'SET_IS_ANALYZING'
  | 'TOGGLE_SERP_SELECTION'
  | 'SET_OUTLINE_SECTIONS'
  | 'SET_OUTLINE_AUTO_GENERATED'
  | 'SET_CONTENT_TITLE'
  | 'SET_CONTENT'
  | 'SET_CONTENT_LEAD_IN'
  | 'SET_CONTENT_TYPE'
  | 'SET_CONTENT_FORMAT'
  | 'SET_CONTENT_INTENT'
  | 'SET_META_TITLE'
  | 'SET_META_DESCRIPTION'
  | 'SELECT_CLUSTER'
  | 'ADD_KEYWORD'
  | 'REMOVE_KEYWORD'
  | 'SELECT_SOLUTION'
  | 'SET_IS_GENERATING'
  | 'SET_ADDITIONAL_INSTRUCTIONS'
  | 'UPDATE_SEO_SCORE'
  | 'ADD_SEO_IMPROVEMENT'
  | 'RESET_SERP_SELECTIONS'
  | 'SET_ACTIVE_STEP'
  | 'SET_DOCUMENT_STRUCTURE'
  | 'SET_SELECTED_REGIONS'
  | 'SET_AVAILABLE_SOLUTIONS';

// Define the structure of an action
export interface ContentBuilderAction {
  type: ContentBuilderActionType;
  payload?: any;
}
