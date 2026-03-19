

# Remove Duplicate Recommendations from Welcome Screen

## Problem
The `aiRecommendations` array is displayed twice:
1. In **Column 1 (Quick Actions)** — `EnhancedQuickActions` receives `recommendations` prop and renders the top 2 as its first items
2. In **Column 3 (Recommended)** — the same `aiRecommendations` are rendered directly

This causes items like "Empty content calendar this week" and "3 proposal(s) waiting for action" to appear in both columns.

## Fix

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Stop passing `recommendations` to `EnhancedQuickActions` so column 1 only shows static quick actions. Column 3 remains the sole home for AI recommendations.

**File:** `src/components/ai-chat/EnhancedQuickActions.tsx`

Remove the `recommendations` prop and the proactive recommendations block (lines 40-49) so it only renders state-based and default actions.

