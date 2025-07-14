/**
 * Content Strategy related type definitions
 */

export interface ContentStrategy {
  targetAudience: string;
  contentGoals: string[];
  businessObjectives: string;
  competitorAnalysis: string;
  contentPillars: string[];
  publishingSchedule: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  targetFunnelStage: 'awareness' | 'consideration' | 'decision' | 'retention';
}