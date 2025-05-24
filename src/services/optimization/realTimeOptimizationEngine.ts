
import { debounce } from 'lodash';

export interface OptimizationSuggestion {
  id: string;
  type: 'keyword' | 'structure' | 'readability' | 'semantic' | 'cta' | 'gap';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  position?: { start: number; end: number };
  autoFixAvailable: boolean;
  impact: number; // 1-10 scale
}

export interface ContentScore {
  overall: number;
  keyword: number;
  structure: number;
  readability: number;
  semantic: number;
  engagement: number;
  timestamp: number;
}

export interface ContentGap {
  type: 'missing_keyword' | 'weak_heading' | 'poor_flow' | 'missing_cta';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  competitorExample?: string;
}

export interface OptimizationResult {
  score: ContentScore;
  suggestions: OptimizationSuggestion[];
  contentGaps: ContentGap[];
  readabilityMetrics: {
    fleschScore: number;
    averageWordsPerSentence: number;
    complexWords: number;
    sentenceVariety: number;
  };
  competitorAnalysis: {
    averageWordCount: number;
    commonHeadings: string[];
    keywordGaps: string[];
  };
}

class RealTimeOptimizationEngine {
  private optimizationCallback?: (result: OptimizationResult) => void;
  private debouncedOptimize: (content: string, keyword: string, competitors?: any[]) => void;

  constructor() {
    this.debouncedOptimize = debounce(this.performOptimization.bind(this), 600);
  }

  setCallback(callback: (result: OptimizationResult) => void) {
    this.optimizationCallback = callback;
  }

  optimize(content: string, mainKeyword: string, competitors: any[] = []) {
    if (!content || !mainKeyword) return;
    this.debouncedOptimize(content, mainKeyword, competitors);
  }

  private async performOptimization(
    content: string, 
    mainKeyword: string, 
    competitors: any[]
  ): Promise<void> {
    try {
      const result = await this.runOptimizationAnalysis(content, mainKeyword, competitors);
      this.optimizationCallback?.(result);
    } catch (error) {
      console.error('Real-time optimization error:', error);
    }
  }

  private async runOptimizationAnalysis(
    content: string, 
    mainKeyword: string, 
    competitors: any[]
  ): Promise<OptimizationResult> {
    // Analyze content structure and metrics
    const contentMetrics = this.analyzeContentMetrics(content);
    const readabilityMetrics = this.calculateReadabilityMetrics(content);
    const competitorAnalysis = this.analyzeCompetitors(competitors);
    
    // Calculate scores
    const scores = this.calculateOptimizationScores(
      content, 
      mainKeyword, 
      contentMetrics, 
      readabilityMetrics,
      competitorAnalysis
    );
    
    // Generate suggestions
    const suggestions = this.generateOptimizationSuggestions(
      content, 
      mainKeyword, 
      contentMetrics, 
      readabilityMetrics,
      competitorAnalysis
    );
    
    // Identify content gaps
    const contentGaps = this.identifyContentGaps(
      content, 
      mainKeyword, 
      competitorAnalysis
    );

    return {
      score: scores,
      suggestions,
      contentGaps,
      readabilityMetrics,
      competitorAnalysis
    };
  }

  private analyzeContentMetrics(content: string) {
    const words = content.match(/\b\w+\b/g) || [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    // Extract headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: { level: number; text: string; position: number }[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        position: match.index
      });
    }

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      headings,
      averageWordsPerParagraph: paragraphs.length > 0 ? words.length / paragraphs.length : 0,
      hasH1: headings.some(h => h.level === 1),
      headingDistribution: this.analyzeHeadingDistribution(headings)
    };
  }

  private analyzeHeadingDistribution(headings: any[]) {
    const distribution: { [key: number]: number } = {};
    headings.forEach(h => {
      distribution[h.level] = (distribution[h.level] || 0) + 1;
    });
    
    return {
      h1Count: distribution[1] || 0,
      h2Count: distribution[2] || 0,
      h3Count: distribution[3] || 0,
      totalCount: headings.length,
      hasGoodHierarchy: this.checkHeadingHierarchy(headings)
    };
  }

  private checkHeadingHierarchy(headings: any[]): boolean {
    for (let i = 1; i < headings.length; i++) {
      const prevLevel = headings[i - 1].level;
      const currentLevel = headings[i].level;
      
      // Check if we're skipping levels (e.g., H1 to H3)
      if (currentLevel > prevLevel + 1) {
        return false;
      }
    }
    return true;
  }

  private calculateReadabilityMetrics(content: string) {
    const words = content.match(/\b\w+\b/g) || [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const complexWords = words.filter(word => 
      word.length > 6 && 
      !this.isCommonWord(word.toLowerCase())
    ).length;

    const averageWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    
    // Calculate sentence variety (standard deviation of sentence lengths)
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length;
    const sentenceVariety = Math.sqrt(variance);
    
    // Flesch Reading Ease Score
    const fleschScore = sentences.length > 0 && words.length > 0 
      ? 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * (complexWords / words.length))
      : 0;

    return {
      fleschScore: Math.max(0, Math.min(100, fleschScore)),
      averageWordsPerSentence,
      complexWords,
      sentenceVariety: Math.round(sentenceVariety * 100) / 100
    };
  }

  private analyzeCompetitors(competitors: any[]) {
    if (!competitors || competitors.length === 0) {
      return {
        averageWordCount: 1500,
        commonHeadings: [],
        keywordGaps: []
      };
    }

    const wordCounts = competitors.map(c => c.wordCount || 1500);
    const averageWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

    // Extract common headings patterns
    const allHeadings = competitors.flatMap(c => c.headings || []);
    const headingFrequency: { [key: string]: number } = {};
    
    allHeadings.forEach(heading => {
      const normalized = heading.toLowerCase().replace(/[^a-z\s]/g, '');
      headingFrequency[normalized] = (headingFrequency[normalized] || 0) + 1;
    });

    const commonHeadings = Object.entries(headingFrequency)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([heading]) => heading);

    return {
      averageWordCount: Math.round(averageWordCount),
      commonHeadings,
      keywordGaps: [] // Will be populated by keyword analysis
    };
  }

  private calculateOptimizationScores(
    content: string,
    mainKeyword: string,
    contentMetrics: any,
    readabilityMetrics: any,
    competitorAnalysis: any
  ): ContentScore {
    // Keyword score
    const keywordDensity = this.calculateKeywordDensity(content, mainKeyword);
    const keywordScore = this.scoreKeywordUsage(keywordDensity, content, mainKeyword);
    
    // Structure score
    const structureScore = this.scoreContentStructure(contentMetrics);
    
    // Readability score
    const readabilityScore = this.scoreReadability(readabilityMetrics);
    
    // Semantic score
    const semanticScore = this.scoreSemanticRichness(content, mainKeyword);
    
    // Engagement score
    const engagementScore = this.scoreEngagementFactors(content, contentMetrics);
    
    // Overall score (weighted average)
    const overall = Math.round(
      (keywordScore * 0.25) +
      (structureScore * 0.25) +
      (readabilityScore * 0.2) +
      (semanticScore * 0.15) +
      (engagementScore * 0.15)
    );

    return {
      overall,
      keyword: keywordScore,
      structure: structureScore,
      readability: readabilityScore,
      semantic: semanticScore,
      engagement: engagementScore,
      timestamp: Date.now()
    };
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const keywordCount = words.filter(word => word === keyword.toLowerCase()).length;
    return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
  }

  private scoreKeywordUsage(density: number, content: string, keyword: string): number {
    let score = 0;
    
    // Density score
    if (density >= 1 && density <= 3) score += 40;
    else if (density >= 0.5 && density < 1) score += 30;
    else if (density > 3 && density <= 5) score += 25;
    else if (density > 0) score += 15;
    
    // Placement score
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    if (lowerContent.indexOf(lowerKeyword) < 100) score += 20; // Early mention
    if (this.isInHeadings(content, keyword)) score += 20; // In headings
    if (this.isInFirstParagraph(content, keyword)) score += 20; // First paragraph
    
    return Math.min(100, score);
  }

  private scoreContentStructure(metrics: any): number {
    let score = 0;
    
    // H1 presence
    if (metrics.headingDistribution.h1Count === 1) score += 25;
    else if (metrics.headingDistribution.h1Count === 0) score += 0;
    else score += 10;
    
    // Heading hierarchy
    if (metrics.headingDistribution.hasGoodHierarchy) score += 25;
    else score += 10;
    
    // Word count
    if (metrics.wordCount >= 1000 && metrics.wordCount <= 3000) score += 25;
    else if (metrics.wordCount >= 500) score += 15;
    else score += 5;
    
    // Paragraph distribution
    if (metrics.averageWordsPerParagraph >= 50 && metrics.averageWordsPerParagraph <= 150) score += 25;
    else if (metrics.averageWordsPerParagraph >= 30) score += 15;
    else score += 5;
    
    return Math.min(100, score);
  }

  private scoreReadability(metrics: any): number {
    let score = 0;
    
    // Flesch score
    if (metrics.fleschScore >= 60 && metrics.fleschScore <= 80) score += 40;
    else if (metrics.fleschScore >= 40) score += 25;
    else score += 10;
    
    // Sentence length
    if (metrics.averageWordsPerSentence >= 15 && metrics.averageWordsPerSentence <= 25) score += 30;
    else if (metrics.averageWordsPerSentence >= 10) score += 20;
    else score += 10;
    
    // Sentence variety
    if (metrics.sentenceVariety >= 3) score += 30;
    else if (metrics.sentenceVariety >= 2) score += 20;
    else score += 10;
    
    return Math.min(100, score);
  }

  private scoreSemanticRichness(content: string, mainKeyword: string): number {
    // This is a simplified semantic analysis
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    
    let score = 0;
    
    // Lexical diversity
    if (lexicalDiversity >= 0.6) score += 50;
    else if (lexicalDiversity >= 0.4) score += 35;
    else score += 20;
    
    // Related terms presence (simplified)
    const relatedTerms = this.findRelatedTerms(mainKeyword);
    const presentTerms = relatedTerms.filter(term => 
      content.toLowerCase().includes(term.toLowerCase())
    );
    
    score += Math.min(50, presentTerms.length * 10);
    
    return Math.min(100, score);
  }

  private scoreEngagementFactors(content: string, metrics: any): number {
    let score = 0;
    
    // CTAs presence
    const ctaPatterns = /\b(click|download|subscribe|learn more|get started|try now|contact us)\b/gi;
    const ctaCount = (content.match(ctaPatterns) || []).length;
    if (ctaCount >= 2) score += 30;
    else if (ctaCount >= 1) score += 20;
    else score += 5;
    
    // Question engagement
    const questions = (content.match(/\?/g) || []).length;
    if (questions >= 3) score += 25;
    else if (questions >= 1) score += 15;
    else score += 5;
    
    // Lists and bullet points
    const listsCount = (content.match(/^[\s]*[-*+]\s/gm) || []).length;
    if (listsCount >= 5) score += 25;
    else if (listsCount >= 2) score += 15;
    else score += 5;
    
    // Content formatting variety
    const boldCount = (content.match(/\*\*(.*?)\*\*/g) || []).length;
    const italicCount = (content.match(/\*(.*?)\*/g) || []).length;
    if (boldCount + italicCount >= 5) score += 20;
    else if (boldCount + italicCount >= 2) score += 10;
    else score += 5;
    
    return Math.min(100, score);
  }

  private generateOptimizationSuggestions(
    content: string,
    mainKeyword: string,
    contentMetrics: any,
    readabilityMetrics: any,
    competitorAnalysis: any
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Keyword suggestions
    const keywordDensity = this.calculateKeywordDensity(content, mainKeyword);
    if (keywordDensity < 1) {
      suggestions.push({
        id: 'keyword-low-density',
        type: 'keyword',
        priority: 'high',
        title: 'Increase keyword usage',
        description: `Your keyword "${mainKeyword}" appears only ${keywordDensity.toFixed(1)}% of the time. Aim for 1-3%.`,
        action: 'Add more natural mentions of your target keyword throughout the content',
        autoFixAvailable: false,
        impact: 8
      });
    }
    
    // Structure suggestions
    if (contentMetrics.headingDistribution.h1Count === 0) {
      suggestions.push({
        id: 'structure-missing-h1',
        type: 'structure',
        priority: 'critical',
        title: 'Add H1 heading',
        description: 'Your content needs exactly one H1 heading for proper SEO structure.',
        action: 'Add an H1 heading that includes your main keyword',
        autoFixAvailable: true,
        impact: 9
      });
    }
    
    if (contentMetrics.wordCount < competitorAnalysis.averageWordCount * 0.8) {
      suggestions.push({
        id: 'structure-short-content',
        type: 'structure',
        priority: 'high',
        title: 'Expand content length',
        description: `Your content (${contentMetrics.wordCount} words) is shorter than top competitors (avg: ${competitorAnalysis.averageWordCount} words).`,
        action: 'Add more detailed sections and examples to match competitor content depth',
        autoFixAvailable: false,
        impact: 7
      });
    }
    
    // Readability suggestions
    if (readabilityMetrics.fleschScore < 30) {
      suggestions.push({
        id: 'readability-difficult',
        type: 'readability',
        priority: 'medium',
        title: 'Improve readability',
        description: 'Your content is difficult to read. Consider using shorter sentences and simpler words.',
        action: 'Break long sentences into shorter ones and replace complex words with simpler alternatives',
        autoFixAvailable: true,
        impact: 6
      });
    }
    
    if (readabilityMetrics.averageWordsPerSentence > 25) {
      suggestions.push({
        id: 'readability-long-sentences',
        type: 'readability',
        priority: 'medium',
        title: 'Shorten sentences',
        description: `Average sentence length is ${readabilityMetrics.averageWordsPerSentence.toFixed(1)} words. Aim for 15-20 words.`,
        action: 'Break long sentences into shorter, more digestible chunks',
        autoFixAvailable: true,
        impact: 5
      });
    }
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.impact - a.impact;
    });
  }

  private identifyContentGaps(
    content: string,
    mainKeyword: string,
    competitorAnalysis: any
  ): ContentGap[] {
    const gaps: ContentGap[] = [];
    
    // Check for missing common headings
    competitorAnalysis.commonHeadings.forEach((heading: string) => {
      if (!content.toLowerCase().includes(heading)) {
        gaps.push({
          type: 'weak_heading',
          severity: 'medium',
          description: `Missing common topic: "${heading}"`,
          suggestion: `Consider adding a section about "${heading}" as it's commonly covered by top-ranking content`,
          competitorExample: `Top competitors often include: ${heading}`
        });
      }
    });
    
    // Check for CTAs
    const ctaPatterns = /\b(click|download|subscribe|learn more|get started|try now|contact us)\b/gi;
    const ctaCount = (content.match(ctaPatterns) || []).length;
    
    if (ctaCount === 0) {
      gaps.push({
        type: 'missing_cta',
        severity: 'high',
        description: 'No clear call-to-action found',
        suggestion: 'Add clear call-to-action elements to guide user engagement',
        competitorExample: 'Examples: "Learn more", "Get started", "Download now"'
      });
    }
    
    return gaps;
  }

  private isInHeadings(content: string, keyword: string): boolean {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      if (match[2].toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  private isInFirstParagraph(content: string, keyword: string): boolean {
    const paragraphs = content.split('\n\n');
    if (paragraphs.length === 0) return false;
    return paragraphs[0].toLowerCase().includes(keyword.toLowerCase());
  }

  private findRelatedTerms(keyword: string): string[] {
    // Simplified related terms - in production, this would use a semantic API
    const baseTerms: { [key: string]: string[] } = {
      'seo': ['optimization', 'ranking', 'search engine', 'keywords', 'traffic'],
      'marketing': ['advertising', 'promotion', 'branding', 'customers', 'sales'],
      'content': ['writing', 'blog', 'articles', 'copywriting', 'editorial']
    };
    
    const lowerKeyword = keyword.toLowerCase();
    for (const [term, related] of Object.entries(baseTerms)) {
      if (lowerKeyword.includes(term)) {
        return related;
      }
    }
    
    return [];
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 
      'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'who', 'did'
    ];
    return commonWords.includes(word);
  }
}

export const realTimeOptimizationEngine = new RealTimeOptimizationEngine();
