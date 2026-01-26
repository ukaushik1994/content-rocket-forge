
# Campaign Content Pipeline Fix Plan

## Executive Summary

I've verified the end-to-end content pipeline and found **one critical bug** that completely breaks content generation. The edge functions are deployed and working correctly, but the frontend has a **fatal ID format mismatch** that prevents any items from being queued.

---

## Current State Diagnosis

### Database Status
| Table | Count | Status |
|-------|-------|--------|
| campaigns | 1 | OK |
| content_generation_queue | 0 | Empty - items never inserted |
| content_items (with campaign_id) | 0 | No content generated |

### Edge Functions Status
| Function | Status | Test Result |
|----------|--------|-------------|
| process-content-queue | Deployed | Returns "No items to process" (correct - queue is empty) |
| campaign-content-generator | Deployed | Ready to receive work |

### RLS Policies on content_generation_queue
All policies correctly configured:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

---

## Root Cause: Asset ID Format Mismatch

### The Bug
The asset ID generation and parsing use **completely different formats**:

**Asset Generation (in `src/utils/assetGenerator.ts`):**
```typescript
// Line 25: Generates UUID format
id: uuidv4()  // Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

**Asset Parsing (in `src/pages/Campaigns.tsx`):**
```typescript
// Lines 237-241: Expects "campaignId-formatId-index" format
const parts = assetId.split('-');
const briefIndex = parseInt(parts[parts.length - 1], 10);  // Gets "ef1234567890" → NaN
const formatId = parts.slice(1, -1).join('-');  // Gets "e5f6-7890-abcd" → wrong!
```

### What Happens
1. User selects assets in `AssetGenerationModal`
2. `handleGenerate` is called with array of UUIDs: `["a1b2c3d4-e5f6-7890-abcd-ef1234567890", ...]`
3. `handleStartGeneration` parses UUIDs incorrectly
4. All briefs fail to match, fall back to placeholders
5. Items are created with wrong `formatId` values (garbage like "e5f6-7890-abcd")
6. Content generation fails silently or produces unusable content

---

## The Fix

### Option A: Fix ID Format (Recommended)
Change asset ID generation to use the expected format:

**File: `src/utils/assetGenerator.ts`**
```typescript
// Instead of:
id: uuidv4()

// Use:
id: `${campaignId}-${formatId}-${i}`  // e.g., "camp123-blog-0"
```

This creates IDs like `"abc123-blog-0"`, `"abc123-social-linkedin-1"`, which parse correctly.

### Option B: Fix ID Parsing (Alternative)
Keep UUIDs but pass full asset data instead of just IDs.

**Option A is cleaner** because:
- Single location change
- IDs become human-readable
- Matches the original design intent
- No need to refactor multiple components

---

## Implementation Plan

### Phase 1: Fix Asset ID Generation

**File:** `src/utils/assetGenerator.ts`

**Current (line 24-25):**
```typescript
assets.push({
  id: uuidv4(),
```

**Fixed:**
```typescript
assets.push({
  id: `${campaignId}-${formatId}-${i}`,
```

Also update the fallback function (line 122-123):
```typescript
// Current:
id: uuidv4(),

// Fixed:
id: `${campaignId}-${formatId}-${index}`,
```

### Phase 2: Improve handleStartGeneration Robustness

**File:** `src/pages/Campaigns.tsx` (lines 229-262)

Add validation and logging to catch future issues:

```typescript
const handleStartGeneration = async (assetIds: string[]) => {
  if (!currentCampaignId || !strategy || !user) return;
  
  try {
    const allBriefs = strategy.contentBriefs || [];
    
    console.log(`🎯 [Generation] Starting with ${assetIds.length} assets`);
    console.log(`📋 [Generation] Available briefs: ${allBriefs.length}`);
    
    const items = assetIds.map((assetId, index) => {
      // Parse assetId format: "campaignId-formatId-index"
      const parts = assetId.split('-');
      
      // Validate format
      if (parts.length < 3) {
        console.warn(`⚠️ Invalid asset ID format: ${assetId}`);
        return null;
      }
      
      const briefIndex = parseInt(parts[parts.length - 1], 10);
      const formatId = parts.slice(1, -1).join('-');
      
      // Validate parsed values
      if (isNaN(briefIndex)) {
        console.warn(`⚠️ Invalid brief index in asset ID: ${assetId}`);
        return null;
      }
      
      console.log(`🔍 [Generation] Asset ${index}: format=${formatId}, briefIndex=${briefIndex}`);
      
      // Find matching brief from strategy.contentBriefs
      const brief = allBriefs.find((b, i) => 
        ((b as any).formatId === formatId || (b as any).format === formatId) && i === briefIndex
      ) || allBriefs[briefIndex];
      
      if (!brief) {
        console.warn(`⚠️ No brief found for asset: ${assetId}`);
      }
      
      return {
        brief: brief || { 
          title: `Content ${index + 1}`, 
          description: strategy.description || '', 
          keywords: [],
          metaTitle: `Content ${index + 1}`,
          metaDescription: strategy.description || '',
          targetWordCount: 1000,
          difficulty: 'medium' as const,
          serpOpportunity: 50
        },
        formatId: formatId || 'blog',
        index: briefIndex
      };
    }).filter(Boolean);  // Remove null items
    
    if (items.length === 0) {
      console.error('❌ No valid items to queue');
      toast.error('Failed to process assets - invalid format');
      return;
    }
    
    console.log(`✅ [Generation] Queuing ${items.length} valid items`);
    
    // ... rest of the function
  } catch (error) {
    console.error('Error starting generation:', error);
    toast.error('Failed to start content generation');
  }
};
```

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `src/utils/assetGenerator.ts` | Fix ID format from UUID to structured ID | **Critical** |
| `src/pages/Campaigns.tsx` | Add validation and debug logging | High |

---

## Verification Steps

After implementing the fix:

1. **Create new campaign** and generate strategy
2. **Open Asset Generation Modal** - verify assets load
3. **Select assets and click Generate**
4. **Check database:**
   ```sql
   SELECT id, format_id, status FROM content_generation_queue LIMIT 10;
   ```
   Should show items with correct format_ids like "blog", "social-linkedin"

5. **Check edge function logs:**
   - `process-content-queue` should show processing activity
   - `campaign-content-generator` should show content creation

6. **Verify content:**
   ```sql
   SELECT id, title, campaign_id FROM content_items WHERE campaign_id IS NOT NULL;
   ```
   Should show generated content linked to campaign

---

## Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Queue insertion | 0% (broken) | 100% |
| Content generation | 0% (never triggered) | 90%+ |
| Pipeline completion | Broken | Fully functional |

---

## Estimated Effort

| Task | Time |
|------|------|
| Fix asset ID generation | 5 minutes |
| Add validation & logging | 10 minutes |
| Testing | 15 minutes |
| **Total** | **~30 minutes** |

This is a small, surgical fix that will unblock the entire content generation pipeline.
