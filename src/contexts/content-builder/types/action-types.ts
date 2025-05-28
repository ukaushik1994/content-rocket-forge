
import { 
  ContentType, 
  ContentFormat, 
  ContentIntent, 
  SaveContentParams 
} from './content-types';
import { SerpSelection } from './serp-types';
import { Solution, SolutionIntegrationMetrics } from './solution-types';
import { OutlineSection } from './outline-types';
import { SeoImprovement } from './seo-types';
import { ContentCluster } from './cluster-types';
import { DocumentStructure } from './document-types';
import { ComprehensiveAnalytics } from './analytics-types';

export type ContentBuilderAction =
  // Navigation actions
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'MARK_STEP_ANALYZED'; payload: number }
  | { type: 'SKIP_OPTIMIZATION_STEP' }
  
  // Keyword actions
  | { type: 'SET_MAIN_KEYWORD'; payload: string }
  | { type: 'ADD_SEARCHED_KEYWORD'; payload: string }
  | { type: 'ADD_KEYWORD'; payload: string }
  | { type: 'REMOVE_KEYWORD'; payload: string }
  
  // SERP actions
  | { type: 'SET_SERP_DATA'; payload: any }
  | { type: 'SET_IS_ANALYZING'; payload: boolean }
  | { type: 'TOGGLE_SERP_SELECTION'; payload: { type: string; content: string } }
  
  // Outline actions
  | { type: 'SET_OUTLINE'; payload: string[] | OutlineSection[] }
  | { type: 'SET_OUTLINE_SECTIONS'; payload: OutlineSection[] }
  
  // Content actions
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IS_GENERATING'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_CONTENT_TITLE'; payload: string }
  | { type: 'SET_SUGGESTED_TITLES'; payload: string[] }
  
  // SEO actions
  | { type: 'SET_SEO_SCORE'; payload: number }
  | { type: 'ADD_SEO_IMPROVEMENT'; payload: SeoImprovement }
  | { type: 'APPLY_SEO_IMPROVEMENT'; payload: string }
  
  // Content type actions
  | { type: 'SET_CONTENT_TYPE'; payload: ContentType }
  | { type: 'SET_CONTENT_FORMAT'; payload: ContentFormat }
  | { type: 'SET_CONTENT_INTENT'; payload: ContentIntent }
  
  // Solution actions
  | { type: 'SELECT_SOLUTION'; payload: Solution | null }
  | { type: 'SET_SOLUTION_INTEGRATION_METRICS'; payload: SolutionIntegrationMetrics | null }
  
  // Cluster actions
  | { type: 'SELECT_CLUSTER'; payload: ContentCluster | null }
  
  // Meta actions
  | { type: 'SET_META_TITLE'; payload: string | null }
  | { type: 'SET_META_DESCRIPTION'; payload: string | null }
  
  // Document structure actions
  | { type: 'SET_DOCUMENT_STRUCTURE'; payload: DocumentStructure | null }
  
  // Additional instructions
  | { type: 'SET_ADDITIONAL_INSTRUCTIONS'; payload: string }
  
  // Analytics actions
  | { type: 'SET_COMPREHENSIVE_ANALYTICS'; payload: ComprehensiveAnalytics | null }
  | { type: 'SET_IS_ANALYZING_CONTENT'; payload: boolean }
  | { type: 'SET_LAST_ANALYSIS_HASH'; payload: string | null };
