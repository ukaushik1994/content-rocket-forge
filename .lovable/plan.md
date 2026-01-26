
# Campaign Module Complete Fix Plan

## Executive Summary

The Campaign Module has a **broken content generation pipeline** that prevents value delivery. This plan addresses all critical issues identified:

1. **Critical Pipeline Break** - Content never gets generated after strategy selection
2. **Hardcoded Statistics** - Hero shows fake numbers (12, 34, 8) instead of real data
3. **Fake Generation Queue** - `AssetGenerationQueue` doesn't actually generate content
4. **Disconnected Modal Flow** - `handleStartGeneration` doesn't insert items into queue
5. **Missing Real-time Feedback** - No visibility into generation progress

---

## Current State Analysis

### Database Reality (Confirmed)
| Table | Count | Issue |
|-------|-------|-------|
| campaigns | 1 | Only 1 campaign exists |
| content_items (with campaign_id) | 0 | **No content ever generated** |
| content_generation_queue | 0 | **Queue is empty** |

### Hero Statistics (Hardcoded - Lines 201, 211, 221)
- "12 Active Campaigns" → Actually: 0 active
- "34 Content Pieces Created" → Actually: 0
- "8 Completed" → Actually: 0 completed campaigns

---

## Root Cause: The Pipeline Break

```text
User Flow:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Strategy Select │ ──► │ Asset Modal     │ ──► │ Generate Button │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────────────────────────────────┐
                        │ handleStartGeneration (Campaigns.tsx:227)   │
                        │                                             │
                        │ CURRENT: Only updates status + sets state   │
                        │ MISSING: Does NOT call generateAllContent() │
                        │         Does NOT insert into queue table    │
                        └─────────────────────────────────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────────────────────────────────┐
                        │ AssetGenerationQueue (line 195-197)         │
                        │                                             │
                        │ FAKE: generateAssetContent just waits 2sec  │
                        │       await setTimeout(2000) then returns   │
                        └─────────────────────────────────────────────┘
```

### What Should Happen
```text
                        ┌─────────────────────────────────────────────┐
                        │ handleStartGeneration                       │
                        │                                             │
                        │ 1. Convert assetIds to briefs               │
                        │ 2. Call generateAllContent() hook           │
                        │    → Inserts into content_generation_queue  │
                        │    → Invokes process-content-queue function │
                        │ 3. Open real-time progress panel            │
                        └─────────────────────────────────────────────┘
                                                        │
                                                        ▼
                        ┌─────────────────────────────────────────────┐
                        │ process-content-queue Edge Function         │
                        │ (Already works correctly if queue populated)│
                        │                                             │
                        │ → Processes pending items                   │
                        │ → Calls campaign-content-generator          │
                        │ → Updates status in real-time               │
                        └─────────────────────────────────────────────┘
```

---

## Phase 1: Fix Critical Pipeline (Priority: URGENT)

### 1.1 Fix `handleStartGeneration` in `Campaigns.tsx`

**File:** `src/pages/Campaigns.tsx`

**Current Code (lines 227-239):**
```typescript
const handleStartGeneration = async (assetIds: string[]) => {
  if (!currentCampaignId) return;
  
  try {
    await campaignService.updateCampaignStatus(currentCampaignId, 'active');
    setGeneratingAssets(assetIds);  // Just sets UI state
    setIsAssetModalOpen(false);
    toast.success(`Starting generation of ${assetIds.length} assets...`);
  } catch (error) {
    // ...
  }
};
```

**Fixed Code:**
```typescript
const handleStartGeneration = async (
  assetIds: string[], 
  options?: { includeImages?: boolean; variationsPerFormat?: Record<string, number> }
) => {
  if (!currentCampaignId || !strategy || !user) return;
  
  try {
    // 1. Get content briefs from strategy
    const allBriefs = strategy.contentBriefs || [];
    
    // 2. Filter to selected asset IDs and build queue items
    const items = assetIds.map((assetId, index) => {
      // Parse assetId format: "campaignId-formatId-index"
      const parts = assetId.split('-');
      const formatId = parts.slice(1, -1).join('-');
      const briefIndex = parseInt(parts[parts.length - 1], 10);
      
      // Find matching brief
      const brief = allBriefs.find((b, i) => 
        (b.formatId === formatId || b.format === formatId) && i === briefIndex
      ) || allBriefs[briefIndex];
      
      return {
        brief: brief || { title: `Content ${index + 1}`, description: '', keywords: [] },
        formatId,
        index: briefIndex
      };
    }).filter(item => item.brief);

    // 3. Get solution data if available
    let solutionData = null;
    if (currentInput?.solutionId) {
      const { data } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', currentInput.solutionId)
        .single();
      solutionData = data;
    }

    // 4. Build campaign context
    const campaignContext = {
      title: strategy.title,
      description: strategy.description,
      targetAudience: strategy.targetAudience,
      goal: strategy.expectedEngagement
    };

    // 5. Call the queue-based generation system
    await generateAllContent(
      items,
      currentCampaignId,
      currentInput?.solutionId || null,
      campaignContext,
      solutionData,
      user.id
    );
    
    // 6. Update UI
    setIsAssetModalOpen(false);
    // Open the ContentGenerationPanel for real-time progress
    openGenerationPanel();
    
  } catch (error) {
    console.error('Error starting generation:', error);
    toast.error('Failed to start content generation');
  }
};
```

**Additional Changes:**
- Import `useCampaignContentGeneration` hook
- Import `ContentGenerationContext` for opening panel
- Remove the old `AssetGenerationQueue` component usage

### 1.2 Remove Fake Generation Queue

**File:** `src/pages/Campaigns.tsx`

**Remove lines 553-561:**
```typescript
{/* Asset Generation Queue - REMOVE THIS */}
{generatingAssets.length > 0 && strategy && currentCampaignId && (
  <AssetGenerationQueue
    assets={generateAssetListFromStrategy(strategy, currentCampaignId)
      .filter(a => generatingAssets.includes(a.id))}
    onComplete={handleGenerationComplete}
    onCancel={() => setGeneratingAssets([])}
  />
)}
```

**Replace with:**
```typescript
{/* Real-time Generation Panel via Context */}
<ContentGenerationProvider>
  <ContentGenerationPanel />
</ContentGenerationProvider>
```

### 1.3 Update AssetGenerationModal Props

**File:** `src/components/campaigns/assets/AssetGenerationModal.tsx`

Ensure `onGenerate` passes the options:
```typescript
interface AssetGenerationModalProps {
  // ...existing props
  onGenerate: (assetIds: string[], options: {
    includeImages: boolean;
    variationsPerFormat: Record<string, number>;
  }) => void;
}
```

---

## Phase 2: Fix Hardcoded Hero Statistics

### 2.1 Create Campaign Stats Hook

**New File:** `src/hooks/useCampaignStats.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CampaignStats {
  activeCampaigns: number;
  contentPiecesCreated: number;
  completedCampaigns: number;
  loading: boolean;
}

export const useCampaignStats = (): CampaignStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CampaignStats>({
    activeCampaigns: 0,
    contentPiecesCreated: 0,
    completedCampaigns: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Fetch active campaigns
        const { count: activeCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['active', 'planned']);

        // Fetch completed campaigns
        const { count: completedCount } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        // Fetch content pieces created for campaigns
        const { count: contentCount } = await supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('campaign_id', 'is', null);

        setStats({
          activeCampaigns: activeCount || 0,
          contentPiecesCreated: contentCount || 0,
          completedCampaigns: completedCount || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch campaign stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [user]);

  return stats;
};
```

### 2.2 Update CampaignsHero Component

**File:** `src/components/campaigns/CampaignsHero.tsx`

**Changes:**
1. Import and use the new hook
2. Replace hardcoded values with dynamic data
3. Add loading skeleton state

```typescript
// Add import
import { useCampaignStats } from '@/hooks/useCampaignStats';

// Inside component
const { activeCampaigns, contentPiecesCreated, completedCampaigns, loading } = useCampaignStats();

// Replace hardcoded "12" on line 201 with:
<span className="text-2xl font-bold text-foreground">
  {loading ? '-' : activeCampaigns}
</span>

// Replace hardcoded "34" on line 211 with:
<span className="text-2xl font-bold text-foreground">
  {loading ? '-' : contentPiecesCreated}
</span>

// Replace hardcoded "8" on line 221 with:
<span className="text-2xl font-bold text-foreground">
  {loading ? '-' : completedCampaigns}
</span>
```

---

## Phase 3: Real-time Progress Tracking

### 3.1 Enhance ContentGenerationPanel Integration

**File:** `src/pages/Campaigns.tsx`

Wrap the main content with ContentGenerationProvider:
```typescript
import { ContentGenerationProvider, useContentGeneration } from '@/contexts/ContentGenerationContext';

// Inside the return, wrap with provider
return (
  <ContentGenerationProvider>
    <div className="min-h-screen bg-background">
      {/* existing content */}
      <ContentGenerationPanel />
    </div>
  </ContentGenerationProvider>
);
```

### 3.2 Add Panel Open Function

**File:** `src/pages/Campaigns.tsx`

Create function to open the generation panel after queue insertion:
```typescript
const { openPanel } = useContentGeneration();

const openGenerationPanel = () => {
  if (strategy && currentCampaignId) {
    openPanel(currentCampaignId, strategy);
  }
};
```

---

## Phase 4: Error Recovery & UX Polish

### 4.1 Add Retry Mechanism for Failed Items

The existing `ContentGenerationPanel` already has retry functionality via `useContentQueue.retryItem()`. Ensure it's prominently displayed.

### 4.2 Show Generated Content Immediately

**File:** `src/components/campaigns/ContentGenerationPanel.tsx`

After an item completes, add a "View Content" button that navigates to Repository:
```typescript
// In the completed item render
{item.status === 'completed' && item.content_id && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => navigate(`/repository?content=${item.content_id}`)}
  >
    <Eye className="h-4 w-4 mr-1" />
    View
  </Button>
)}
```

---

## Phase 5: Delete Unused Code

### 5.1 Remove or Deprecate AssetGenerationQueue

**File:** `src/components/campaigns/assets/AssetGenerationQueue.tsx`

This component uses a fake `generateAssetContent` function. Options:
1. **Delete entirely** - It's replaced by ContentGenerationPanel
2. **Refactor** - Connect to real queue system (more work, less benefit)

**Recommendation:** Delete the file and remove imports.

### 5.2 Clean Up Unused State

**File:** `src/pages/Campaigns.tsx`

Remove:
```typescript
const [generatingAssets, setGeneratingAssets] = useState<string[]>([]);
```

And related handlers like `handleGenerationComplete`.

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `src/pages/Campaigns.tsx` | Fix handleStartGeneration, wrap with ContentGenerationProvider, remove fake queue | **Critical** |
| `src/hooks/useCampaignStats.ts` | **New file** - Fetch real campaign statistics | High |
| `src/components/campaigns/CampaignsHero.tsx` | Use real stats from hook | High |
| `src/components/campaigns/assets/AssetGenerationQueue.tsx` | **Delete file** | Medium |
| `src/components/campaigns/ContentGenerationPanel.tsx` | Add "View Content" button for completed items | Medium |

---

## Testing Checklist

After implementation:

1. **Create a new campaign**
   - [ ] Enter idea, generate strategy
   - [ ] Open Asset Generation Modal
   - [ ] Select assets and click "Generate"
   
2. **Verify queue insertion**
   - [ ] Check `content_generation_queue` table has new items
   - [ ] Items show status "pending" initially
   
3. **Verify processing**
   - [ ] `process-content-queue` edge function gets invoked
   - [ ] Items transition: pending → processing → completed
   - [ ] Content appears in `content_items` table
   
4. **Verify UI feedback**
   - [ ] ContentGenerationPanel shows real-time progress
   - [ ] Stats update on hero after completion
   - [ ] Toast notifications appear

5. **Verify error handling**
   - [ ] Failed items can be retried
   - [ ] Error messages are clear and actionable

---

## Success Metrics

| Metric | Before | After Target |
|--------|--------|--------------|
| Queue insertion rate | 0% | 100% |
| Content generation success | 0% | >90% |
| Real-time feedback | None | Full visibility |
| Statistics accuracy | 0% (hardcoded) | 100% (real data) |
| Pipeline completion | Broken | Fully functional |

---

## Estimated Effort

| Phase | Effort | Impact |
|-------|--------|--------|
| Phase 1: Fix Pipeline | 2-3 hours | **Critical** - Enables core functionality |
| Phase 2: Fix Stats | 1 hour | High - Shows real data |
| Phase 3: Progress Tracking | 1 hour | High - User confidence |
| Phase 4: Error Recovery | 1 hour | Medium - UX polish |
| Phase 5: Cleanup | 30 min | Low - Code hygiene |

**Total: ~6-7 hours of focused implementation**
