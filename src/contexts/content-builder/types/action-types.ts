
/**
 * Action-related type definitions
 */

import { ContentType, ContentFormat, ContentIntent } from './content-types';
import { Solution, SolutionIntegrationMetrics } from './solution-types';
import { EnhancedSolution } from './enhanced-solution-types';
import { SeoImprovement } from './seo-types';
import { ContentCluster } from './cluster-types';
import { OutlineSection } from './outline-types';
import { DocumentStructure } from './document-types';

// Content Builder Actions
export type ContentBuilderAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'MARK_STEP_ANALYZED'; payload: number }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'CLEAR_SERP_DATA' }
  | { type: 'SET_ANALYZING_NEW_KEYWORD'; payload: boolean }
  | { type: 'ADD_SERP_SELECTION'; payload: import('./serp-types').SerpSelection }
  | { type: 'REMOVE_SERP_SELECTION'; payload: string }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { id: string; content: string; type: string; metadata?: any } }
  | { type: 'CLEAR_SERP_SELECTIONS' }
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_CONTENT_FORMAT'; payload: ContentFormat }
  | { type: 'SET_CONTENT_INTENT'; payload: ContentIntent }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SUGGESTED_TITLES'; payload: string[] }
  | { type: 'SET_SELECTED_SOLUTION'; payload: EnhancedSolution | null }
  | { type: 'SELECT_SOLUTION'; payload: EnhancedSolution | null }
  | { type: 'SET_OUTLINE'; payload: OutlineSection[] }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: OutlineSection[] }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_SEO_IMPROVEMENTS'; payload: SeoImprovement[] }
  | { type: 'ADD_SEO_IMPROVEMENT'; payload: SeoImprovement }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string }
  | { type: 'SKIP_OPTIMIZATION_STEP' }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_SELECTED_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_META_TITLE'; payload: string }
  | { type: 'SET_META_DESCRIPTION'; payload: string }
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: DocumentStructure }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: SolutionIntegrationMetrics }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string }
  | { type: 'SET_SELECTED_KEYWORDS'; payload: string[] }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'LOAD_PRELOADED_DATA'; payload: { mainKeyword?: string; selectedKeywords?: string[]; location?: string; serpData?: any; step?: number; strategySource?: any } };
