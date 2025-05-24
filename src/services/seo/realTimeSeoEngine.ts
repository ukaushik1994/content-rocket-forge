
import { debounce } from 'lodash';

export interface SeoScore {
  overall: number;
  keyword: number;
  structure: number;
  readability: number;
  semantic: number;
  timestamp: number;
}

export interface SeoSuggestion {
  id: string;
  type: 'keyword' | 'structure' | 'readability' | 'semantic';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  position?: { line: number; column: number };
}

export interface SeoAnalysisResult {
  score: SeoScore;
  suggestions: SeoSuggestion[];
  keywordDensity: { [key: string]: number };
  wordCount: number;
  headingStructure: { level: number; text: string; issues?: string[] }[];
  readabilityMetrics: {
    averageWordsPerSentence: number;
    sentenceCount: number;
    complexWords: number;
    fleschScore: number;
  };
}

class RealTimeSeoEngine {
  private analysisCallback?: (result: SeoAnalysisResult) => void;
  private debouncedAnalyze: (content: string, keyword: string, secondaryKeywords: string[]) => void;

  constructor() {
    this.debouncedAnalyze = debounce(this.performAnalysis.bind(this), 500);
  }

  setCallback(callback: (result: SeoAnalysisResult) => void) {
    this.analysisCallback = callback;
  }

  analyze(content: string, mainKeyword: string, secondaryKeywords: string[] = []) {
    if (!content || !mainKeyword) return;
    this.debouncedAnalyze(content, mainKeyword, secondaryKeywords);
  }

  private async performAnalysis(content: string, mainKeyword: string, secondaryKeywords: string[]): Promise<void> {
    try {
      const result = await this.runFullAnalysis(content, mainKeyword, secondaryKeywords);
      this.analysisCallback?.(result);
    } catch (error) {
      console.error('Real-time SEO analysis error:', error);
    }
  }

  private async runFullAnalysis(content: string, mainKeyword: string, secondaryKeywords: string[]): Promise<SeoAnalysisResult> {
    // Parse content structure
    const { headings, wordCount, sentences } = this.parseContent(content);
    
    // Calculate keyword metrics
    const keywordDensity = this.calculateKeywordDensity(content, [mainKeyword, ...secondaryKeywords]);
    
    // Analyze readability
    const readabilityMetrics = this.calculateReadability(content, sentences);
    
    // Calculate individual scores
    const keywordScore = this.calculateKeywordScore(content, mainKeyword, secondaryKeywords);
    const structureScore = this.calculateStructureScore(headings, wordCount);
    const readabilityScore = this.calculateReadabilityScore(readabilityMetrics);
    const semanticScore = await this.calculateSemanticScore(content, mainKeyword);
    
    // Calculate overall score
    const overall = Math.round(
      (keywordScore * 0.3) + 
      (structureScore * 0.25) + 
      (readabilityScore * 0.25) + 
      (semanticScore * 0.2)
    );

    const score: SeoScore = {
      overall,
      keyword: keywordScore,
      structure: structureScore,
      readability: readabilityScore,
      semantic: semanticScore,
      timestamp: Date.now()
    };

    // Generate suggestions
    const suggestions = this.generateSuggestions(content, mainKeyword, secondaryKeywords, {
      headings,
      keywordDensity,
      readabilityMetrics,
      wordCount
    });

    return {
      score,
      suggestions,
      keywordDensity,
      wordCount,
      headingStructure: headings,
      readabilityMetrics
    };
  }

  private parseContent(content: string) {
    const headings: { level: number; text: string; issues?: string[] }[] = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const issues = [];
      
      if (text.length > 60) issues.push('Too long for SEO');
      if (text.length < 20) issues.push('Too short');
      
      headings.push({ level, text, issues: issues.length ? issues : undefined });
    }

    const words = content.match(/\b\w+\b/g) || [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

    return {
      headings,
      wordCount: words.length,
      sentences
    };
  }

  private calculateKeywordDensity(content: string, keywords: string[]): { [key: string]: number } {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    const density: { [key: string]: number } = {};

    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const count = words.filter(word => word === keywordLower).length;
      density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
    });

    return density;
  }

  private calculateReadability(content: string, sentences: string[]) {
    const words = content.match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    const sentenceCount = sentences.length;
    
    const complexWords = words.filter(word => 
      word.length > 6 && 
      !this.isCommonWord(word.toLowerCase())
    ).length;

    const averageWordsPerSentence = sentenceCount > 0 ? totalWords / sentenceCount : 0;
    
    // Simplified Flesch Reading Ease Score
    const fleschScore = sentenceCount > 0 && totalWords > 0 
      ? 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * (complexWords / totalWords))
      : 0;

    return {
      averageWordsPerSentence,
      sentenceCount,
      complexWords,
      fleschScore: Math.max(0, Math.min(100, fleschScore))
    };
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they'];
    return commonWords.includes(word);
  }

  private calculateKeywordScore(content: string, mainKeyword: string, secondaryKeywords: string[]): number {
    const density = this.calculateKeywordDensity(content, [mainKeyword]);
    const mainDensity = density[mainKeyword] || 0;
    
    // Optimal density is 1-3%
    let score = 0;
    if (mainDensity >= 1 && mainDensity <= 3) {
      score = 100;
    } else if (mainDensity >= 0.5 && mainDensity < 1) {
      score = 70;
    } else if (mainDensity > 3 && mainDensity <= 5) {
      score = 60;
    } else if (mainDensity > 0 && mainDensity < 0.5) {
      score = 40;
    } else {
      score = 20;
    }

    // Bonus for secondary keywords
    const secondaryScore = secondaryKeywords.reduce((acc, keyword) => {
      return acc + (density[keyword] > 0 ? 10 : 0);
    }, 0);

    return Math.min(100, score + Math.min(20, secondaryScore));
  }

  private calculateStructureScore(headings: { level: number; text: string }[], wordCount: number): number {
    let score = 0;
    
    // Check H1 presence
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 1) score += 25;
    else if (h1Count === 0) score += 0;
    else score += 10; // Multiple H1s penalized
    
    // Check heading hierarchy
    const levels = headings.map(h => h.level);
    let hierarchyScore = 0;
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] <= levels[i-1] + 1) hierarchyScore += 5;
    }
    score += Math.min(25, hierarchyScore);
    
    // Word count scoring
    if (wordCount >= 1000 && wordCount <= 3000) score += 25;
    else if (wordCount >= 500 && wordCount < 1000) score += 15;
    else if (wordCount > 3000) score += 10;
    else score += 5;
    
    // Heading density (1 heading per 200-300 words is good)
    const idealHeadings = Math.floor(wordCount / 250);
    const headingDiff = Math.abs(headings.length - idealHeadings);
    if (headingDiff <= 2) score += 25;
    else if (headingDiff <= 4) score += 15;
    else score += 5;
    
    return Math.min(100, score);
  }

  private calculateReadabilityScore(metrics: any): number {
    let score = 0;
    
    // Flesch score (60-70 is good)
    if (metrics.fleschScore >= 60 && metrics.fleschScore <= 70) score += 40;
    else if (metrics.fleschScore >= 50 && metrics.fleschScore < 60) score += 30;
    else if (metrics.fleschScore >= 30 && metrics.fleschScore < 50) score += 20;
    else score += 10;
    
    // Average words per sentence (15-20 is good)
    if (metrics.averageWordsPerSentence >= 15 && metrics.averageWordsPerSentence <= 20) score += 30;
    else if (metrics.averageWordsPerSentence >= 10 && metrics.averageWordsPerSentence < 15) score += 20;
    else score += 10;
    
    // Complex words percentage (less than 20% is good)
    const complexPercentage = (metrics.complexWords / (metrics.sentenceCount * metrics.averageWordsPerSentence)) * 100;
    if (complexPercentage <= 20) score += 30;
    else if (complexPercentage <= 30) score += 20;
    else score += 10;
    
    return Math.min(100, score);
  }

  private async calculateSemanticScore(content: string, mainKeyword: string): Promise<number> {
    // For now, return a basic semantic score
    // This would integrate with OpenAI embeddings in a real implementation
    const keywordInContent = content.toLowerCase().includes(mainKeyword.toLowerCase());
    const variations = this.findKeywordVariations(content, mainKeyword);
    
    let score = keywordInContent ? 50 : 20;
    score += Math.min(30, variations * 10);
    score += Math.min(20, Math.floor(Math.random() * 20)); // Placeholder for semantic analysis
    
    return Math.min(100, score);
  }

  private findKeywordVariations(content: string, keyword: string): number {
    const words = keyword.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    return words.filter(word => 
      contentLower.includes(word + 's') || 
      contentLower.includes(word + 'ing') ||
      contentLower.includes(word + 'ed')
    ).length;
  }

  private generateSuggestions(
    content: string, 
    mainKeyword: string, 
    secondaryKeywords: string[],
    analysis: any
  ): SeoSuggestion[] {
    const suggestions: SeoSuggestion[] = [];
    
    // Keyword suggestions
    const mainDensity = analysis.keywordDensity[mainKeyword] || 0;
    if (mainDensity < 1) {
      suggestions.push({
        id: 'keyword-low-density',
        type: 'keyword',
        priority: 'high',
        title: 'Increase main keyword usage',
        description: `Your main keyword "${mainKeyword}" appears ${mainDensity.toFixed(1)}% of the time. Aim for 1-3%.`
      });
    } else if (mainDensity > 3) {
      suggestions.push({
        id: 'keyword-high-density',
        type: 'keyword',
        priority: 'medium',
        title: 'Reduce keyword stuffing',
        description: `Your main keyword appears ${mainDensity.toFixed(1)}% of the time. This might be considered keyword stuffing.`
      });
    }
    
    // Structure suggestions
    const h1Count = analysis.headings.filter((h: any) => h.level === 1).length;
    if (h1Count === 0) {
      suggestions.push({
        id: 'structure-no-h1',
        type: 'structure',
        priority: 'high',
        title: 'Add an H1 heading',
        description: 'Your content needs exactly one H1 heading for proper SEO structure.'
      });
    } else if (h1Count > 1) {
      suggestions.push({
        id: 'structure-multiple-h1',
        type: 'structure',
        priority: 'medium',
        title: 'Multiple H1 headings detected',
        description: 'Use only one H1 heading per page. Convert others to H2 or H3.'
      });
    }
    
    // Word count suggestions
    if (analysis.wordCount < 500) {
      suggestions.push({
        id: 'structure-short-content',
        type: 'structure',
        priority: 'high',
        title: 'Content too short',
        description: `Your content is ${analysis.wordCount} words. Aim for at least 1000 words for better SEO.`
      });
    }
    
    // Readability suggestions
    if (analysis.readabilityMetrics.fleschScore < 30) {
      suggestions.push({
        id: 'readability-difficult',
        type: 'readability',
        priority: 'medium',
        title: 'Content is hard to read',
        description: 'Consider using shorter sentences and simpler words to improve readability.'
      });
    }
    
    return suggestions;
  }
}

export const realTimeSeoEngine = new RealTimeSeoEngine();
