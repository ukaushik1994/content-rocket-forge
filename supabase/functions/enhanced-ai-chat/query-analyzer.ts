export interface QueryIntent {
  scope: 'summary' | 'detailed' | 'full' | 'conversational';
  categories: string[]; // ['content', 'keywords', 'solutions', 'proposals', 'seo', 'campaigns', 'competitors', 'analytics', 'performance']
  estimatedTokens: number;
  requiresVisualData: boolean;
  confidence: number;
  isConversational: boolean; // Issue #5: Fast-path flag
  panelHint?: 'repository' | 'approvals' | 'content_repurpose' | null; // Hint to trigger sidebar panel
  disambiguationHint?: string | null; // Hint for ambiguous queries
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
      estimatedTokens: 500,
      requiresVisualData: false,
      confidence: 0.95,
      isConversational: true,
      panelHint: null
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
  const needsCompetitors = /competitor|competition|rival|market leader|swot|versus|vs\b/i.test(q);
  const needsAnalytics = /analytics|metrics|views|clicks|conversion|traffic|engagement/i.test(q);
  const needsPerformance = /performing|performance|how.*(doing|going)|status|health/i.test(q);
  
  // Engage module categories
  const needsEngage = /contact|subscriber|audience|segment|journey|automation|email campaign|newsletter|crm|engage|drip|funnel|unsubscrib/i.test(q);
  
  // Additional module categories
  const needsApprovals = /approv|review|pending review|reject|needs changes|submission/i.test(q);
  const needsCalendar = /calendar|schedule|editorial|planned|upcoming/i.test(q);
  const needsResearch = /research|topic cluster|content gap|serp intelligence|pillar|topical authority/i.test(q);
  // Glossary removed — feature deprecated
  const needsSocial = /social|instagram|twitter|linkedin|facebook|tiktok|post|hashtag|mention|dm|comment/i.test(q);
  
  // Write/Action intent detection
  const needsWriteAction = /create|add|make|build|write|draft|generate|new/i.test(q);
  const needsUpdateAction = /update|edit|change|modify|rename/i.test(q);
  const needsDeleteAction = /delete|remove|archive|trash/i.test(q);
  const needsSendAction = /send|publish|schedule|activate|trigger|start|launch/i.test(q);
  const needsApprovalAction = /approve|reject|review|submit/i.test(q);
  const needsTagAction = /tag|label|categorize/i.test(q);
  const needsCrossModule = /enroll|add to|move to|promote|repurpose|turn into|convert to/i.test(q);
  const needsProposalAction = /accept proposal|reject proposal|dismiss proposal|approve proposal|schedule proposal|create proposal/i.test(q);
  const needsRecommendationAction = /accept recommendation|dismiss recommendation|follow.*advice|implement.*recommendation/i.test(q);
  const needsCampaignAction = /create.*campaign|new campaign|start.*campaign|launch.*campaign/i.test(q);
  const needsSocialAction = /update.*social|edit.*post|schedule.*post|change.*post|modify.*post|reschedule.*post|update.*post|edit.*social/i.test(q);
  const needsTemplateAction = /update.*template|edit.*template|modify.*template/i.test(q);
  const hasActionIntent = needsWriteAction || needsUpdateAction || needsDeleteAction || needsSendAction || needsApprovalAction || needsTagAction || needsCrossModule || needsProposalAction || needsRecommendationAction || needsCampaignAction || needsSocialAction || needsTemplateAction;
  
  // FIX: Detect internal trend requests (prioritize over SERP trends)
  const needsInternalTrends = /trend|trending/i.test(q) && 
    (/campaign|proposal|strategy|content|my|our/i.test(q) || needsCampaigns || needsProposals);
  
  // FIX: If asking about internal trends, force campaigns/performance categories
  if (needsInternalTrends) {
    console.log('📊 Internal trend analysis detected - prioritizing campaign/proposal data');
  }
  
  if (hasActionIntent) {
    console.log('🎯 Action intent detected - write/update/delete/send operation');
  }
  
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
  if (needsKeywords && !needsInternalTrends) categories.push('keywords');
  if (needsSolutions) categories.push('solutions');
  if (needsProposals) categories.push('proposals');
  if (needsSEO && !needsInternalTrends) categories.push('seo');
  if (needsCampaigns || needsInternalTrends) categories.push('campaigns');
  if (needsCompetitors) {
    categories.push('competitors');
    // Remove 'solutions' if competitor intent is stronger to avoid confusion
    const idx = categories.indexOf('solutions');
    if (idx > -1 && !needsSolutions) categories.splice(idx, 1);
  }
  if (needsAnalytics) categories.push('analytics');
  if (needsPerformance || needsInternalTrends) categories.push('performance');
  if (needsEngage || needsSocial) categories.push('engage');
  if (needsApprovals) categories.push('approvals');
  if (needsCalendar) categories.push('calendar');
  if (needsResearch) categories.push('research');
  // glossary removed
  if (needsSocial) categories.push('social');
  if (hasActionIntent) categories.push('action');
  
  // New category detections for expanded read tools
  const needsTemplates = /template|email template|newsletter template|reusable email/i.test(q);
  const needsTopicClusters = /topic cluster|pillar|topical authority|cluster performance/i.test(q);
  const needsContentGaps = /content gap|missing topic|gap analysis|what.*(miss|lack|don't cover)/i.test(q);
  const needsRecommendations = /recommend|suggestion|what should i|next step|strategic advice|action item/i.test(q);
  const needsRepurposed = /repurpos|reformat|content variation|different format|converted content/i.test(q);
  const needsEmailThreads = /inbox|email thread|recent email|email message|did.*reply/i.test(q);
  const needsActivityLog = /activity|what happened|audit|event log|workspace history|recent event/i.test(q);
  const needsBrandVoice = /brand voice|brand guideline|tone of voice|writing style|brand personality|how should i write|do.*don't.*phrase/i.test(q);
  const needsContentPerformance = /page view|traffic|impression|click through|bounce rate|session duration|ctr|content performance|real analytics/i.test(q);
  
  if (needsTemplates) categories.push('templates');
  if (needsTopicClusters) categories.push('topic_clusters');
  if (needsContentGaps) categories.push('content_gaps');
  if (needsRecommendations) categories.push('recommendations');
  if (needsRepurposed) categories.push('repurposed');
  if (needsEmailThreads) categories.push('email_threads');
  if (needsActivityLog) categories.push('activity_log');
  if (needsBrandVoice) categories.push('brand_voice');
  if (needsContentPerformance) categories.push('content_performance');
  
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
  
  // Detect panel hints for repository and approvals
  const repositoryPatterns = /find\s+(my|the)\s+(blog|article|content|post)|show\s+(my|me)\s+(content|articles|blogs|posts)|what\s+did\s+i\s+write|open\s+(my\s+)?(content\s+)?library|read\s+my\s+(article|blog|post)|search\s+(my\s+)?content|browse\s+(my\s+)?content/i;
  const approvalsPatterns = /pending\s+(approval|review)|what('s|\s+is)\s+pending|approve\s+the|reject\s+the|items?\s+need\s+review|show\s+(my\s+)?approvals|needs?\s+(my\s+)?review/i;
  
  let panelHint: 'repository' | 'approvals' | null = null;
  if (repositoryPatterns.test(q)) {
    panelHint = 'repository';
    console.log('📂 Repository panel hint detected');
  } else if (approvalsPatterns.test(q) || (needsApprovals && !hasActionIntent)) {
    panelHint = 'approvals';
    console.log('✅ Approvals panel hint detected');
  }

  return {
    scope,
    categories,
    estimatedTokens: tokenEstimates[scope],
    requiresVisualData,
    confidence: categories.length > 0 ? 0.8 : 0.5,
    isConversational: false,
    panelHint
  };
}
