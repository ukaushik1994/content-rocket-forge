
/**
 * SERP-related type definitions
 */

export interface SerpSelection {
  id?: string;
  type: string;
  content: string;
  selected: boolean;
  timestamp?: string;
  source?: string;
  metadata?: Record<string, any>;
}
