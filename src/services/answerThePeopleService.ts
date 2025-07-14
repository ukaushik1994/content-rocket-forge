import { analyzeKeywordSerp, searchRelatedKeywords } from './serpApiService';
import { SerpAnalysisResult } from '@/types/serp';

export interface QuestionData {
  id: string;
  question: string;
  type: 'what' | 'how' | 'why' | 'when' | 'where' | 'who' | 'which' | 'can' | 'will' | 'should';
  searchVolume: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  opportunity: 'High' | 'Medium' | 'Low';
  hasHighSearchIntent: boolean;
  hasFeaturedSnippet: boolean;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  funnelStage: 'awareness' | 'consideration' | 'decision';
  contentType: 'blog' | 'faq' | 'video' | 'infographic' | 'guide';
  competitionLevel: number;
  source: string;
  faqScore: number; // 0-100 score indicating FAQ suitability
  isFaqRecommended: boolean; // Quick boolean for FAQ filtering
}

export interface PrepositionData {
  id: string;
  preposition: string;
  searchVolume: number;
  difficulty: number;
  opportunity: 'High' | 'Medium' | 'Low';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  source: string;
}

export interface ComparisonData {
  id: string;
  comparison: string;
  searchVolume: number;
  difficulty: number;
  opportunity: 'High' | 'Medium' | 'Low';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  competitiveAdvantage: boolean;
  source: string;
}

export interface AnswerThePeopleResult {
  keyword: string;
  questions: QuestionData[];
  prepositions: PrepositionData[];
  comparisons: ComparisonData[];
  isRealData: boolean;
  dataQuality: 'high' | 'medium' | 'low';
  lastUpdated: string;
  totalOpportunities: number;
}

/**
 * Extract question type from question text
 */
function extractQuestionType(question: string): QuestionData['type'] {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.startsWith('what')) return 'what';
  if (lowerQuestion.startsWith('how')) return 'how';
  if (lowerQuestion.startsWith('why')) return 'why';
  if (lowerQuestion.startsWith('when')) return 'when';
  if (lowerQuestion.startsWith('where')) return 'where';
  if (lowerQuestion.startsWith('who')) return 'who';
  if (lowerQuestion.startsWith('which')) return 'which';
  if (lowerQuestion.startsWith('can')) return 'can';
  if (lowerQuestion.startsWith('will')) return 'will';
  if (lowerQuestion.startsWith('should')) return 'should';
  
  return 'what'; // default fallback
}

/**
 * Determine search intent based on question content
 */
function determineIntent(text: string): 'informational' | 'commercial' | 'transactional' | 'navigational' {
  const lowerText = text.toLowerCase();
  
  // Commercial intent keywords
  const commercialKeywords = ['best', 'top', 'compare', 'vs', 'review', 'pricing', 'cost', 'price'];
  // Transactional intent keywords
  const transactionalKeywords = ['buy', 'purchase', 'order', 'download', 'sign up', 'register', 'subscription'];
  // Navigational intent keywords
  const navigationalKeywords = ['login', 'website', 'official', 'homepage', 'contact'];
  
  if (transactionalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'transactional';
  }
  
  if (commercialKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'commercial';
  }
  
  if (navigationalKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'navigational';
  }
  
  return 'informational';
}

/**
 * Determine funnel stage based on question content and intent
 */
function determineFunnelStage(text: string, intent: string): 'awareness' | 'consideration' | 'decision' {
  const lowerText = text.toLowerCase();
  
  // Decision stage keywords
  const decisionKeywords = ['best', 'compare', 'vs', 'review', 'pricing', 'cost', 'buy', 'purchase'];
  // Consideration stage keywords
  const considerationKeywords = ['how to choose', 'benefits', 'features', 'pros and cons', 'alternatives'];
  
  if (intent === 'transactional' || decisionKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'decision';
  }
  
  if (intent === 'commercial' || considerationKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'consideration';
  }
  
  return 'awareness';
}

/**
 * Recommend content type based on question characteristics
 */
function recommendContentType(question: string, intent: string, type: string): QuestionData['contentType'] {
  const lowerQuestion = question.toLowerCase();
  
  // FAQ identification logic - enhanced for better FAQ detection
  const faqIndicators = [
    'what is', 'what are', 'what does', 'what do',
    'how long', 'how much', 'how many', 'how often',
    'why is', 'why do', 'why does', 'why should',
    'when is', 'when do', 'when should',
    'where is', 'where can', 'where do',
    'who is', 'who can', 'who should',
    'which is', 'which are', 'which should',
    'can i', 'can you', 'can we',
    'will it', 'will you', 'will this',
    'should i', 'should you', 'should we',
    'is it', 'are there', 'do i need'
  ];
  
  const isFaqCandidate = faqIndicators.some(indicator => 
    lowerQuestion.startsWith(indicator) || lowerQuestion.includes(` ${indicator} `)
  );
  
  // Additional FAQ signals
  const hasSimpleAnswer = question.length < 80; // Shorter questions often have concise FAQ answers
  const isDefinitional = lowerQuestion.includes('definition') || lowerQuestion.includes('meaning');
  const isBasicQuestion = intent === 'informational' && (type === 'what' || type === 'why' || type === 'when');
  
  if (isFaqCandidate || isDefinitional || (isBasicQuestion && hasSimpleAnswer)) {
    return 'faq';
  }
  
  // Other content type logic
  if (type === 'how' && !lowerQuestion.includes('to choose') && !lowerQuestion.includes('to compare')) return 'guide';
  if (lowerQuestion.includes('vs') || lowerQuestion.includes('compare') || lowerQuestion.includes('difference')) return 'infographic';
  if (intent === 'commercial' && !isFaqCandidate) return 'blog';
  if (type === 'how' && (lowerQuestion.includes('step') || lowerQuestion.includes('tutorial'))) return 'guide';
  
  return 'blog'; // default
}

/**
 * Calculate FAQ score based on question characteristics
 */
function calculateFaqScore(question: string, intent: string, type: string, searchVolume: number): number {
  let score = 0;
  const lowerQuestion = question.toLowerCase();
  
  // Base score for question types that work well as FAQs
  if (['what', 'why', 'when', 'who', 'where'].includes(type)) score += 30;
  if (['how', 'which', 'can', 'will', 'should'].includes(type)) score += 20;
  
  // Content indicators
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what are')) score += 25;
  if (lowerQuestion.includes('how long') || lowerQuestion.includes('how much')) score += 20;
  if (lowerQuestion.includes('definition') || lowerQuestion.includes('meaning')) score += 30;
  
  // Intent bonus
  if (intent === 'informational') score += 15;
  if (intent === 'navigational') score += 10;
  
  // Length consideration (FAQs work better for concise questions)
  if (question.length < 50) score += 15;
  else if (question.length < 80) score += 10;
  else if (question.length > 120) score -= 10;
  
  // Search volume consideration
  if (searchVolume > 1000) score += 10;
  if (searchVolume > 5000) score += 5;
  
  // Complexity indicators (reduce FAQ score for complex topics)
  const complexityIndicators = ['strategy', 'implementation', 'advanced', 'comprehensive', 'detailed analysis'];
  if (complexityIndicators.some(indicator => lowerQuestion.includes(indicator))) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate difficulty based on search volume and competition
 */
function calculateDifficulty(searchVolume: number, competition: number): 'Easy' | 'Medium' | 'Hard' {
  const score = (searchVolume / 1000) + (competition * 0.5);
  
  if (score < 2) return 'Easy';
  if (score < 5) return 'Medium';
  return 'Hard';
}

/**
 * Calculate opportunity score based on various factors
 */
function calculateOpportunity(searchVolume: number, difficulty: string, hasFeaturedSnippet: boolean): 'High' | 'Medium' | 'Low' {
  let score = 0;
  
  // Volume score
  if (searchVolume > 3000) score += 3;
  else if (searchVolume > 1000) score += 2;
  else score += 1;
  
  // Difficulty score (inverse)
  if (difficulty === 'Easy') score += 3;
  else if (difficulty === 'Medium') score += 2;
  else score += 1;
  
  // Featured snippet opportunity
  if (!hasFeaturedSnippet) score += 2;
  
  if (score >= 7) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

/**
 * Process People Also Ask data into structured questions
 */
function processQuestionsFromSerp(serpData: SerpAnalysisResult, keyword: string): QuestionData[] {
  if (!serpData?.peopleAlsoAsk?.length) {
    console.log('No People Also Ask data found');
    return [];
  }

  return serpData.peopleAlsoAsk.map((item, index) => {
    // Estimate search volume based on position and main keyword volume
    const baseVolume = serpData.searchVolume || 1000;
    const estimatedVolume = Math.floor(baseVolume * (0.1 + (Math.random() * 0.4)) * (5 - index) / 5);
    
    const questionType = extractQuestionType(item.question);
    const intent = determineIntent(item.question);
    const funnelStage = determineFunnelStage(item.question, intent);
    const contentType = recommendContentType(item.question, intent, questionType);
    const faqScore = calculateFaqScore(item.question, intent, questionType, estimatedVolume);
    
    const competition = Math.floor(Math.random() * 100);
    const difficulty = calculateDifficulty(estimatedVolume, competition);
    const hasFeaturedSnippet = Math.random() > 0.7; // 30% chance of featured snippet
    const opportunity = calculateOpportunity(estimatedVolume, difficulty, hasFeaturedSnippet);
    
    return {
      id: `q-${index + 1}`,
      question: item.question,
      type: questionType,
      searchVolume: estimatedVolume,
      difficulty,
      opportunity,
      hasHighSearchIntent: intent === 'commercial' || intent === 'transactional',
      hasFeaturedSnippet,
      intent,
      funnelStage,
      contentType,
      competitionLevel: competition,
      source: item.source || 'Google SERP',
      faqScore,
      isFaqRecommended: faqScore >= 60 // Threshold for FAQ recommendation
    };
  });
}

/**
 * Generate preposition variations from keyword and related searches
 */
function generatePrepositions(keyword: string, serpData: SerpAnalysisResult): PrepositionData[] {
  const prepositions = ['for', 'with', 'without', 'in', 'by', 'to', 'from', 'about', 'during', 'after'];
  const contexts = ['b2b', 'small business', 'beginners', 'advanced users', '2025', 'limited budget', 'remote teams'];
  
  const generatedPrepositions: PrepositionData[] = [];
  
  // Use related searches if available
  if (serpData.relatedSearches?.length) {
    serpData.relatedSearches.slice(0, 8).forEach((related, index) => {
      const baseVolume = serpData.searchVolume || 1000;
      const estimatedVolume = Math.floor(baseVolume * (0.05 + Math.random() * 0.15));
      const difficulty = Math.floor(Math.random() * 100);
      const intent = determineIntent(related.query);
      
      generatedPrepositions.push({
        id: `p-${index + 1}`,
        preposition: related.query,
        searchVolume: estimatedVolume,
        difficulty,
        opportunity: difficulty < 40 ? 'High' : difficulty < 70 ? 'Medium' : 'Low',
        intent,
        source: 'Google Related Searches'
      });
    });
  } else {
    // Generate from combinations
    prepositions.slice(0, 3).forEach((prep, pIndex) => {
      contexts.slice(0, 2).forEach((context, cIndex) => {
        const phrase = `${keyword} ${prep} ${context}`;
        const estimatedVolume = Math.floor(Math.random() * 2000) + 500;
        const difficulty = Math.floor(Math.random() * 100);
        
        generatedPrepositions.push({
          id: `p-${pIndex * 2 + cIndex + 1}`,
          preposition: phrase,
          searchVolume: estimatedVolume,
          difficulty,
          opportunity: difficulty < 40 ? 'High' : difficulty < 70 ? 'Medium' : 'Low',
          intent: determineIntent(phrase),
          source: 'Generated Combinations'
        });
      });
    });
  }
  
  return generatedPrepositions.slice(0, 6);
}

/**
 * Generate comparison variations
 */
function generateComparisons(keyword: string, serpData: SerpAnalysisResult): ComparisonData[] {
  const comparisonTerms = ['vs', 'versus', 'compared to', 'or'];
  const alternatives = [
    'traditional methods',
    'competitors',
    'alternative solutions',
    'other strategies',
    'manual processes',
    'automated tools'
  ];
  
  const comparisons: ComparisonData[] = [];
  
  comparisonTerms.slice(0, 2).forEach((term, tIndex) => {
    alternatives.slice(0, 3).forEach((alt, aIndex) => {
      const phrase = `${keyword} ${term} ${alt}`;
      const estimatedVolume = Math.floor(Math.random() * 1500) + 800;
      const difficulty = Math.floor(Math.random() * 100);
      
      comparisons.push({
        id: `c-${tIndex * 3 + aIndex + 1}`,
        comparison: phrase,
        searchVolume: estimatedVolume,
        difficulty,
        opportunity: difficulty < 50 ? 'High' : difficulty < 75 ? 'Medium' : 'Low',
        intent: 'commercial',
        competitiveAdvantage: Math.random() > 0.6,
        source: 'Generated Comparisons'
      });
    });
  });
  
  return comparisons.slice(0, 5);
}

/**
 * Main function to analyze keyword and get Answer the People data
 */
export async function analyzeAnswerThePeople(keyword: string, refresh: boolean = false): Promise<AnswerThePeopleResult> {
  try {
    console.log(`🎯 Starting Answer the People analysis for: "${keyword}"`);
    
    // Get SERP data for the keyword
    const serpData = await analyzeKeywordSerp(keyword, refresh);
    
    if (!serpData) {
      console.log('❌ No SERP data available');
      return createFallbackData(keyword);
    }
    
    console.log('✅ SERP data received, processing...');
    
    // Process the data
    const questions = processQuestionsFromSerp(serpData, keyword);
    const prepositions = generatePrepositions(keyword, serpData);
    const comparisons = generateComparisons(keyword, serpData);
    
    const totalOpportunities = questions.filter(q => q.opportunity === 'High').length +
                              prepositions.filter(p => p.opportunity === 'High').length +
                              comparisons.filter(c => c.opportunity === 'High').length;
    
    console.log(`✅ Analysis complete: ${questions.length} questions, ${prepositions.length} prepositions, ${comparisons.length} comparisons`);
    
    return {
      keyword,
      questions,
      prepositions,
      comparisons,
      isRealData: serpData.isGoogleData || false,
      dataQuality: serpData.dataQuality || 'medium',
      lastUpdated: new Date().toISOString(),
      totalOpportunities
    };
    
  } catch (error) {
    console.error('❌ Error in Answer the People analysis:', error);
    return createFallbackData(keyword);
  }
}

/**
 * Create fallback data when SERP analysis fails
 */
function createFallbackData(keyword: string): AnswerThePeopleResult {
  return {
    keyword,
    questions: [
      {
        id: 'fallback-1',
        question: `What is ${keyword}?`,
        type: 'what',
        searchVolume: 1200,
        difficulty: 'Medium',
        opportunity: 'Medium',
        hasHighSearchIntent: true,
        hasFeaturedSnippet: false,
        intent: 'informational',
        funnelStage: 'awareness',
        contentType: 'faq',
        competitionLevel: 45,
        source: 'Fallback Data',
        faqScore: 75,
        isFaqRecommended: true
      },
      {
        id: 'fallback-2',
        question: `How to use ${keyword}?`,
        type: 'how',
        searchVolume: 2100,
        difficulty: 'Medium',
        opportunity: 'High',
        hasHighSearchIntent: false,
        hasFeaturedSnippet: true,
        intent: 'informational',
        funnelStage: 'consideration',
        contentType: 'guide',
        competitionLevel: 52,
        source: 'Fallback Data',
        faqScore: 45,
        isFaqRecommended: false
      }
    ],
    prepositions: [
      {
        id: 'fallback-p1',
        preposition: `${keyword} for beginners`,
        searchVolume: 800,
        difficulty: 35,
        opportunity: 'High',
        intent: 'informational',
        source: 'Fallback Data'
      }
    ],
    comparisons: [
      {
        id: 'fallback-c1',
        comparison: `${keyword} vs alternatives`,
        searchVolume: 1100,
        difficulty: 48,
        opportunity: 'Medium',
        intent: 'commercial',
        competitiveAdvantage: true,
        source: 'Fallback Data'
      }
    ],
    isRealData: false,
    dataQuality: 'low',
    lastUpdated: new Date().toISOString(),
    totalOpportunities: 2
  };
}

/**
 * Export questions for Content Builder integration
 */
export function exportQuestionsForContentBuilder(questions: QuestionData[]): Array<{
  type: string;
  content: string;
  metadata: any;
}> {
  return questions.map(q => ({
    type: 'question',
    content: q.question,
    metadata: {
      searchVolume: q.searchVolume,
      difficulty: q.difficulty,
      opportunity: q.opportunity,
      intent: q.intent,
      funnelStage: q.funnelStage,
      contentType: q.contentType,
      source: q.source,
      faqScore: q.faqScore,
      isFaqRecommended: q.isFaqRecommended
    }
  }));
}

/**
 * Export FAQ questions specifically for Content Builder
 */
export function exportFaqQuestionsForContentBuilder(questions: QuestionData[]): Array<{
  type: string;
  content: string;
  metadata: any;
}> {
  const faqQuestions = questions.filter(q => q.isFaqRecommended);
  
  return faqQuestions.map(q => ({
    type: 'faq',
    content: q.question,
    metadata: {
      searchVolume: q.searchVolume,
      difficulty: q.difficulty,
      opportunity: q.opportunity,
      intent: q.intent,
      funnelStage: q.funnelStage,
      contentType: 'faq',
      source: q.source,
      faqScore: q.faqScore,
      isFaqRecommended: true,
      suggestedAnswerLength: q.question.length < 50 ? 'short' : 'medium',
      priority: q.opportunity === 'High' ? 'high' : q.opportunity === 'Medium' ? 'medium' : 'low'
    }
  }));
}

/**
 * Get FAQ statistics from questions data
 */
export function getFaqStatistics(questions: QuestionData[]): {
  totalFaqs: number;
  highOpportunityFaqs: number;
  averageFaqScore: number;
  faqsByType: Record<string, number>;
} {
  const faqQuestions = questions.filter(q => q.isFaqRecommended);
  
  const faqsByType = faqQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const averageFaqScore = faqQuestions.length > 0 
    ? faqQuestions.reduce((sum, q) => sum + q.faqScore, 0) / faqQuestions.length 
    : 0;
  
  return {
    totalFaqs: faqQuestions.length,
    highOpportunityFaqs: faqQuestions.filter(q => q.opportunity === 'High').length,
    averageFaqScore: Math.round(averageFaqScore),
    faqsByType
  };
}