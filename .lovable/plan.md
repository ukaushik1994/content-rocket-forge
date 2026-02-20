

# Fix: Content Wizard Not Launching from Chat

## Root Cause

When a user types "create a blog", the intent detection system (`actionIntentDetector.ts`) matches the **wrong tool**. The `ACTION_RULES` array is evaluated top-to-bottom, first match wins:

```text
Rule at line 46:  create_content_item  (matches "create a blog")  <-- WINS (wrong)
Rule at line 366: launch_content_wizard (matches "create a blog")  <-- never reached
```

So Phase 2 sends a tool hint for `create_content_item` instead of `launch_content_wizard`. The AI then asks for title, body, audience details manually instead of opening the wizard sidebar.

## Fix (1 file)

### File: `src/utils/actionIntentDetector.ts`

**Move the `launch_content_wizard` rule ABOVE the `create_content_item` rule** in the `ACTION_RULES` array.

Additionally, narrow the `create_content_item` patterns to only match explicit save/store actions (not "create a blog" which should always go to the wizard):

Current `create_content_item` patterns:
- `(create|write|generate) (a)? (new)? (blog post|article|content|draft)` -- this is too broad, catches wizard-intended messages

Updated `create_content_item` patterns:
- `(save|store) (this|that|it) (as)? (a)? (draft|blog|post|article|content)` -- keep these
- `(publish|save) (this|the) (blog|post|article|content)` -- keep these
- Remove the `(create|write|generate)` pattern from this rule since the wizard handles creation

The wizard rule already has the right patterns:
- `(create|write|build|make) (a)? (new)? (blog|article|guide|content) (about|on|for)`
- `(help me)? (create|write|build) (a)? (blog|article|guide)`
- `create (a)? blog`
- `write (an)? article`

### Changes Summary

1. Move the `launch_content_wizard` block (lines 366-406, both user and AI-response rules) to the TOP of the `ACTION_RULES` array, before `create_content_item`
2. Remove the overly broad pattern `/(create|write|generate)\s+(a\s+)?(new\s+)?(blog\s*post|article|content|draft)/i` from `create_content_item` -- this pattern now belongs to the wizard
3. Keep `create_content_item` for explicit save/store/publish patterns only

This ensures any "create a blog", "write an article", "help me create content" message triggers the Content Wizard sidebar instead of the raw content creation tool.

## Technical Details

```text
ACTION_RULES order change:

BEFORE:
  [0] create_content_item  (catches "create a blog" -- WRONG)
  ...
  [N] launch_content_wizard (never reached)

AFTER:
  [0] launch_content_wizard (catches "create a blog" -- CORRECT)
  ...
  [N] create_content_item   (only catches "save this as draft")
```

No other files need changes -- the tool execution pipeline, `visualData` promotion, and sidebar rendering all work correctly once the right tool name is detected.
