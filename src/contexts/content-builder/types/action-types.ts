
import { 
  ContentType, 
  ContentFormat, 
  ContentIntent
} from './content-types';
import { 
  OutlineSection 
} from './outline-types';
import { 
  SerpData, 
  SerpSelection 
} from './serp-types';
import { 
  SeoImprovement,
  SolutionIntegrationMetrics
} from './seo-types';
import { 
  ContentCluster 
} from './cluster-types';
import {
  Solution
} from './solution-types';
import {
  DocumentStructure
} from './document-types';

export type ContentBuilderAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'MARK_STEP_ANALYZED'; payload: number }
  | { type: 'SKIP_OPTIMIZATION_STEP'; payload?: undefined }
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  | { type: 'SET_SERP_DATA'; payload: SerpData | null }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  | { type: 'SET_OUTLINE'; payload: string[] | OutlineSection[] }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: OutlineSection[] }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  | { type: 'SET_CONTENT_TITLE'; payload: string | null }
  | { type: 'SET_SUGGESTED_TITLES'; payload: string[] }
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'ADD_SEO_IMPROVEMENT'; payload: SeoImprovement }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string }
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_CONTENT_FORMAT'; payload: ContentFormat }
  | { type: 'SET_CONTENT_INTENT'; payload: ContentIntent }
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
  | { type: 'SET_META_TITLE'; payload: string | null }
  | { type: 'SET_META_DESCRIPTION'; payload: string | null }
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: DocumentStructure | null }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: SolutionIntegrationMetrics | null }
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string }
  | { type: 'SET_WORD_COUNT_LIMIT'; payload: number | null }
  | { type: 'SET_SAVED_DRAFT_ID'; payload: string | null };
