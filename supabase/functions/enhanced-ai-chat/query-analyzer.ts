export interface QueryIntent {
  scope: 'summary' | 'detailed' | 'full' | 'conversational';
  categories: string[]; // ['content', 'keywords', 'solutions', 'proposals', 'seo', 'campaigns', 'competitors', 'analytics', 'performance']
  estimatedTokens: number;
  requiresVisualData: boolean;
  confidence: number;
  isConversational: boolean; // Issue #5: Fast-path flag
}

// Issue #5 Fix: Patterns for simple conversational queries that don't need data
const CONVERSATIONAL_PATTERNS = [
  /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening|day))[\s!.?]*$/i,
  /^(thanks|thank\s*you|thx|ty|ok|okay|got\s*it|understood|sure|great|perfect|awesome|cool)[\s!.?]*$/i,
  /^(test|testing|check)[\s!.?]*$/i,
  /^(yes|no|maybe|yep|nope|yeah|nah)[\s!.?]*$/i,
  /^(who are you|what are you|what can you do|help|capabilities)[\s!?.]*$/i,
  /^(bye|goodbye|see you|later|cya)[\s!.?]*$/i,
];

function isConversationalQuery(query: string): boolean {
  const trimmed = query.trim();
  
  // Check explicit patterns
  if (CONVERSATIONAL_PATTERNS.some(p => p.test(trimmed))) {
    return true;
  }
  
  // Very short queries (1-2 words) without action verbs are likely conversational
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= 2 && !/\?$/.test(trimmed)) {
    const actionVerbs = /show|get|find|analyze|compare|create|generate|list|display|fetch|search/i;
    if (!actionVerbs.test(trimmed)) {
      return true;
    }
  }
  
  return false;
}

export function analyzeQueryIntent(query: string): QueryIntent {
  const q = query.toLowerCase();
  
  // Issue #5 Fix: Fast-path for conversational queries
  if (isConversationalQuery(query)) {
    console.log('⚡ Conversational query detected - using fast-path');
    return {
      scope: 'conversational',
      categories: [],
      estimatedTokens: 500, // Minimal tokens
      requiresVisualData: false,
      confidence: 0.95,
      isConversational: true
    };
  }
  
  // Detect what data categories user needs
  const needsContent = /content|article|blog|post|writing|publish/i.test(q);
  const needsKeywords = /keyword|seo|search|rank|serp|search engine/i.test(q);
  const needsSolutions = /solution|product|service|compare|offering/i.test(q);
  const needsProposals = /proposal|strateg|recommend|suggest|idea|plan/i.test(q);
  const needsSEO = /seo|score|optimi|performance|google|ranking/i.test(q);
  
  // Phase 3: New category detections
  const needsCampaigns = /campaign|generation|queue|progress|active campaign|generating/i.test(q);
  const needsCompetitors = /competitor|competition|rival|market|swot/i.test(q);
  const needsAnalytics = /analytics|metrics|views|clicks|conversion|traffic|engagement/i.test(q);
  const needsPerformance = /performing|performance|how.*(doing|going)|status|health/i.test(q);
  
  // Detect scope level
  let scope: 'summary' | 'detailed' | 'full' | 'conversational' = 'summary';
  
  if (/all|everything|complete|full|comprehensive|detailed|entire/i.test(q)) {
    scope = 'full';
  } else if (/detail|specific|deep|analyze|compare|breakdown|in-depth/i.test(q)) {
    scope = 'detailed';
  }
  
  // Build categories array
  const categories: string[] = [];
  if (needsContent) categories.push('content');
  if (needsKeywords) categories.push('keywords');
  if (needsSolutions) categories.push('solutions');
  if (needsProposals) categories.push('proposals');
  if (needsSEO) categories.push('seo');
  if (needsCampaigns) categories.push('campaigns');
  if (needsCompetitors) categories.push('competitors');
  if (needsAnalytics) categories.push('analytics');
  if (needsPerformance) categories.push('performance');
  
  // If no specific category detected, include core data at summary level
  if (categories.length === 0) {
    categories.push('content', 'solutions', 'proposals');
    scope = 'summary';
  }
  
  // Estimate token usage
  const tokenEstimates = {
    summary: 5000,
    detailed: 25000,
    full: 80000,
    conversational: 500
  };
  
  // VISUAL-FIRST: Trigger visualizations for any analytical query
  const visualTriggers = [
    /chart|graph|visual|show|display|visuali[sz]e/i,
    /performance|analytics|trend|compare|comparison/i,
    /how (is|are|did|does|many|much)/i,
    /what (is|are|were|did)/i,
    /tell me about|show me|give me/i,
    /\d+/  // Any query with numbers likely benefits from visualization
  ];
  
  const requiresVisualData = visualTriggers.some(pattern => pattern.test(q));
  
  return {
    scope,
    categories,
    estimatedTokens: tokenEstimates[scope],
    requiresVisualData,
    confidence: categories.length > 0 ? 0.8 : 0.5,
    isConversational: false
  };
}
