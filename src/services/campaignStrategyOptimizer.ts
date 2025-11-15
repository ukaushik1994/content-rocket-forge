/**
 * Token optimization for campaign strategy generation
 * Reduces input context from ~25k to ~3-5k tokens
 */

export function optimizeSolutionContext(solution: any): any {
  if (!solution) return null;
  
  return {
    name: solution.name,
    shortDescription: solution.shortDescription?.substring(0, 150) || null,
    category: solution.category,
    // Top 5 features only
    features: solution.features?.slice(0, 5) || [],
    // Top 3 pain points
    painPoints: solution.painPoints?.slice(0, 3) || [],
    // Top 3 value props
    uniqueValuePropositions: solution.uniqueValuePropositions?.slice(0, 3) || [],
    // Top 3 differentiators  
    keyDifferentiators: solution.keyDifferentiators?.slice(0, 3) || [],
    // Truncated positioning
    positioningStatement: solution.positioningStatement?.substring(0, 200) || null,
    targetAudience: solution.targetAudience?.slice(0, 3) || []
  };
}

export function optimizeCompetitorContext(competitors: any[]): any[] {
  if (!competitors || competitors.length === 0) return [];
  
  return competitors.slice(0, 3).map(c => ({
    name: c.name,
    description: c.description?.substring(0, 100) || null,
    marketPosition: c.market_position || c.marketPosition,
    // Only include key strengths/weaknesses if available
    keyStrength: c.strengths?.[0],
    keyWeakness: c.weaknesses?.[0]
  }));
}

export function optimizeSerpContext(serpData: any): string {
  if (!serpData) return '';
  
  const keywords = serpData.keywords?.slice(0, 5).join(', ') || '';
  const paaQuestions = serpData.peopleAlsoAsk?.slice(0, 3).map((q: any) => q.question).join('; ') || '';
  const relatedSearches = serpData.relatedSearches?.slice(0, 3).map((r: any) => r.query).join(', ') || '';
  
  return `\n=== SERP Intelligence ===
Keywords: ${keywords}
PAA: ${paaQuestions}
Related: ${relatedSearches}`;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Approximate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
