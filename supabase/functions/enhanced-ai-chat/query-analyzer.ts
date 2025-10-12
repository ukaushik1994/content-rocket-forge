export interface QueryIntent {
  scope: 'minimal' | 'summary' | 'detailed' | 'full';
  categories: string[]; // ['content', 'keywords', 'solutions', 'proposals', 'seo']
  estimatedTokens: number;
  requiresVisualData: boolean;
  confidence: number;
}

export function analyzeQueryIntent(query: string, currentRoute?: string): QueryIntent {
  const q = query.toLowerCase().trim();
  
  // TIER 1: GREETING DETECTION - Minimal Context
  const isGreeting = /^(hi|hello|hey|thanks|thank you|ok|okay|got it|sure|yes|no|yep|nope|cool|great|awesome|👍|👋|🙏|✅)$/i.test(q);
  
  if (isGreeting) {
    console.log('💬 Greeting detected - using minimal context (Tier 1)');
    return {
      scope: 'minimal',
      categories: [],
      estimatedTokens: 100,
      requiresVisualData: false,
      confidence: 1.0
    };
  }
  
  // TIER 3: COMPREHENSIVE REQUEST DETECTION - Full Context
  const isComprehensive = /all|everything|complete|full|comprehensive|entire|summary of everything|analyze everything|show me all|full report|complete analysis/i.test(q);
  
  if (isComprehensive) {
    console.log('📊 Comprehensive request detected - loading full context (Tier 3)');
    return {
      scope: 'full',
      categories: ['content', 'keywords', 'solutions', 'proposals', 'seo'],
      estimatedTokens: 80000,
      requiresVisualData: true,
      confidence: 0.95
    };
  }
  
  // TIER 2: SPECIFIC DATA NEEDS - Targeted Context
  const needsContent = /content|article|blog|post|writing|publish/i.test(q);
  const needsKeywords = /keyword|seo|search|rank|serp|search engine/i.test(q);
  const needsSolutions = /solution|product|service|compare|offering/i.test(q);
  const needsProposals = /proposal|strateg|recommend|suggest|idea|plan/i.test(q);
  const needsSEO = /seo|score|optimi|performance|google|ranking/i.test(q);
  
  // Detect scope level
  let scope: 'summary' | 'detailed' | 'full' = 'summary';
  
  if (/detail|specific|deep|analyze|compare|breakdown|in-depth/i.test(q)) {
    scope = 'detailed';
  }
  
  // Build categories array
  const categories: string[] = [];
  if (needsContent) categories.push('content');
  if (needsKeywords) categories.push('keywords');
  if (needsSolutions) categories.push('solutions');
  if (needsProposals) categories.push('proposals');
  if (needsSEO) categories.push('seo');
  
  // SMART FALLBACK: Page-aware context (instead of dumping everything)
  if (categories.length === 0) {
    console.log('🎯 No specific category detected - using page-aware context');
    
    // Map current route to relevant data categories
    const routeToContext: Record<string, string[]> = {
      '/': ['solutions', 'proposals'],
      '/content': ['content', 'seo'],
      '/solutions': ['solutions', 'content'],
      '/proposals': ['proposals', 'keywords'],
      '/keywords': ['keywords', 'seo'],
      '/analytics': ['content', 'solutions', 'proposals'],
      '/content-builder': ['content', 'seo'],
      '/seo-optimizer': ['seo', 'content'],
    };
    
    const pageCategories = currentRoute ? routeToContext[currentRoute] : undefined;
    
    if (pageCategories && pageCategories.length > 0) {
      categories.push(...pageCategories);
      console.log(`📍 Loading page-specific context for route: ${currentRoute}`);
    } else {
      // Default minimal fallback: only solutions
      categories.push('solutions');
      console.log('🔹 Using default minimal context: solutions only');
    }
    
    scope = 'summary';
  }
  
  // Estimate token usage
  const tokenEstimates = {
    minimal: 100,
    summary: 5000,
    detailed: 25000,
    full: 80000
  };
  
  const estimatedTokens = scope === 'minimal' ? 100 : tokenEstimates[scope];
  
  console.log(`📊 Query Intent Analysis:
  - Type: ${scope}
  - Categories: ${categories.join(', ') || 'none'}
  - Estimated tokens: ${estimatedTokens}
  - Confidence: ${(categories.length > 0 ? 0.8 : 0.5) * 100}%`);
  
  return {
    scope,
    categories,
    estimatedTokens,
    requiresVisualData: /chart|graph|visual|show|display|visuali[sz]e/i.test(q),
    confidence: categories.length > 0 ? 0.8 : 0.5
  };
}
