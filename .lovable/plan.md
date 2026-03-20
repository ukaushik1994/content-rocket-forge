

# Merge AI Provider Selector into AI Services Section

## Problem
AI providers appear twice: once as pill buttons at the top (DefaultAiProviderSelector), and again as individual cards inside the "AI Services" collapsible section.

## Solution
Remove the standalone `DefaultAiProviderSelector` from above the categories. Instead, embed the active-provider pill row **inside** the AI Services `CategorySection` — right above the provider cards. This gives a single, unified AI section.

## Changes

### 1. `ApiSettings.tsx` — Remove standalone selector
- Delete `<DefaultAiProviderSelector />` from line 120
- Pass `isAICategory` flag or render the selector inline inside the AI Services category block
- Render `DefaultAiProviderSelector` as the first child inside the AI Services `CategorySection`, before the provider cards

### 2. `DefaultAiProviderSelector.tsx` — Minor adjustments
- Remove the outer spacing/padding since it will now live inside `CategorySection`'s `pl-6` wrapper
- Keep the pill buttons + fallback toggle as-is (they look great)
- Add a subtle separator (thin line or small gap) between the pills row and the provider cards below

### 3. `CategorySection.tsx` — No changes needed
The component already accepts `children` — we just need to compose the selector + cards together as children for the AI category.

## Result
One unified "AI Services" section containing: active-provider pills → fallback toggle → individual provider cards. No duplication.

