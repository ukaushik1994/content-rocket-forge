
# Self-Learning Content Engine: Complete Integration Plan

## Current State Assessment

### What's Already Built

| Integration | Status | Notes |
|------------|--------|-------|
| **GA4** | ⚠️ Partial | Edge function exists but uses legacy Universal Analytics API (v3). GA4 requires Data API v1. Currently falls back to mock data. |
| **GSC** | ⚠️ Partial | Edge function exists and can fetch search analytics, but requires Service Account JSON in Settings. |
| **PageSpeed Insights** | ❌ Missing | Only pre-publication estimates exist. No live PSI API integration. |
| **Heatmap (Hotjar/Clarity)** | ❌ Missing | No integration. Architecture is ready for it. |
| **Image Generation** | ✅ Complete | OpenAI DALL-E, Gemini Image, LM Studio all working. |
| **Video Generation** | ✅ Complete | Runway ML, Kling AI, Replicate all working with async polling. |

### Critical Issue Found
The `google-analytics-fetch` edge function uses the **deprecated Universal Analytics API** (`ga:pageviews`, `ga:sessions`). Universal Analytics was sunset in July 2023. For GA4 properties, you need the **Google Analytics Data API v1** with different field names (`sessions`, `screenPageViews`, etc.).

---

## Phase 1: Fix Analytics Connections (Foundation)

### 1.1 Upgrade GA4 Edge Function
**File:** `supabase/functions/google-analytics-fetch/index.ts`

Update to use GA4 Data API v1:
- Change endpoint: `analyticsdata.googleapis.com/v1beta`
- Use GA4 metrics: `screenPageViews`, `sessions`, `engagementRate`
- Support Property ID format: `properties/123456789` (not View ID)
- Use Service Account authentication (already supported in shared/auth.ts)

### 1.2 Add Property ID Selection
**New Component:** `src/components/settings/integrations/GooglePropertySelector.tsx`

After Service Account is validated, allow user to:
- List available GA4 properties
- Select which property to track
- Store selection in `api_keys` metadata

### 1.3 GSC Site Verification
Ensure GSC connection includes:
- Site URL verification (user must add service account email to GSC)
- Clear setup instructions in Settings UI

---

## Phase 2: PageSpeed Insights Integration

### 2.1 New Edge Function
**File:** `supabase/functions/pagespeed-insights/index.ts`

```text
Input:  { url: string }
Output: {
  performance: 0-100,
  accessibility: 0-100,
  bestPractices: 0-100,
  seo: 0-100,
  coreWebVitals: {
    LCP: { value, score },
    FID: { value, score },
    CLS: { value, score },
    TTFB: { value, score }
  },
  opportunities: [
    { id, title, description, savings }
  ]
}
```

Uses Google PageSpeed Insights API (free, just needs API key).

### 2.2 Performance Dashboard
**New Component:** `src/components/analytics/PagePerformanceDashboard.tsx`

- Display Core Web Vitals with pass/fail badges
- Show performance opportunities from PSI
- Track historical performance over time
- Trigger automatic optimization suggestions

### 2.3 Database Table
**New Table:** `page_performance_metrics`

```sql
CREATE TABLE page_performance_metrics (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content_items(id),
  published_url TEXT NOT NULL,
  performance_score INTEGER,
  accessibility_score INTEGER,
  core_web_vitals JSONB,
  opportunities JSONB,
  measured_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 3: Heatmap Integration (Hotjar/Clarity)

### 3.1 Provider Selection
**New Settings Section:** `src/components/settings/integrations/HeatmapIntegration.tsx`

Support two providers:
- **Microsoft Clarity** (free, easier API)
- **Hotjar** (paid, richer data)

### 3.2 Clarity Edge Function
**File:** `supabase/functions/clarity-fetch/index.ts`

Fetch from Clarity API:
- Dead clicks (users clicking non-interactive elements)
- Rage clicks (frustration indicators)
- Scroll depth (how far users read)
- Session recordings metadata

### 3.3 Unified Behavior Model
Normalize heatmap data into standardized format:

```text
{
  engagement: {
    avgScrollDepth: 0.65,
    deadClicks: [],
    rageClicks: [],
    topInteractions: []
  },
  insights: [
    "65% of users don't scroll past the 3rd section",
    "CTA button has 23 dead clicks (users expect it to be clickable)"
  ]
}
```

---

## Phase 4: Self-Learning Content Engine

### 4.1 Performance Monitor Service
**File:** `src/services/performanceMonitorService.ts`

Orchestrates all data sources:

```text
┌─────────────────────────────────────────────────────────────┐
│                  PERFORMANCE MONITOR                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   GA4 ──────┐                                               │
│             │                                               │
│   GSC ──────┼──► Unified Performance Model ──► AI Analysis │
│             │                                               │
│   PSI ──────┤                                               │
│             │                                               │
│   Heatmap ──┘                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 AI Optimization Engine
**New Edge Function:** `supabase/functions/content-optimizer/index.ts`

Takes performance data + content → generates improved draft:

**Input:**
```json
{
  "contentId": "uuid",
  "currentContent": "...",
  "performanceData": {
    "ga4": { "bounceRate": 0.72, "avgEngagement": 45 },
    "gsc": { "avgPosition": 12.3, "ctr": 0.02 },
    "psi": { "lcp": 4.2, "opportunities": [...] },
    "heatmap": { "scrollDepth": 0.35, "rageClicks": [...] }
  }
}
```

**Output:**
```json
{
  "optimizedContent": "...",
  "changes": [
    { "type": "headline", "original": "...", "improved": "...", "reason": "Low CTR suggests headline isn't compelling" },
    { "type": "cta_placement", "action": "Move above fold", "reason": "Only 35% scroll past fold" }
  ],
  "predictedImpact": {
    "bounceRate": "-15%",
    "ctr": "+40%"
  }
}
```

### 4.3 Auto-Draft Workflow
**New Component:** `src/components/content/OptimizationSuggestions.tsx`

User flow:
1. System detects underperforming content (configurable thresholds)
2. Background job fetches all performance data
3. AI generates optimized draft
4. User receives notification: "3 content pieces need optimization"
5. Review side-by-side comparison
6. One-click approve or edit further

---

## Phase 5: Image/Video Verification

### 5.1 Provider Health Check
**New Service:** `src/services/mediaHealthService.ts`

Test all configured media providers:
- OpenAI Image: Generate test image
- Gemini Image: Generate test image
- Runway/Kling/Replicate: Submit test job and verify callback

### 5.2 Settings Status Dashboard
**Update:** `src/components/settings/api/ApiKeyCard.tsx`

Add visual health indicators:
- ✅ Connected & Working
- ⚠️ Connected but Quota Exhausted
- ❌ Invalid Credentials

### 5.3 Interactive Test
Allow users to run a quick test:
- "Generate a test image" button
- Shows result or error message
- Logs to troubleshoot issues

---

## Implementation Order

| Step | Task | Priority | Dependency |
|------|------|----------|------------|
| 1 | Fix GA4 edge function to use Data API v1 | Critical | None |
| 2 | Add PageSpeed Insights edge function | High | None |
| 3 | Create page_performance_metrics table | High | None |
| 4 | Build Performance Dashboard component | High | Steps 1-3 |
| 5 | Add Clarity/Hotjar integration | Medium | None |
| 6 | Build content-optimizer edge function | High | Step 4 |
| 7 | Create OptimizationSuggestions UI | High | Step 6 |
| 8 | Add media health check service | Medium | None |
| 9 | Scheduled performance monitoring job | Medium | Steps 1-5 |

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/google-analytics-fetch/index.ts` | Modify | Upgrade to GA4 Data API v1 |
| `supabase/functions/pagespeed-insights/index.ts` | Create | Fetch Core Web Vitals from PSI |
| `supabase/functions/clarity-fetch/index.ts` | Create | Fetch heatmap data from Clarity |
| `supabase/functions/content-optimizer/index.ts` | Create | AI-powered content optimization |
| `supabase/migrations/xxx_page_performance.sql` | Create | New performance metrics table |
| `src/services/performanceMonitorService.ts` | Create | Orchestrate all data sources |
| `src/services/mediaHealthService.ts` | Create | Test media generation providers |
| `src/components/analytics/PagePerformanceDashboard.tsx` | Create | Display Core Web Vitals |
| `src/components/content/OptimizationSuggestions.tsx` | Create | Show AI improvement drafts |
| `src/components/settings/integrations/HeatmapIntegration.tsx` | Create | Configure Clarity/Hotjar |

---

## Immediate Next Step

Since you mentioned you're "partially connected" - before building new features, we should verify what's actually working. I recommend:

1. **Test current GA4/GSC connections** in Settings to see exact error
2. **Verify image generation** by generating a test image
3. **Then proceed** with the Phase 1 fixes

This ensures we're building on a solid foundation.
