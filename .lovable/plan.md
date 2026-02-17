

# Continue Implementation: Fix Build Error + Complete Wave 1 Integrations

## 1. Fix Build Error in SocialDashboard.tsx

The `<div className="flex gap-1">` on line 316 is missing its closing `</div>`. The `</Button>` on line 322 is followed by `</div>` which closes the outer flex container instead of the inner one.

**Fix**: Add the missing `</div>` after the `</Button>` on line 322, before the existing `</div>` on line 323.

## 2. Render AISocialWriterDialog in SocialDashboard.tsx

The dialog component is imported (line 31) and `showAIWriter` state exists (line 66), but the `<AISocialWriterDialog>` JSX is never rendered. 

**Fix**: Add the dialog render before the closing `</motion.div>` at line 583, passing `showAIWriter`, `setShowAIWriter`, and an `onInsert` handler that populates the post content.

## 3. Integrate AIBriefingCard into ActivityLog.tsx

The `AIBriefingCard` component exists but is not imported or rendered in `ActivityLog.tsx`.

**Fix**: Import `AIBriefingCard` and render it at the top of the feed view (after the stat grid on line 159), so users see the AI-generated daily briefing card first when viewing the activity feed.

## Technical Details

### Files Modified
- `src/components/engage/social/SocialDashboard.tsx` -- Fix missing closing div tag (line 323), add AISocialWriterDialog render
- `src/components/engage/activity/ActivityLog.tsx` -- Import and render AIBriefingCard in the feed view

### No new files, no DB changes, no edge function changes needed.
