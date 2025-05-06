
/**
 * Utility functions to transform SEO recommendations into AI-friendly instructions
 */

import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';
import { KeywordUsage } from '@/hooks/seo-analysis/types';

/**
 * Convert SEO recommendations into structured instructions for AI content generation
 */
export function getSeoRecommendationsAsInstructions(
  recommendations: SeoImprovement[],
  keywordUsage: KeywordUsage[] = []
): string {
  if (!recommendations || recommendations.length === 0) {
    return '';
  }

  // Group recommendations by type
  const keywordRecs = recommendations.filter(rec => 
    rec.type === 'keyword' || 
    rec.recommendation.toLowerCase().includes('keyword') || 
    rec.recommendation.toLowerCase().includes('density')
  );
  
  const readabilityRecs = recommendations.filter(rec => 
    rec.type === 'readability' || 
    rec.recommendation.toLowerCase().includes('sentence') || 
    rec.recommendation.toLowerCase().includes('paragraph') ||
    rec.recommendation.toLowerCase().includes('readability')
  );
  
  const structureRecs = recommendations.filter(rec => 
    rec.type === 'structure' || 
    rec.recommendation.toLowerCase().includes('heading') || 
    rec.recommendation.toLowerCase().includes('h2') ||
    rec.recommendation.toLowerCase().includes('h3')
  );

  // Build instructions string
  let instructions = '### SEO Optimization Instructions:\n\n';

  // Add keyword instructions
  if (keywordRecs.length > 0) {
    instructions += '**Keyword Optimization:**\n';
    keywordRecs.forEach(rec => {
      instructions += `- ${rec.recommendation}\n`;
    });
    instructions += '\n';
  }

  // Add keyword usage summary if available
  if (keywordUsage && keywordUsage.length > 0) {
    instructions += '**Current Keyword Usage:**\n';
    keywordUsage.forEach(kw => {
      instructions += `- "${kw.keyword}": ${kw.count} occurrences (${kw.density} density)\n`;
    });
    instructions += '\n';
  }

  // Add readability instructions
  if (readabilityRecs.length > 0) {
    instructions += '**Readability Improvements:**\n';
    readabilityRecs.forEach(rec => {
      instructions += `- ${rec.recommendation}\n`;
    });
    instructions += '\n';
  }

  // Add structure instructions
  if (structureRecs.length > 0) {
    instructions += '**Content Structure:**\n';
    structureRecs.forEach(rec => {
      instructions += `- ${rec.recommendation}\n`;
    });
    instructions += '\n';
  }

  return instructions;
}

/**
 * Prioritize SEO recommendations by impact
 */
export function prioritizeRecommendations(recommendations: SeoImprovement[]): SeoImprovement[] {
  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  // Sort by impact level: high > medium > low
  return [...recommendations].sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
}
