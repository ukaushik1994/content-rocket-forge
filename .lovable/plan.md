

# Fix: User Input Not Visible + AI Not Aware of Offerings

## Issue 1: User Input Not Visible

Looking at the screenshots, the user's messages appear nearly invisible — the user bubble uses `bg-muted/30` with `text-foreground` on a dark theme, making it extremely low contrast. The card blends into the background.

**Fix in `EnhancedMessageBubble.tsx` (line 190-193):**
- Change user message styling from `bg-muted/30 border border-border/20` to a more visible style: `bg-primary/15 border border-primary/20` — gives a subtle but clearly distinct tint
- Also add a user avatar icon on the right side (currently only AI gets an avatar)

## Issue 2: AI Chat Not Aware of Offerings Data

The `get_solutions` tool (in `tools.ts` line 690-696) only fetches `id, name, description, created_at` — missing all the rich data: features, benefits, pain_points, target_audience, use_cases, unique_value_propositions, pricing_model, technical_specs, case_studies, positioning_statement, category, short_description.

**Fix in `supabase/functions/enhanced-ai-chat/tools.ts` (line 690-696):**
- Expand the select to include all key columns: `id, name, description, short_description, category, features, benefits, pain_points, target_audience, use_cases, unique_value_propositions, pricing_model, technical_specs, case_studies, positioning_statement, key_differentiators, created_at`
- This gives the AI full context about each offering to answer questions like "What's your view on GL Connect?"

Also update the tool description (line 144) to be more descriptive so the AI knows when to use it:
- `"Fetch solutions/products data including features, benefits, pain points, target audience, use cases, pricing, and technical specs. Use when user asks about their products, services, offerings, or solutions."`

### Files Changed

| File | Change |
|---|---|
| `src/components/ai-chat/EnhancedMessageBubble.tsx` | Update user bubble styling for better visibility; add user avatar |
| `supabase/functions/enhanced-ai-chat/tools.ts` | Expand `get_solutions` SELECT to include all offering fields; improve tool description |

