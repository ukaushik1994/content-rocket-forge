import { debounce } from 'lodash';

export interface KeywordPlacement {
  keyword: string;
  positions: {
    title: number;
    headings: number[];
    firstParagraph: boolean;
    lastParagraph: boolean;
    metaDescription: boolean;
    altTags: number;
  };
  score: number;
}

export interface SemanticKeyword {
  keyword: string;
  relevanceScore: number;
  category: 'synonym' | 'related' | 'lsi' | 'entity';
  frequency: number;
}

export interface KeywordIntent {
  keyword: string;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  confidence: number;
  signals: string[];
}

export interface KeywordGap {
  keyword: string;
  opportunity: 'high' | 'medium' | 'low';
  reason: string;
  suggestedPlacement: string[];
}

export interface KeywordIntelligenceResult {
  primaryKeyword: {
    density: number;
    placement: KeywordPlacement;
    variations: string[];
    score: number;
  };
  secondaryKeywords: {
    keyword: string;
    density: number;
    placement: KeywordPlacement;
    score: number;
  }[];
  semanticKeywords: SemanticKeyword[];
  keywordIntents: KeywordIntent[];
  keywordGaps: KeywordGap[];
  overallIntelligenceScore: number;
  recommendations: {
    id: string;
    type: 'density' | 'placement' | 'semantic' | 'intent' | 'gap';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
  }[];
}

class KeywordIntelligenceEngine {
  private analysisCallback?: (result: KeywordIntelligenceResult) => void;
  private debouncedAnalyze: (content: string, mainKeyword: string, secondaryKeywords: string[], metaData?: any) => void;

  constructor() {
    this.debouncedAnalyze = debounce(this.performIntelligenceAnalysis.bind(this), 800);
  }

  setCallback(callback: (result: KeywordIntelligenceResult) => void) {
    this.analysisCallback = callback;
  }

  analyze(content: string, mainKeyword: string, secondaryKeywords: string[] = [], metaData?: any) {
    if (!content || !mainKeyword) return;
    this.debouncedAnalyze(content, mainKeyword, secondaryKeywords, metaData);
  }

  private async performIntelligenceAnalysis(
    content: string, 
    mainKeyword: string, 
    secondaryKeywords: string[], 
    metaData?: any
  ): Promise<void> {
    try {
      const result = await this.runKeywordIntelligenceAnalysis(content, mainKeyword, secondaryKeywords, metaData);
      this.analysisCallback?.(result);
    } catch (error) {
      console.error('Keyword intelligence analysis error:', error);
    }
  }

  private async runKeywordIntelligenceAnalysis(
    content: string, 
    mainKeyword: string, 
    secondaryKeywords: string[], 
    metaData?: any
  ): Promise<KeywordIntelligenceResult> {
    // Analyze primary keyword
    const primaryKeyword = this.analyzePrimaryKeyword(content, mainKeyword, metaData);
    
    // Analyze secondary keywords
    const secondaryKeywordAnalysis = secondaryKeywords.map(keyword => 
      this.analyzeSecondaryKeyword(content, keyword, metaData)
    );
    
    // Detect semantic keywords
    const semanticKeywords = this.detectSemanticKeywords(content, mainKeyword);
    
    // Classify keyword intents
    const keywordIntents = this.classifyKeywordIntents([mainKeyword, ...secondaryKeywords]);
    
    // Identify keyword gaps
    const keywordGaps = this.identifyKeywordGaps(content, mainKeyword, secondaryKeywords, semanticKeywords);
    
    // Calculate overall intelligence score
    const overallIntelligenceScore = this.calculateOverallIntelligenceScore(
      primaryKeyword, secondaryKeywordAnalysis, semanticKeywords, keywordGaps
    );
    
    // Generate recommendations
    const recommendations = this.generateIntelligenceRecommendations(
      content, primaryKeyword, secondaryKeywordAnalysis, semanticKeywords, keywordGaps
    );

    return {
      primaryKeyword,
      secondaryKeywords: secondaryKeywordAnalysis,
      semanticKeywords,
      keywordIntents,
      keywordGaps,
      overallIntelligenceScore,
      recommendations
    };
  }

  private analyzePrimaryKeyword(content: string, keyword: string, metaData?: any) {
    const density = this.calculateKeywordDensity(content, keyword);
    const placement = this.analyzeKeywordPlacement(content, keyword, metaData);
    const variations = this.findKeywordVariations(content, keyword);
    const score = this.calculateKeywordScore(density, placement, variations.length);

    return {
      density,
      placement,
      variations,
      score
    };
  }

  private analyzeSecondaryKeyword(content: string, keyword: string, metaData?: any) {
    const density = this.calculateKeywordDensity(content, keyword);
    const placement = this.analyzeKeywordPlacement(content, keyword, metaData);
    const score = this.calculateKeywordScore(density, placement, 0);

    return {
      keyword,
      density,
      placement,
      score
    };
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const keywordWords = keyword.toLowerCase().split(' ');
    
    let count = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ');
      if (phrase === keyword.toLowerCase()) {
        count++;
      }
    }
    
    return words.length > 0 ? (count / words.length) * 100 : 0;
  }

  private analyzeKeywordPlacement(content: string, keyword: string, metaData?: any): KeywordPlacement {
    const lowerKeyword = keyword.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // Check title placement
    const title = metaData?.title || '';
    const titlePosition = title.toLowerCase().indexOf(lowerKeyword);
    
    // Check heading placements
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: number[] = [];
    let match;
    let headingIndex = 0;
    
    while ((match = headingRegex.exec(content)) !== null) {
      if (match[2].toLowerCase().includes(lowerKeyword)) {
        headings.push(headingIndex);
      }
      headingIndex++;
    }
    
    // Check paragraph placements
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const firstParagraph = paragraphs[0]?.toLowerCase().includes(lowerKeyword) || false;
    const lastParagraph = paragraphs[paragraphs.length - 1]?.toLowerCase().includes(lowerKeyword) || false;
    
    // Check meta description
    const metaDescription = metaData?.metaDescription?.toLowerCase().includes(lowerKeyword) || false;
    
    // Alt tags (placeholder - would need image analysis)
    const altTags = 0;
    
    const positions = {
      title: titlePosition,
      headings,
      firstParagraph,
      lastParagraph,
      metaDescription,
      altTags
    };
    
    const score = this.calculatePlacementScore(positions);
    
    return {
      keyword,
      positions,
      score
    };
  }

  private calculatePlacementScore(positions: KeywordPlacement['positions']): number {
    let score = 0;
    
    // Title placement (0-30 points)
    if (positions.title === 0) score += 30; // At the beginning
    else if (positions.title > 0) score += 20; // Somewhere in title
    
    // H1 placement (0-25 points)
    if (positions.headings.includes(0)) score += 25;
    
    // Other headings (0-15 points)
    if (positions.headings.length > 1) score += 15;
    else if (positions.headings.length === 1 && !positions.headings.includes(0)) score += 10;
    
    // First paragraph (0-15 points)
    if (positions.firstParagraph) score += 15;
    
    // Meta description (0-10 points)
    if (positions.metaDescription) score += 10;
    
    // Last paragraph (0-5 points)
    if (positions.lastParagraph) score += 5;
    
    return Math.min(100, score);
  }

  private findKeywordVariations(content: string, keyword: string): string[] {
    const variations: string[] = [];
    const keywordWords = keyword.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    
    keywordWords.forEach(word => {
      // Common variations
      const commonSuffixes = ['s', 'es', 'ing', 'ed', 'er', 'est', 'ly'];
      commonSuffixes.forEach(suffix => {
        const variation = word + suffix;
        if (contentLower.includes(variation) && !variations.includes(variation)) {
          variations.push(variation);
        }
      });
      
      // Plural/singular detection
      if (word.endsWith('s') && contentLower.includes(word.slice(0, -1))) {
        variations.push(word.slice(0, -1));
      }
    });
    
    return variations;
  }

  private detectSemanticKeywords(content: string, mainKeyword: string): SemanticKeyword[] {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq: { [key: string]: number } = {};
    
    // Count word frequencies
    words.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Get semantic keywords based on co-occurrence and relevance
    const semanticKeywords: SemanticKeyword[] = [];
    const mainKeywordWords = mainKeyword.toLowerCase().split(' ');
    
    Object.entries(wordFreq).forEach(([word, freq]) => {
      if (freq >= 2 && !mainKeywordWords.includes(word)) {
        const relevanceScore = this.calculateSemanticRelevance(word, mainKeyword, content);
        const category = this.categorizeSemanticKeyword(word, mainKeyword);
        
        if (relevanceScore > 0.3) {
          semanticKeywords.push({
            keyword: word,
            relevanceScore,
            category,
            frequency: freq
          });
        }
      }
    });
    
    return semanticKeywords
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);
  }

  private calculateSemanticRelevance(word: string, mainKeyword: string, content: string): number {
    // Simple co-occurrence based relevance
    const sentences = content.split(/[.!?]+/);
    const mainKeywordLower = mainKeyword.toLowerCase();
    
    let coOccurrences = 0;
    let totalSentences = 0;
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (sentenceLower.includes(word)) {
        totalSentences++;
        if (sentenceLower.includes(mainKeywordLower)) {
          coOccurrences++;
        }
      }
    });
    
    return totalSentences > 0 ? coOccurrences / totalSentences : 0;
  }

  private categorizeSemanticKeyword(word: string, mainKeyword: string): SemanticKeyword['category'] {
    // Simple categorization logic (would be enhanced with NLP in production)
    const mainWords = mainKeyword.toLowerCase().split(' ');
    
    if (mainWords.some(mw => word.includes(mw) || mw.includes(word))) {
      return 'related';
    }
    
    // Check for common entity indicators
    if (/^[A-Z]/.test(word)) {
      return 'entity';
    }
    
    return 'lsi';
  }

  private classifyKeywordIntents(keywords: string[]): KeywordIntent[] {
    return keywords.map(keyword => {
      const intent = this.determineKeywordIntent(keyword);
      return intent;
    });
  }

  private determineKeywordIntent(keyword: string): KeywordIntent {
    const lowerKeyword = keyword.toLowerCase();
    const signals: string[] = [];
    let intent: KeywordIntent['intent'] = 'informational';
    let confidence = 0.7;
    
    // Informational signals
    const informationalWords = ['what', 'how', 'why', 'where', 'when', 'guide', 'tutorial', 'tips'];
    if (informationalWords.some(word => lowerKeyword.includes(word))) {
      intent = 'informational';
      confidence = 0.9;
      signals.push('informational keywords detected');
    }
    
    // Commercial signals
    const commercialWords = ['best', 'top', 'review', 'compare', 'vs', 'alternative', 'solution'];
    if (commercialWords.some(word => lowerKeyword.includes(word))) {
      intent = 'commercial';
      confidence = 0.8;
      signals.push('commercial keywords detected');
    }
    
    // Transactional signals
    const transactionalWords = ['buy', 'purchase', 'order', 'download', 'get', 'shop', 'price', 'cost'];
    if (transactionalWords.some(word => lowerKeyword.includes(word))) {
      intent = 'transactional';
      confidence = 0.9;
      signals.push('transactional keywords detected');
    }
    
    // Navigational signals
    const navigationalWords = ['login', 'sign in', 'dashboard', 'account', 'contact'];
    if (navigationalWords.some(word => lowerKeyword.includes(word))) {
      intent = 'navigational';
      confidence = 0.8;
      signals.push('navigational keywords detected');
    }
    
    return {
      keyword,
      intent,
      confidence,
      signals
    };
  }

  private identifyKeywordGaps(
    content: string, 
    mainKeyword: string, 
    secondaryKeywords: string[], 
    semanticKeywords: SemanticKeyword[]
  ): KeywordGap[] {
    const gaps: KeywordGap[] = [];
    
    // Check for missing semantic opportunities
    const highValueSemanticKeywords = semanticKeywords
      .filter(sk => sk.relevanceScore > 0.7 && sk.frequency < 3);
    
    highValueSemanticKeywords.forEach(semantic => {
      gaps.push({
        keyword: semantic.keyword,
        opportunity: 'high',
        reason: 'High semantic relevance but low usage frequency',
        suggestedPlacement: ['headings', 'first paragraph']
      });
    });
    
    // Check for missing keyword variations
    const mainKeywordVariations = this.generateKeywordVariations(mainKeyword);
    const missingVariations = mainKeywordVariations.filter(variation => 
      !content.toLowerCase().includes(variation.toLowerCase())
    );
    
    missingVariations.slice(0, 3).forEach(variation => {
      gaps.push({
        keyword: variation,
        opportunity: 'medium',
        reason: 'Important keyword variation not present',
        suggestedPlacement: ['body content', 'subheadings']
      });
    });
    
    return gaps.slice(0, 10);
  }

  private generateKeywordVariations(keyword: string): string[] {
    const variations: string[] = [];
    const words = keyword.split(' ');
    
    // Generate plural/singular variations
    words.forEach(word => {
      if (word.endsWith('s')) {
        variations.push(keyword.replace(word, word.slice(0, -1)));
      } else {
        variations.push(keyword.replace(word, word + 's'));
      }
    });
    
    // Generate common prefixes/suffixes
    const modifiers = ['best', 'top', 'how to', 'guide to'];
    modifiers.forEach(modifier => {
      variations.push(`${modifier} ${keyword}`);
    });
    
    return variations;
  }

  private calculateKeywordScore(density: number, placement: KeywordPlacement, variationCount: number): number {
    let score = 0;
    
    // Density score (0-40 points)
    if (density >= 1 && density <= 3) score += 40;
    else if (density >= 0.5 && density < 1) score += 30;
    else if (density > 3 && density <= 5) score += 20;
    else if (density > 0) score += 10;
    
    // Placement score (0-40 points)
    score += (placement.score * 0.4);
    
    // Variation score (0-20 points)
    score += Math.min(20, variationCount * 5);
    
    return Math.min(100, score);
  }

  private calculateOverallIntelligenceScore(
    primaryKeyword: any,
    secondaryKeywords: any[],
    semanticKeywords: SemanticKeyword[],
    keywordGaps: KeywordGap[]
  ): number {
    let score = 0;
    
    // Primary keyword score (40% weight)
    score += primaryKeyword.score * 0.4;
    
    // Secondary keywords average score (30% weight)
    const avgSecondaryScore = secondaryKeywords.length > 0 
      ? secondaryKeywords.reduce((sum, kw) => sum + kw.score, 0) / secondaryKeywords.length 
      : 0;
    score += avgSecondaryScore * 0.3;
    
    // Semantic keyword diversity (20% weight)
    const semanticScore = Math.min(100, semanticKeywords.length * 5);
    score += semanticScore * 0.2;
    
    // Keyword gap penalty (10% weight)
    const gapPenalty = Math.min(50, keywordGaps.length * 5);
    score += (100 - gapPenalty) * 0.1;
    
    return Math.round(score);
  }

  private generateIntelligenceRecommendations(
    content: string,
    primaryKeyword: any,
    secondaryKeywords: any[],
    semanticKeywords: SemanticKeyword[],
    keywordGaps: KeywordGap[]
  ) {
    const recommendations: any[] = [];
    
    // Primary keyword recommendations
    if (primaryKeyword.score < 70) {
      if (primaryKeyword.density < 1) {
        recommendations.push({
          id: 'primary-low-density',
          type: 'density',
          priority: 'high',
          title: 'Increase primary keyword usage',
          description: `Your primary keyword density is ${primaryKeyword.density.toFixed(2)}%. Aim for 1-3%.`,
          action: 'Add more natural mentions of your primary keyword throughout the content'
        });
      }
      
      if (primaryKeyword.placement.score < 50) {
        recommendations.push({
          id: 'primary-poor-placement',
          type: 'placement',
          priority: 'high',
          title: 'Improve primary keyword placement',
          description: 'Your primary keyword placement could be optimized for better SEO.',
          action: 'Include your primary keyword in title, H1, and first paragraph'
        });
      }
    }
    
    // Semantic keyword opportunities
    const highValueSemanticKeywords = semanticKeywords.filter(sk => sk.relevanceScore > 0.8);
    if (highValueSemanticKeywords.length > 0) {
      recommendations.push({
        id: 'semantic-opportunities',
        type: 'semantic',
        priority: 'medium',
        title: 'Leverage semantic keyword opportunities',
        description: `${highValueSemanticKeywords.length} high-value semantic keywords detected.`,
        action: `Consider including terms like: ${highValueSemanticKeywords.slice(0, 3).map(sk => sk.keyword).join(', ')}`
      });
    }
    
    // Keyword gap recommendations
    const highOpportunityGaps = keywordGaps.filter(gap => gap.opportunity === 'high');
    if (highOpportunityGaps.length > 0) {
      recommendations.push({
        id: 'keyword-gaps',
        type: 'gap',
        priority: 'high',
        title: 'Fill keyword gaps',
        description: `${highOpportunityGaps.length} high-opportunity keyword gaps identified.`,
        action: `Consider adding: ${highOpportunityGaps.slice(0, 3).map(gap => gap.keyword).join(', ')}`
      });
    }
    
    return recommendations.slice(0, 10);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'this', 'that', 'these',
      'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours'
    ];
    return stopWords.includes(word.toLowerCase());
  }
}

export const keywordIntelligenceEngine = new KeywordIntelligenceEngine();
