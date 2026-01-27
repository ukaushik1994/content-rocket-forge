

# Remaining Mock Data Elimination - Implementation Plan

## Executive Summary

After auditing all files, **16 of 32 issues remain unresolved**. This plan covers the remaining work to ensure all user-facing outputs contain real, dynamic data.

---

## Remaining Issues by Priority

### Priority 1: Critical User-Facing Mock Data (6 issues)

#### Issue 1: API Settings Uses Random Status
**File:** `src/components/settings/APISettings.tsx` (lines 140-148)

**Current Problem:**
```typescript
const random = Math.random();
const status = provider.required 
  ? (random > 0.3 ? 'connected' : random > 0.1 ? 'warning' : 'error')
  : (random > 0.5 ? 'connected' : random > 0.2 ? 'warning' : 'error');
```

**Fix:** Query `ai_service_providers` table for real connection status, check `is_active` and `last_validated_at` fields.

---

#### Issue 2: GDPR Export Uses Sample Data
**File:** `src/components/enterprise/SecurityCompliancePanel.tsx` (lines 211-229)

**Current Problem:**
```typescript
data: {
  profile: { email: user?.email, created: '2024-01-01' },
  content: ['Sample content item 1', 'Sample content item 2'],
  analytics: { totalViews: 1500, totalEngagement: 250 }
}
```

**Fix:** Query actual user data from `content_items`, `content_analytics`, and `profiles` tables.

---

#### Issue 3: Webhook Test Uses Sample Data
**File:** `src/components/enterprise/ThirdPartyIntegrations.tsx` (lines 229-235)

**Current Problem:**
```typescript
data: {
  content_type: 'blog_post',
  title: 'Sample AI Generated Content',
  word_count: 1200,
  seo_score: 85
}
```

**Fix:** Fetch most recent content item from database for realistic webhook test payload.

---

#### Issue 4: SEO Recommendations Uses Dummy Score
**File:** `src/components/approval/seo/SeoRecommendations.tsx` (lines 171-198)

**Current Problem:**
```typescript
function calculateSeoScore(content: ContentItemType): number {
  // Dummy calculation
  let score = 50;
  if (content.content && content.content.length > 0) score += 10;
  // ...
}
```

**Fix:** Use the existing `useSeoAnalysis` hook for comprehensive SEO scoring.

---

#### Issue 5: Performance Card Uses Static Metrics
**File:** `src/components/content-builder/final-review/technical/PerformanceAnalysisCard.tsx` (lines 29-51)

**Current Problem:**
```typescript
const defaultMetrics: PerformanceMetric[] = [
  { name: 'Largest Contentful Paint', value: 2.1, ... },
  { name: 'First Input Delay', value: 45, ... },
  { name: 'Cumulative Layout Shift', value: 0.08, ... }
];
```

**Fix:** Calculate estimated metrics from content analysis or show "Publish to measure" state.

---

#### Issue 6: Content Download (DOCX/PDF) Not Functional
**File:** `src/components/content-builder/steps/save/useSaveStep.ts`

**Current Problem:** HTML export works, but DOCX and PDF exports need implementation.

**Fix:** 
- DOCX: Use a library like `docx` to generate real Word documents
- PDF: Use print-to-PDF approach or `html2canvas` + `jspdf`

---

### Priority 2: Edge Function Mock Data (4 issues)

#### Issue 7: Intelligent Workflow Mock Keyword Data
**File:** `supabase/functions/intelligent-workflow-executor/index.ts` (lines 1117-1122)

**Current Problem:**
```typescript
const keywordData = [
  { name: 'Primary Keywords', difficulty: 45, volume: 1200, opportunity: 85 },
  { name: 'Long-tail Keywords', difficulty: 25, volume: 800, opportunity: 92 },
  // ... STATIC
];
```

**Fix:** Query `serp_tracking_history` table and aggregate real keyword data by type.

---

#### Issue 8: API Proxy Mock Score
**File:** `supabase/functions/api-proxy/index.ts` (line 2095)

**Current Problem:**
```typescript
score: 0.7 // Mock score for now
```

**Fix:** Calculate quality score based on response characteristics (length, structure, error indicators).

---

#### Issue 9: AI Streaming Simulates Chunks
**File:** `supabase/functions/ai-streaming-chat/index.ts` (lines 256-267)

**Current Problem:**
```typescript
for (let i = 0; i < words.length; i++) {
  await new Promise(resolve => setTimeout(resolve, 50)); // FAKE
}
```

**Fix:** Implement true SSE streaming from AI provider, forwarding chunks directly to WebSocket.

---

#### Issue 10: Intelligent Workflow Random Chart Data
**File:** `supabase/functions/intelligent-workflow-executor/index.ts` (lines 1132-1135)

**Current Problem:**
```typescript
data: [
  { name: 'High Volume', value: Math.floor(Math.random() * 20) + 10, ... },
  { name: 'Medium Volume', value: Math.floor(Math.random() * 30) + 20, ... },
]
```

**Fix:** Use actual keyword counts from database query results.

---

### Priority 3: Stub Functions (4 issues)

#### Issue 11: ContentStrategyContext TODO
**File:** `src/contexts/ContentStrategyContext.tsx` (line 121)

**Current Problem:**
```typescript
setContentItems([]); // TODO: Load from content service when available
```

**Fix:** Query `content_items` table filtered by user ID and relevant statuses.

---

#### Issue 12: View Details Button TODO
**File:** `src/components/research/content-strategy/SelectedProposalsSidebar.tsx` (line 265)

**Current Problem:**
```typescript
// TODO: Add view details functionality
```

**Fix:** Navigate to proposal detail page or open a detail modal.

---

#### Issue 13: Provider Switching TODO
**File:** `src/services/serpPerformanceMonitoring.ts` (line 230)

**Current Problem:**
```typescript
// TODO: Implement provider switching logic
```

**Fix:** Update `user_preferences` table with best-performing provider.

---

#### Issue 14: Proposal Lifecycle Logging TODO
**File:** `src/services/proposalLifecycleService.ts` (line 297)

**Current Problem:**
```typescript
// TODO: Implement database logging when types are available
```

**Fix:** Create `proposal_lifecycle_logs` table and implement insert logic.

---

## Implementation Order

| Phase | Issues | Priority | Time Estimate |
|-------|--------|----------|---------------|
| 1 | API Status, GDPR Export, Webhook Test | Critical | 2 hours |
| 2 | SEO Recommendations, Performance Card | High | 2 hours |
| 3 | Content Export (DOCX/PDF) | High | 2 hours |
| 4 | Edge Function Mock Data (4 issues) | Medium | 3 hours |
| 5 | Stub Functions (4 issues) | Low | 2 hours |

**Total Remaining: ~11 hours**

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/settings/APISettings.tsx` | Query real provider status |
| `src/components/enterprise/SecurityCompliancePanel.tsx` | Fetch actual user data |
| `src/components/enterprise/ThirdPartyIntegrations.tsx` | Use real content for webhook |
| `src/components/approval/seo/SeoRecommendations.tsx` | Use useSeoAnalysis hook |
| `src/components/content-builder/final-review/technical/PerformanceAnalysisCard.tsx` | Content-based estimates |
| `src/components/content-builder/steps/save/useSaveStep.ts` | DOCX/PDF generation |
| `supabase/functions/intelligent-workflow-executor/index.ts` | Real keyword data |
| `supabase/functions/api-proxy/index.ts` | Calculated quality score |
| `supabase/functions/ai-streaming-chat/index.ts` | True streaming |
| `src/contexts/ContentStrategyContext.tsx` | Load content items |
| `src/components/research/content-strategy/SelectedProposalsSidebar.tsx` | View details navigation |
| `src/services/serpPerformanceMonitoring.ts` | Provider switching |
| `src/services/proposalLifecycleService.ts` | Database logging |

---

## New Database Table Required

```sql
CREATE TABLE proposal_lifecycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Testing Checklist

After implementation, verify:

- [ ] API Settings shows real connection status (not random)
- [ ] GDPR export contains actual user content, not samples
- [ ] Webhook test sends real recent content data
- [ ] SEO score uses comprehensive analysis, not dummy calculation
- [ ] Performance metrics show estimates or "pending" state
- [ ] DOCX download produces valid Word document
- [ ] PDF download produces valid PDF
- [ ] Edge function keyword data comes from database
- [ ] AI streaming uses real chunks, not word-by-word delays
- [ ] Content strategy loads actual content items
- [ ] View Details button navigates to proposal

