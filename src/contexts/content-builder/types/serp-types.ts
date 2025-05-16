
/**
 * SERP-related type definitions
 */

export interface SerpSelection {
  type: string;
  content: string;
  selected: boolean;
  source?: string;
  metadata?: any;
}
