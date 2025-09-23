import { analyzeKeywordEnhanced } from './enhancedSerpService';

export interface MultiKeywordAnalysis {
  keywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: string;
    competition: string;
    trends: number[];
    opportunityScore: number;
  }>;
  comparison: {
    winner: string;
    reasons: string[];
    recommendations: string[];
  };
  combinedOpportunities: {
    lowCompetition: string[];
    highVolume: string[];
    trending: string[];
  };
}

export async function analyzeMultipleKeywords(
  keywords: string[], 
  location: string = 'us'
): Promise<MultiKeywordAnalysis | null> {
  try {
    console.log('🔍 Analyzing multiple keywords:', keywords);
    
    // Analyze each keyword individually
    const keywordAnalyses = await Promise.all(
      keywords.map(async (keyword) => {
        const analysis = await analyzeKeywordEnhanced(keyword, location);
        if (!analysis) return null;
        
        return {
          keyword,
          searchVolume: analysis.metrics?.search_volume || 0,
          difficulty: analysis.metrics?.seo_difficulty || 0,
          cpc: '0.00',
          competition: analysis.metrics?.competition_pct > 70 ? 'high' : analysis.metrics?.competition_pct > 40 ? 'medium' : 'low',
          trends: Array(12).fill(0),
          opportunityScore: calculateOpportunityScore(
            analysis.metrics?.search_volume || 0,
            analysis.metrics?.seo_difficulty || 0,
            analysis.metrics?.competition_pct > 70 ? 'high' : analysis.metrics?.competition_pct > 40 ? 'medium' : 'low'
          )
        };
      })
    );

    const validAnalyses = keywordAnalyses.filter(Boolean);
    if (validAnalyses.length === 0) return null;

    // Determine the winner based on opportunity score
    const winner = validAnalyses.reduce((best, current) => 
      current.opportunityScore > best.opportunityScore ? current : best
    );

    // Generate comparison insights
    const comparison = {
      winner: winner.keyword,
      reasons: generateComparisonReasons(validAnalyses, winner),
      recommendations: generateRecommendations(validAnalyses)
    };

    // Combine opportunities from all keywords
    const combinedOpportunities = await getCombinedOpportunities(keywords);

    return {
      keywords: validAnalyses,
      comparison,
      combinedOpportunities
    };
  } catch (error) {
    console.error('Error in multi-keyword analysis:', error);
    return null;
  }
}

function calculateOpportunityScore(
  volume: number, 
  difficulty: number, 
  competition: string
): number {
  let competitionScore = 50;
  switch (competition.toLowerCase()) {
    case 'low': competitionScore = 80; break;
    case 'medium': competitionScore = 50; break;
    case 'high': competitionScore = 20; break;
  }
  
  const volumeScore = Math.min(volume / 10000 * 100, 100);
  const difficultyScore = 100 - difficulty;
  
  return Math.round((volumeScore * 0.4 + difficultyScore * 0.4 + competitionScore * 0.2));
}

function generateComparisonReasons(analyses: any[], winner: any): string[] {
  const reasons = [];
  
  if (winner.searchVolume === Math.max(...analyses.map(a => a.searchVolume))) {
    reasons.push(`Highest search volume: ${winner.searchVolume.toLocaleString()} monthly searches`);
  }
  
  if (winner.difficulty === Math.min(...analyses.map(a => a.difficulty))) {
    reasons.push(`Lowest keyword difficulty: ${winner.difficulty}%`);
  }
  
  if (winner.opportunityScore === Math.max(...analyses.map(a => a.opportunityScore))) {
    reasons.push(`Best opportunity score: ${winner.opportunityScore}/100`);
  }
  
  return reasons;
}

function generateRecommendations(analyses: any[]): string[] {
  const recommendations = [];
  
  const highVolumeKeywords = analyses.filter(a => a.searchVolume > 10000);
  const lowDifficultyKeywords = analyses.filter(a => a.difficulty < 30);
  
  if (highVolumeKeywords.length > 0) {
    recommendations.push(`Focus on high-volume keywords: ${highVolumeKeywords.map(k => k.keyword).join(', ')}`);
  }
  
  if (lowDifficultyKeywords.length > 0) {
    recommendations.push(`Quick wins with low-difficulty keywords: ${lowDifficultyKeywords.map(k => k.keyword).join(', ')}`);
  }
  
  recommendations.push('Create comprehensive content covering all keyword variations');
  recommendations.push('Target long-tail variations for better ranking opportunities');
  
  return recommendations;
}

async function getCombinedOpportunities(keywords: string[]) {
  // This would normally aggregate opportunities from all keyword analyses
  // For now, return a basic structure
  return {
    lowCompetition: keywords.map(k => `${k} tutorial`),
    highVolume: keywords.map(k => `best ${k}`),
    trending: keywords.map(k => `${k} 2024`),
  };
}

export function extractKeywordsFromPrompt(prompt: string): string[] {
  const keywords = [];
  
  // Look for patterns like "X vs Y", "X versus Y", "compare X and Y"
  const vsPattern = /(\w+(?:\s+\w+)*)\s+(?:vs|versus)\s+(\w+(?:\s+\w+)*)/gi;
  const comparePattern = /compare\s+(\w+(?:\s+\w+)*)\s+(?:and|with)\s+(\w+(?:\s+\w+)*)/gi;
  
  let match;
  while ((match = vsPattern.exec(prompt)) !== null) {
    keywords.push(match[1].trim(), match[2].trim());
  }
  
  while ((match = comparePattern.exec(prompt)) !== null) {
    keywords.push(match[1].trim(), match[2].trim());
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}