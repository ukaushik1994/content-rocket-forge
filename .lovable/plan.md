

# Move "Detect my brand voice" button to Brand Guidelines section

## What
Remove the "Detect my brand voice" button from the AI chat welcome screen and add it to the Brand Guidelines display on the Offerings page, next to the existing action buttons (Re-extract, Quick Setup, Detailed Edit).

## Changes

### 1. `src/components/solutions/brand/BrandGuidelinesDisplay.tsx`
- Add state for published article count check (query `content_items` where `status = 'published'` and count ≥ 2)
- Add state for detecting (`isDetecting`)
- Add a "Detect my brand voice" button in the header action buttons row (line ~174), styled consistently with the existing buttons
- On click, call the `enhanced-ai-chat` edge function with message "Detect my brand voice from my published content", or more simply invoke the `auto_detect_brand_voice` tool logic directly via the edge function, then refresh brand guidelines
- Show the button only when user has 2+ published articles and `companyId` exists

### 2. `src/components/ai-chat/EnhancedChatInterface.tsx`
- Remove the `canDetectBrandVoice` state (line 103)
- Remove the useEffect block that checks published article count for brand voice (lines ~156-159)
- Remove the brand voice detection button JSX block (lines 638-654)

## Technical Notes
- The button on the offerings page will call the `enhanced-ai-chat` edge function directly with the brand voice detection message, or simply trigger `extractAndSaveBrandGuidelines`-style logic
- Since the brand guidelines page already has `handleReExtract` for website re-extraction, the new button provides AI-based voice detection from content instead
- Button style: similar to existing "Re-extract from Website" button with `Sparkles` icon

