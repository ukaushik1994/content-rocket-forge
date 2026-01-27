
# Complete Mock Data Elimination Plan

## Executive Summary

After a thorough audit of the codebase, I identified **32 instances** of mock data, placeholder content, simulated behavior, and fake outputs across **7 categories**. This plan details how to replace every mock value with real, dynamic data to ensure users receive complete, production-ready outputs.

---

## Issue Categories & Counts

| Category | Count | Priority |
|----------|-------|----------|
| **A. Analytics & Metrics (Random Values)** | 8 | Critical |
| **B. Technical Review Scores (Hardcoded)** | 6 | High |
| **C. API Status (Random Simulation)** | 3 | High |
| **D. Export & Download (Non-functional)** | 3 | High |
| **E. Edge Function Mock Data** | 4 | Medium |
| **F. Simulated Delays (No Backend)** | 4 | Medium |
| **G. Stub Functions (TODOs)** | 4 | Low |

**Total: 32 Issues**

---

## Phase 1: Analytics & Metrics - Replace Random Values (Critical)

### Issue A1: Social Analytics Service Returns Random Numbers

**Current Problem:**
```typescript
// src/services/analytics/socialAnalyticsService.ts:17-21
return {
  platform: 'linkedin',
  views: Math.floor(Math.random() * 5000) + 1000,  // RANDOM
  engagement: Math.floor(Math.random() * 500) + 100,
  shares: Math.floor(Math.random() * 100) + 10,
  clicks: Math.floor(Math.random() * 300) + 50,
  conversions: Math.floor(Math.random() * 50) + 5
};
```

**Solution:**
1. Integrate with actual LinkedIn/Twitter APIs via user OAuth tokens
2. Store analytics data in `content_analytics` table with platform-specific columns
3. Fallback: Return null with explanation if no API connected

**Implementation:**
- Create edge function `fetch-social-analytics` that calls platform APIs
- Store results in `content_analytics.social_metrics` JSONB column
- Update service to fetch from database or call API if stale (>1 hour)

---

### Issue A2: Conversation Analytics Returns Hardcoded Values

**Current Problem:**
```typescript
// src/components/ai-chat/EnhancedStreamingInterface.tsx:76-86
return {
  totalMessages: 25,        // HARDCODED
  userMessages: 12,
  assistantMessages: 13,
  averageMessageLength: 150,
  conversationDuration: 1800000,
  actionsTriggered: 8,
};
```

**Solution:**
Query real data from `ai_messages` table:

```typescript
const getAnalytics = async () => {
  if (!activeConversationId) return null;
  
  const { data: messages } = await supabase
    .from('ai_messages')
    .select('role, content, created_at, message_status')
    .eq('conversation_id', activeConversationId)
    .order('created_at', { ascending: true });
    
  if (!messages?.length) return null;
  
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const firstMsg = new Date(messages[0].created_at);
  const lastMsg = new Date(messages[messages.length - 1].created_at);
  
  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    averageMessageLength: Math.round(
      messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length
    ),
    conversationDuration: lastMsg.getTime() - firstMsg.getTime(),
    actionsTriggered: messages.filter(m => m.message_status === 'action_triggered').length
  };
};
```

---

### Issue A3: Dashboard Stats Mock User ID

**Current Problem:**
```typescript
// src/components/dashboard/RealTimeDashboardStats.tsx:30-31
const userId = 'current-user';  // MOCK
```

**Solution:**
Use actual authenticated user from AuthContext:

```typescript
const { user } = useAuth();

useEffect(() => {
  if (user?.id) {
    loadRealTimeStats(user.id);
  }
}, [user?.id]);
```

---

### Issue A4: SERP Predictive Intelligence Uses Random Scores

**Current Problem:**
```typescript
// src/services/serpPredictiveIntelligence.ts:322-327
private static calculateTrendMomentum(serpData: EnhancedSerpResult): number {
  return Math.random() * 100; // Placeholder
}
private static calculateSeasonalityScore(serpData: EnhancedSerpResult): number {
  return Math.random() * 100; // Placeholder
}
```

**Solution:**
Calculate from actual SERP tracking history:

```typescript
private static calculateTrendMomentum(serpData: EnhancedSerpResult): number {
  // Use historical position changes from serp_tracking_history
  const positions = serpData.historicalRankings || [];
  if (positions.length < 2) return 50; // Neutral if insufficient data
  
  const recentAvg = positions.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = positions.slice(-3).reduce((a, b) => a + b, 0) / 3;
  
  // Higher score = improving rankings (lower position numbers)
  const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;
  return Math.max(0, Math.min(100, 50 + improvement));
}

private static calculateSeasonalityScore(serpData: EnhancedSerpResult): number {
  // Use search volume trends if available from SERP data
  const volumeTrend = serpData.volumeTrend || [];
  if (volumeTrend.length < 12) return 50;
  
  const stdDev = calculateStandardDeviation(volumeTrend);
  const avgVolume = volumeTrend.reduce((a, b) => a + b, 0) / volumeTrend.length;
  
  // High variance = high seasonality
  return Math.min(100, (stdDev / avgVolume) * 100);
}
```

---

### Issue A5: Action Analytics Uses LocalStorage Instead of Database

**Current Problem:**
```typescript
// src/services/actionAnalyticsService.ts:39-55
// Mock implementation - store in localStorage temporarily
const analyticsData = {...};
localStorage.setItem('ai-action-analytics', JSON.stringify(analytics));
```

**Solution:**
Create `ai_action_analytics` table and persist to database:

**Database Table:**
```sql
CREATE TABLE ai_action_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_label TEXT NOT NULL,
  conversation_id UUID REFERENCES ai_conversations(id),
  triggered_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN DEFAULT false,
  effectiveness_score NUMERIC(4,2),
  interaction_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_action_analytics_user ON ai_action_analytics(user_id);
CREATE INDEX idx_action_analytics_triggered ON ai_action_analytics(triggered_at);
```

---

### Issue A6: SERP Top Stories Count Hardcoded

**Current Problem:**
```typescript
// src/components/content/serp-analysis/SerpAnalysisContainer.tsx:241
count: 3, // Mock count for demo
```

**Solution:**
Calculate from actual SERP data:

```typescript
count: serpData?.top_stories?.length || 0,
```

---

### Issue A7: Sidebar Skeleton Width Random

**Current Problem:**
```typescript
// src/components/ui/sidebar.tsx:651-654
const width = React.useMemo(() => {
  return `${Math.floor(Math.random() * 40) + 50}%`
}, [])
```

**Solution:**
Use deterministic widths based on index for consistent skeleton:

```typescript
const widths = ['80%', '65%', '90%', '70%', '85%'];
const width = widths[index % widths.length];
```

---

### Issue A8: Enterprise GDPR Export Uses Sample Data

**Current Problem:**
```typescript
// src/components/enterprise/SecurityCompliancePanel.tsx:217-220
data: {
  profile: { email: user?.email, created: '2024-01-01' },
  content: ['Sample content item 1', 'Sample content item 2'],
  analytics: { totalViews: 1500, totalEngagement: 250 }
}
```

**Solution:**
Fetch actual user data from database:

```typescript
const exportUserData = async () => {
  const [contentItems, analyticsData, profileData] = await Promise.all([
    supabase.from('content_items').select('*').eq('user_id', user.id),
    supabase.from('content_analytics').select('*').eq('user_id', user.id),
    supabase.from('profiles').select('*').eq('id', user.id).single()
  ]);

  const userData = {
    user: user?.email,
    exportDate: new Date().toISOString(),
    data: {
      profile: profileData.data,
      content: contentItems.data || [],
      analytics: analyticsData.data || []
    }
  };
  // ... download logic
};
```

---

## Phase 2: Technical Review Scores - Replace Hardcoded Values (High)

### Issue B1-B4: Performance, Accessibility, Mobile, Schema Scores

**Current Problem:**
```typescript
// src/components/content-builder/final-review/technical/EnhancedTechnicalTabContent.tsx:33-36
const performanceScore = 78;    // HARDCODED
const accessibilityScore = 72;  // HARDCODED
const schemaScore = hasDocumentStructure ? 65 : 40;
const mobileScore = 85;         // HARDCODED
```

**Solution:**
Calculate real scores based on content analysis:

```typescript
const calculateTechnicalScores = () => {
  const hasMetaTitle = metaTitle && metaTitle.length > 0;
  const hasMetaDescription = metaDescription && metaDescription.length > 0;
  const hasDocumentStructure = documentStructure && Object.keys(documentStructure).length > 0;
  
  // SEO Score - based on actual meta analysis
  let seoScore = 0;
  if (hasMetaTitle) {
    seoScore += 25;
    if (metaTitle.length >= 30 && metaTitle.length <= 60) seoScore += 15;
  }
  if (hasMetaDescription) {
    seoScore += 25;
    if (metaDescription.length >= 120 && metaDescription.length <= 160) seoScore += 15;
  }
  if (documentStructure?.h1?.length === 1) seoScore += 10;
  if (documentStructure?.h2?.length >= 2) seoScore += 10;
  
  // Performance Score - based on content size and structure
  let performanceScore = 100;
  const contentLength = documentStructure?.totalWordCount || 0;
  if (contentLength > 3000) performanceScore -= 15; // Long content loads slower
  if (!documentStructure?.images?.every(img => img.hasAlt)) performanceScore -= 10;
  if (documentStructure?.externalLinks?.length > 10) performanceScore -= 5;
  
  // Accessibility Score - check heading hierarchy, alt text, link text
  let accessibilityScore = 50;
  const hasProperHeadingHierarchy = checkHeadingHierarchy(documentStructure);
  if (hasProperHeadingHierarchy) accessibilityScore += 25;
  if (documentStructure?.images?.every(img => img.hasAlt)) accessibilityScore += 15;
  if (documentStructure?.links?.every(link => link.text?.length > 0)) accessibilityScore += 10;
  
  // Schema Score - based on structured data opportunities
  let schemaScore = 0;
  if (hasDocumentStructure) schemaScore += 30;
  if (hasMetaTitle && hasMetaDescription) schemaScore += 20;
  if (documentStructure?.lists?.length > 0) schemaScore += 15; // FAQ potential
  if (documentStructure?.h2?.length >= 3) schemaScore += 15; // Article structure
  
  // Mobile Score - content-based estimates
  let mobileScore = 80;
  if (contentLength < 2000) mobileScore += 10; // Shorter loads faster
  if (documentStructure?.tables?.length > 2) mobileScore -= 15; // Tables break mobile
  if (documentStructure?.images?.length <= 5) mobileScore += 10;
  
  return {
    seo: Math.min(100, Math.max(0, seoScore)),
    performance: Math.min(100, Math.max(0, performanceScore)),
    accessibility: Math.min(100, Math.max(0, accessibilityScore)),
    schema: Math.min(100, Math.max(0, schemaScore)),
    mobile: Math.min(100, Math.max(0, mobileScore))
  };
};
```

---

### Issue B5: SEO Score Calculator Uses Basic Heuristics

**Current Problem:**
```typescript
// src/components/approval/seo/SeoRecommendations.tsx:171-180
function calculateSeoScore(content: ContentItemType): number {
  // Dummy calculation
  let score = 50;
  if (content.content && content.content.length > 0) score += 10;
  // ...
}
```

**Solution:**
Use the existing comprehensive SEO analysis from useSeoAnalysis hook:

```typescript
const { analyzeSeo } = useSeoAnalysis();

const calculateSeoScore = async (content: ContentItemType) => {
  const analysis = await analyzeSeo(content.content, {
    keyword: content.keywords?.[0],
    metaTitle: content.title,
    metaDescription: content.meta_description
  });
  
  return analysis.overallScore;
};
```

---

### Issue B6: Performance Card Uses Static Default Metrics

**Current Problem:**
```typescript
// src/components/content-builder/final-review/technical/PerformanceAnalysisCard.tsx:29-51
const defaultMetrics: PerformanceMetric[] = [
  { name: 'Largest Contentful Paint', value: 2.1, ... },  // STATIC
  { name: 'First Input Delay', value: 45, ... },
  { name: 'Cumulative Layout Shift', value: 0.08, ... }
];
```

**Solution:**
Calculate estimated metrics from content analysis or show "N/A - requires live page" message:

```typescript
// If content is published and has a URL, fetch real metrics
// Otherwise, show estimates or "pending" state

const estimatePerformanceMetrics = (content: string, images: number): PerformanceMetric[] => {
  const wordCount = content.split(/\s+/).length;
  const estimatedSize = wordCount * 6; // ~6 bytes per word average
  
  // LCP estimate based on content size
  const lcpEstimate = 1.5 + (images * 0.3) + (estimatedSize / 50000);
  
  return [
    {
      name: 'Largest Contentful Paint (Estimated)',
      value: Math.min(4.0, Math.max(1.0, lcpEstimate)),
      unit: 's',
      score: lcpEstimate < 2.5 ? 90 : lcpEstimate < 4.0 ? 60 : 30,
      threshold: { good: 2.5, needs_improvement: 4.0 },
      isEstimated: true
    },
    // ... similar for other metrics
  ];
};
```

---

## Phase 3: API Status - Replace Random Simulation (High)

### Issue C1-C2: API Provider Status Uses Math.random()

**Current Problem:**
```typescript
// src/components/settings/APISettings.tsx:141-145
// src/components/settings/api/ApiStatusDashboard.tsx:25-30
const random = Math.random();
const status = provider.required 
  ? (random > 0.3 ? 'connected' : random > 0.1 ? 'warning' : 'error')
  : (random > 0.5 ? 'connected' : random > 0.2 ? 'warning' : 'error');
```

**Solution:**
Check actual API key validity from `ai_service_providers` table:

```typescript
const getProviderStatus = async (provider: ApiProvider): Promise<'connected' | 'warning' | 'error' | 'unknown'> => {
  const { data, error } = await supabase
    .from('ai_service_providers')
    .select('is_active, last_validated_at, api_key')
    .eq('provider', provider.id)
    .eq('user_id', user.id)
    .single();
    
  if (error || !data) return 'unknown';
  if (!data.api_key) return 'error';
  if (!data.is_active) return 'warning';
  
  // Check if last validation was recent (within 1 hour)
  const lastValidated = new Date(data.last_validated_at);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  if (lastValidated < hourAgo) {
    return 'warning'; // Needs re-validation
  }
  
  return 'connected';
};

// Batch check all providers on mount
useEffect(() => {
  const checkAllStatuses = async () => {
    const statuses = await Promise.all(
      providers.map(async (p) => ({
        id: p.id,
        status: await getProviderStatus(p)
      }))
    );
    setProviderStatuses(Object.fromEntries(statuses.map(s => [s.id, s.status])));
  };
  
  checkAllStatuses();
}, [providers, user?.id]);
```

---

### Issue C3: Third-Party Webhook Uses Sample Data

**Current Problem:**
```typescript
// src/components/enterprise/ThirdPartyIntegrations.tsx:230-235
data: {
  content_type: 'blog_post',
  title: 'Sample AI Generated Content',
  word_count: 1200,
  seo_score: 85
}
```

**Solution:**
Use actual recent content data for webhook test:

```typescript
const testWebhook = async (webhookUrl: string) => {
  // Fetch most recent content item for realistic test
  const { data: recentContent } = await supabase
    .from('content_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  const testData = recentContent ? {
    content_type: recentContent.content_type,
    title: recentContent.title,
    word_count: recentContent.content?.split(/\s+/).length || 0,
    seo_score: recentContent.seo_score
  } : {
    // If no content exists, explain in the payload
    note: 'No content available - create content first for realistic tests',
    content_type: 'test',
    title: 'Webhook Test',
    word_count: 0,
    seo_score: 0
  };
  
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      triggered_from: window.location.origin,
      event_type: 'ai_content_generated',
      data: testData
    }),
  });
};
```

---

## Phase 4: Export & Download - Make Functional (High)

### Issue D1: Content Download is Fake

**Current Problem:**
```typescript
// src/components/content-builder/steps/save/useSaveStep.ts:212-220
setTimeout(() => {
  const link = document.createElement('a');
  link.href = '#';  // EMPTY HREF - DOWNLOADS NOTHING
  link.download = `${title}.${format}`;
  link.click();
}, 1000);
```

**Solution:**
Generate actual file content for each format:

```typescript
const handleDownload = async (format: 'pdf' | 'docx' | 'html') => {
  try {
    let blob: Blob;
    let mimeType: string;
    
    switch (format) {
      case 'html':
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeHtml(title)}</title>
  ${metaDescription ? `<meta name="description" content="${sanitizeHtml(metaDescription)}">` : ''}
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1 { color: #1a1a1a; } h2 { color: #333; margin-top: 2em; }
    p { margin: 1em 0; } img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <article>
    <h1>${sanitizeHtml(title)}</h1>
    ${content}
  </article>
</body>
</html>`;
        blob = new Blob([htmlContent], { type: 'text/html' });
        mimeType = 'text/html';
        break;
        
      case 'docx':
        // Use mammoth library (already installed) in reverse or docx library
        const docxContent = await generateDocx(title, content);
        blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
        
      case 'pdf':
        // Use html2canvas + jsPDF or call edge function
        const pdfBuffer = await generatePdf(title, content);
        blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        mimeType = 'application/pdf';
        break;
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Content exported as ${format.toUpperCase()}`);
  } catch (error) {
    console.error('Export failed:', error);
    toast.error(`Failed to export as ${format.toUpperCase()}`);
  }
};
```

---

### Issue D2: SEO Analysis Simulates with Delay

**Current Problem:**
```typescript
// src/contexts/content-builder/actions/seoActions.ts:12-16
await new Promise(resolve => setTimeout(resolve, 1000));
dispatch({ type: 'SET_SEO_SCORE', payload: 75 });  // HARDCODED 75
```

**Solution:**
Call actual SEO analysis function:

```typescript
const analyzeSeo = async (content: string) => {
  dispatch({ type: 'SET_SEO_ANALYZING', payload: true });
  
  try {
    // Call the real SEO analysis hook/service
    const analysis = await performSeoAnalysis(content, {
      keyword: state.keyword,
      metaTitle: state.metaTitle,
      metaDescription: state.metaDescription
    });
    
    dispatch({ type: 'SET_SEO_SCORE', payload: analysis.overallScore });
    dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: analysis.improvements });
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
  } catch (error) {
    console.error('SEO analysis failed:', error);
    toast.error('SEO analysis failed. Please try again.');
  } finally {
    dispatch({ type: 'SET_SEO_ANALYZING', payload: false });
  }
};
```

---

### Issue D3: Content Rewriter Has Simulated Delay

**Current Problem:**
```typescript
// src/hooks/useContentRewriter.ts:90
}, 1500); // Simulated delay
```

**Solution:**
The delay is wrapped around actual AI content generation. Remove the setTimeout wrapper and let the actual API call duration serve as the natural loading time:

```typescript
const generateRewrite = useCallback(async () => {
  if (!content || !selectedRecommendationId) return;
  
  setIsRewriting(true);
  
  try {
    const result = await generateContent({
      prompt: `Improve the following content based on this recommendation: ${recommendation}\n\nContent:\n${content}`,
      type: 'improvement'
    });
    
    setRewrittenContent(result || content);
    // ... rest of logic
  } catch (error) {
    console.error('Error generating rewritten content:', error);
    toast.error('Failed to generate improved content.');
    setRewrittenContent(content);
  } finally {
    setIsRewriting(false);
  }
}, [content, selectedRecommendationId, recommendation]);
```

---

## Phase 5: Edge Function Mock Data (Medium)

### Issue E1: Intelligent Workflow Returns Mock Keyword Data

**Current Problem:**
```typescript
// supabase/functions/intelligent-workflow-executor/index.ts:1116-1122
const keywordData = [
  { name: 'Primary Keywords', difficulty: 45, volume: 1200, opportunity: 85 },
  { name: 'Long-tail Keywords', difficulty: 25, volume: 800, opportunity: 92 },
  // ... STATIC DATA
];
```

**Solution:**
Parse actual keyword data from SERP analysis or user's keyword library:

```typescript
// Query user's actual keyword data
const { data: keywords } = await supabaseClient
  .from('serp_tracking_history')
  .select('keyword, search_volume, keyword_difficulty, competition_score')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);

const keywordData = keywords?.length > 0 
  ? aggregateKeywordsByType(keywords)
  : []; // Return empty if no data, let frontend show "no data" state

function aggregateKeywordsByType(keywords: any[]) {
  const primary = keywords.filter(k => k.keyword_difficulty > 40);
  const longTail = keywords.filter(k => k.keyword.split(' ').length >= 4);
  const brand = keywords.filter(k => k.competition_score < 30);
  
  return [
    { 
      name: 'Primary Keywords', 
      count: primary.length,
      avgDifficulty: average(primary.map(k => k.keyword_difficulty)),
      avgVolume: average(primary.map(k => k.search_volume))
    },
    // ... similar for other categories
  ];
}
```

---

### Issue E2: API Proxy Returns Mock Score

**Current Problem:**
```typescript
// supabase/functions/api-proxy/index.ts:2095
score: 0.7 // Mock score for now
```

**Solution:**
Extract confidence/quality score from AI response or calculate from response analysis:

```typescript
const analysis = data.choices[0].message.content;

// Calculate quality score based on response characteristics
const calculateQualityScore = (response: string): number => {
  let score = 0.5; // Base score
  
  // Length quality
  if (response.length > 500) score += 0.1;
  if (response.length > 1000) score += 0.1;
  
  // Structure quality (has sections, lists)
  if (response.includes('##') || response.includes('**')) score += 0.1;
  if (response.includes('- ') || response.includes('1. ')) score += 0.1;
  
  // No error indicators
  if (!response.toLowerCase().includes('error') && 
      !response.toLowerCase().includes('unable')) score += 0.1;
  
  return Math.min(1.0, score);
};

return new Response(JSON.stringify({ 
  success: true,
  data: {
    analysis,
    score: calculateQualityScore(analysis)
  }
}), ...);
```

---

### Issue E3: AI Streaming Simulates Chunks

**Current Problem:**
```typescript
// supabase/functions/ai-streaming-chat/index.ts:256-267
for (let i = 0; i < words.length; i++) {
  await new Promise(resolve => setTimeout(resolve, 50)); // FAKE STREAMING
}
```

**Solution:**
Implement true streaming from AI provider:

```typescript
// Request streaming from provider
const response = await fetch(providerUrl, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...params, stream: true })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
let fullContent = '';

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
  
  for (const line of lines) {
    const data = line.slice(6);
    if (data === '[DONE]') continue;
    
    try {
      const parsed = JSON.parse(data);
      const delta = parsed.choices?.[0]?.delta?.content || '';
      fullContent += delta;
      
      socket.send(JSON.stringify({
        type: 'ai_response_delta',
        delta,
        fullContent,
        timestamp: Date.now()
      }));
    } catch (e) { /* skip malformed chunks */ }
  }
}
```

---

### Issue E4: Outline Generation Simulates API Delay

**Current Problem:**
```typescript
// src/components/content-builder/outline/outlineGenerationUtils.ts:37-38
await new Promise(resolve => setTimeout(resolve, 3000));
```

**Solution:**
If local processing is sufficient, remove the delay. If AI is intended, call actual AI service:

```typescript
export async function generateOutlineFromSelections(
  mainKeyword: string,
  selectedItems: SerpSelection[],
  customInstructions: string
): Promise<OutlineSection[]> {
  const itemsByType = { /* grouping logic */ };

  // Option 1: Local processing (no delay needed)
  if (!customInstructions) {
    return createOutlineSections(mainKeyword, itemsByType);
  }
  
  // Option 2: AI-enhanced outline with custom instructions
  try {
    const { data, error } = await supabase.functions.invoke('generate-outline', {
      body: { mainKeyword, selectedItems, customInstructions }
    });
    
    if (error) throw error;
    return data.outline;
  } catch (error) {
    console.error('AI outline generation failed, using local:', error);
    return createOutlineSections(mainKeyword, itemsByType);
  }
}
```

---

## Phase 6: Stub Functions - Implement TODOs (Low)

### Issue G1: ContentStrategyContext TODO

**Location:** `src/contexts/ContentStrategyContext.tsx:121`
```typescript
setContentItems([]); // TODO: Load from content service when available
```

**Solution:**
```typescript
const { data: contentData } = await supabase
  .from('content_items')
  .select('*')
  .eq('user_id', user.id)
  .in('status', ['draft', 'approved']);
  
setContentItems(contentData || []);
```

---

### Issue G2: SelectedProposalsSidebar View Details TODO

**Location:** `src/components/research/content-strategy/SelectedProposalsSidebar.tsx:265`

**Solution:**
Navigate to proposal detail page or open detail modal:

```typescript
onClick={(e) => {
  e.stopPropagation();
  navigate(`/content-strategy/proposal/${proposal.id}`);
  // OR
  setSelectedProposalId(proposal.id);
  setShowDetailModal(true);
}}
```

---

### Issue G3: Provider Switching Logic TODO

**Location:** `src/services/serpPerformanceMonitoring.ts:230`

**Solution:**
Implement provider failover:

```typescript
if (bestProvider.successRate > 95) {
  await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      preference_key: 'preferred_serp_provider',
      preference_value: bestProvider.provider
    });
  
  console.log(`🔄 Switched to provider: ${bestProvider.provider}`);
}
```

---

### Issue G4: Proposal Lifecycle Logging TODO

**Location:** `src/services/proposalLifecycleService.ts:297`

**Solution:**
```typescript
private async logLifecycleUpdate(update: ProposalStatusUpdate): Promise<void> {
  await supabase
    .from('proposal_lifecycle_logs')
    .insert({
      proposal_id: update.proposalId,
      from_status: update.fromStatus,
      to_status: update.toStatus,
      changed_by: update.userId,
      reason: update.reason,
      metadata: update.metadata
    });
}
```

---

## Implementation Priority & Timeline

| Phase | Focus | Issues | Time |
|-------|-------|--------|------|
| 1 | Analytics & Metrics | A1-A8 | 6 hours |
| 2 | Technical Review Scores | B1-B6 | 4 hours |
| 3 | API Status | C1-C3 | 2 hours |
| 4 | Export & Download | D1-D3 | 4 hours |
| 5 | Edge Functions | E1-E4 | 4 hours |
| 6 | Stub Functions | G1-G4 | 2 hours |

**Total: ~22 hours**

---

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `src/services/analytics/socialAnalyticsService.ts` | 1 | Real API integration |
| `src/components/ai-chat/EnhancedStreamingInterface.tsx` | 1 | Query real conversation stats |
| `src/components/dashboard/RealTimeDashboardStats.tsx` | 1 | Use authenticated user ID |
| `src/services/serpPredictiveIntelligence.ts` | 1 | Real trend calculations |
| `src/services/actionAnalyticsService.ts` | 1 | Database persistence |
| `src/components/content/serp-analysis/SerpAnalysisContainer.tsx` | 1 | Dynamic counts |
| `src/components/ui/sidebar.tsx` | 1 | Deterministic skeleton widths |
| `src/components/enterprise/SecurityCompliancePanel.tsx` | 1 | Real GDPR export |
| `src/components/content-builder/final-review/technical/EnhancedTechnicalTabContent.tsx` | 2 | Calculated scores |
| `src/components/approval/seo/SeoRecommendations.tsx` | 2 | Real SEO scoring |
| `src/components/content-builder/final-review/technical/PerformanceAnalysisCard.tsx` | 2 | Estimated metrics |
| `src/components/settings/APISettings.tsx` | 3 | Real provider status |
| `src/components/settings/api/ApiStatusDashboard.tsx` | 3 | Database status check |
| `src/components/enterprise/ThirdPartyIntegrations.tsx` | 3 | Real content for webhooks |
| `src/components/content-builder/steps/save/useSaveStep.ts` | 4 | Real file generation |
| `src/contexts/content-builder/actions/seoActions.ts` | 4 | Real SEO analysis |
| `src/hooks/useContentRewriter.ts` | 4 | Remove simulated delay |
| `supabase/functions/intelligent-workflow-executor/index.ts` | 5 | Real keyword data |
| `supabase/functions/api-proxy/index.ts` | 5 | Calculated quality score |
| `supabase/functions/ai-streaming-chat/index.ts` | 5 | True streaming |
| `src/components/content-builder/outline/outlineGenerationUtils.ts` | 5 | Remove fake delay |

---

## Database Tables to Create

| Table | Purpose |
|-------|---------|
| `ai_action_analytics` | Store action tracking (replace localStorage) |
| `proposal_lifecycle_logs` | Track proposal status changes |

---

## Testing Checklist

After implementation, verify:

- [ ] Social analytics show "Connect account" if no API tokens, not random numbers
- [ ] Conversation analytics show real message counts
- [ ] Dashboard uses authenticated user ID
- [ ] API status reflects actual connection state (persists on refresh)
- [ ] Downloaded files contain actual content in correct format
- [ ] SEO scores change based on content analysis
- [ ] Technical review scores reflect document structure
- [ ] No random numbers appear in UI (grep for Math.random)
- [ ] No simulated delays without actual backend processing
- [ ] Edge functions return real data or clear "no data" states
