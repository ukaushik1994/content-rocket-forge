
/**
 * Action-related type definitions
 */
import { ContentType, ContentFormat, ContentIntent, SaveContentParams } from './content-types';
import { OutlineSection } from './outline-types';
import { Solution } from './solution-types';
import { SeoImprovement, SeoOptimizationMetrics } from './seo-types';
import { SerpSelection } from './serp-types';
import { ContentCluster } from './cluster-types';
import { DocumentStructure } from './document-types';

// Content Builder Actions
export type ContentBuilderAction =
  // Navigation Actions
  | { type: 'SET_ACTIVE_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_ANALYZED'; payload: number }
  
  // Keyword Actions
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  
  // SERP Actions
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'ADD_SERP_SELECTION'; payload: SerpSelection }
  | { type: 'REMOVE_SERP_SELECTION'; payload: string }
  | { type: 'CLEAR_SERP_SELECTIONS' }
  
  // Content Type Actions
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_CONTENT_FORMAT'; payload: ContentFormat }
  | { type: 'SET_CONTENT_INTENT'; payload: ContentIntent }
  
  // Outline Actions
  | { type: 'SET_OUTLINE'; payload: string[] }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: OutlineSection[] }
  
  // Content Actions
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'UPDATE_CONTENT'; payload: string }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_META_TITLE'; payload: string }
  | { type: 'SET_META_DESCRIPTION'; payload: string }
  | { type: 'SET_SAVING'; payload: boolean }
  
  // Solution Actions
  | { type: 'SET_SELECTED_SOLUTION'; payload: Solution | null }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: any }
  
  // SEO Actions
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'SET_SEO_IMPROVEMENTS'; payload: SeoImprovement[] }
  | { type: 'SET_SEO_ANALYSIS_RESULTS'; payload: { keywordScore: number; readabilityScore: number; contentLengthScore: number; structureScore: number } }
  | { type: 'SET_SEO_OPTIMIZATION_METRICS'; payload: SeoOptimizationMetrics }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string }
  | { type: 'SKIP_OPTIMIZATION_STEP' }
  
  // Document Structure
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: DocumentStructure | null }
  
  // Additional Instructions
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string }
  
  // Cluster Actions
  | { type: 'SET_SELECTED_CLUSTER'; payload: ContentCluster | null };
