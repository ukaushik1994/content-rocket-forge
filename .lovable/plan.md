

# Phase 2: Post-Save Actions Implementation

Building on the Phase 1 Quality Intelligence features already in place, Phase 2 adds three features that maximize what users can do with finished content.

---

## 2A. Inline Publish Menu (WordPress/Wix)

**What changes:** Replace the current "Publish" button (line 1273) with a dropdown menu that offers:
- "Save as Published" (current behavior)
- "Publish to WordPress" (shown only if WP connection is active)
- "Publish to Wix" (shown only if Wix connection is active)
- After successful external publish, show the published URL inline
- If no connection exists, show "Connect Website" link to settings

**Technical approach:**
- Add state: `activeConnection`, `isPublishingExternal`, `publishedUrl`
- On component mount (alongside existing context loading), call `getActiveConnection()` from `publishingService.ts` to detect WP/Wix
- Use a Popover (already available via radix) for the publish dropdown instead of replacing the button entirely
- On "Publish to WordPress/Wix" click, call `publishToWebsite()` with the content mapped to `PublishInput` format
- Show success URL in a small inline badge after publish

**Files modified:** `WizardStepGenerate.tsx` (new imports, state, publish dropdown UI)

---

## 2B. Image Generation Button in Toolbar

**What changes:** Add an ImagePlus icon button to the formatting toolbar (lines 1049-1072) in the Write tab.

**Technical approach:**
- Use the existing `generate-image` edge function and `ImageGenService` from `src/services/imageGenService.ts`
- Add state: `isGeneratingImage`
- On click, call `ImageGenService.generateImage()` with a prompt built from the content title + keyword
- On success, insert `![alt](url)` markdown at the cursor position in the textarea (reuse the `insertFormatting` pattern)
- Store the generated image reference in metadata when saving (already handled by the save flow's `generated_images` field)

**Files modified:** `WizardStepGenerate.tsx` (add ImagePlus button to toolbar, image gen handler)

---

## 2C. Post-Save Repurpose Quick Actions

**What changes:** After saving, show 4 repurpose chips on the success screen (lines 896-920): Social Post, Email, Ad Copy, Summary.

**Technical approach:**
- Add a "Repurpose" section below the existing success buttons
- Each chip reopens the Content Wizard in quick-format mode with:
  - The saved content pre-loaded as `additionalInstructions` context
  - The content type set to the chosen format (e.g., `social-twitter`, `email`, `google-ads`)
  - The keyword carried over
- This requires a new prop `onRepurpose` on `WizardStepGenerate` that the parent `ContentWizardSidebar` handles by resetting wizard state to step 0 with the new content type and pre-filled context
- The parent sidebar resets `currentStep` to the generate step (step 1 for quick formats) and sets the content type + additional instructions

**Files modified:**
- `WizardStepGenerate.tsx` (add repurpose buttons to success screen, add `onRepurpose` prop)
- `ContentWizardSidebar.tsx` (handle `onRepurpose` callback to reset wizard state for quick format flow)

---

## Implementation Order

```text
1. 2A: Inline Publish Menu
   - Add connection detection on mount
   - Replace Publish button with dropdown Popover
   - Wire up publishToWebsite() call
   - Show published URL on success

2. 2B: Image Generation in Toolbar  
   - Add ImagePlus button to formatting toolbar
   - Wire up ImageGenService.generateImage()
   - Insert markdown image at cursor

3. 2C: Post-Save Repurpose Actions
   - Add repurpose chips to success screen
   - Add onRepurpose prop + parent handler
   - Reset wizard state for quick format flow
```

---

## Summary of Changes

| File | What Changes |
|------|-------------|
| `WizardStepGenerate.tsx` | Publish dropdown with WP/Wix detection, ImagePlus toolbar button, repurpose chips on success screen, new `onRepurpose` prop |
| `ContentWizardSidebar.tsx` | Handle `onRepurpose` callback to reset wizard for quick-format repurposing |

No new files needed. No database changes. All services already exist and are reused as-is.

