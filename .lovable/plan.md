

# Phase 4 Implementation Plan: Analytics Guidance & Image Generation Tools

## What's remaining

Phase 4 has two parts:
1. **Analytics guidance** — already mostly done in `brand-analytics-tools.ts` (graceful "no data" and "connect GA" messages exist). Minor improvement: add `image_generation` to DATA_CATEGORIES.
2. **Image generation tools** — `generate-image` edge function exists but NO corresponding tools are registered in `enhanced-ai-chat`. The frontend `GeneratedImageCard` and `VisualDataRenderer` already handle `visual_data.generatedImage` rendering. The missing piece is the tool definitions + execution + visual_data wiring.

---

## Changes

### 1. Create image generation tool definitions & executor
**New file:** `supabase/functions/enhanced-ai-chat/image-generation-tools.ts`

- Define two tools:
  - `generate_image` — accepts `prompt`, `size`, `quality`, `style`, `provider` (openai_image/gemini_image). Calls the existing `generate-image` edge function internally via fetch.
  - `edit_image` — accepts `prompt`, `source_image_url`, `provider`. Calls the same function with edit mode.
- API key detection: Before calling `generate-image`, check `ai_service_providers` for an active provider with image capability. If none found, return a friendly message directing user to Settings.
- Return shape: `{ success: true, generatedImage: { id, url, prompt, provider, model, createdAt } }` matching the `GeneratedImageData` interface the frontend expects.

### 2. Register tools in `tools.ts`
- Import `IMAGE_GENERATION_TOOL_DEFINITIONS`, `IMAGE_GENERATION_TOOL_NAMES`, `executeImageGenerationTool` from the new file.
- Add to `TOOL_DEFINITIONS` array.
- Add routing block in `executeToolCall` (before the `switch` statement, same pattern as other tool modules).
- Add cache invalidation entries: `generate_image: []`, `edit_image: []`.

### 3. Wire visual_data for image results in `index.ts`
- In the response builder section where tool results are processed, detect when a tool result contains `generatedImage` and inject it into the `visual_data` field of the SSE response so `VisualDataRenderer` picks it up.
- Add `'image_generation'` to `DATA_CATEGORIES` so image prompts trigger tool execution.

### 4. Add image-related intent detection
- In the inlined query analyzer in `index.ts`, add patterns like "generate image", "create image", "draw", "make a picture", "edit image" to map to category `'image_generation'`.

### 5. Deploy
- Deploy `enhanced-ai-chat` edge function after changes.

---

## Technical details

**Tool → Edge Function call pattern:**
The `generate_image` tool executor will call the existing `generate-image` edge function using the service role key (same Supabase instance, internal call via `SUPABASE_URL/functions/v1/generate-image`). This avoids duplicating the OpenAI/Gemini/LMStudio logic.

**Visual data injection:**
After tool execution, if the result contains `generatedImage`, the response builder sets `visual_data.generatedImage = result.generatedImage`. The existing `VisualDataRenderer` already renders this via `GeneratedImageCard`.

**No new migrations needed** — all tables (`ai_service_providers`, `content_items.generated_images`) already exist.

