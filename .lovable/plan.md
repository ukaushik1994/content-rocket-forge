

# Fix: Chat Pre-generating Content + Wizard Step 4 Fallback Template

## Two Issues Identified

### Issue 1: Chat streams a full blog post BEFORE the wizard opens

**What happens today:**
1. User types "create a blog about AI marketing"
2. Phase 1: `ai-streaming` edge function streams a complete blog post into the chat (the system prompt at line 455 says "When generating content, produce the full content in your response")
3. Phase 2: After streaming finishes, intent detection triggers `launch_content_wizard` tool
4. Wizard sidebar opens -- but user already sees a full blog in the chat

**Root cause:** The `ai-streaming` system prompt (line 455) instructs the AI to "produce the full content in your response" for content creation requests. There's no awareness that certain intents should be handled by the wizard instead.

**Fix: Add wizard-intent detection to `ai-streaming` edge function**

File: `supabase/functions/ai-streaming/index.ts`

- Add a content-creation intent detector (similar to the greeting fast-path) that catches messages like "create a blog", "write an article", etc.
- When detected, stream a SHORT acknowledgment instead of full content: "I'll launch the Content Wizard to help you create this. Let me set that up..."
- This prevents the AI from writing 2000 tokens of blog content that gets discarded when the wizard opens

Additionally, update the system prompt (line 455) to add a rule:
```
- When the user asks to CREATE or WRITE content (blog, article, guide), DO NOT write the full content. 
  Instead, briefly acknowledge and say you'll use the Content Wizard to guide them through research, 
  outline, and generation. Keep your response under 2 sentences.
```

### Issue 2: Step 4 generates fallback template instead of AI prose

**What happens today:**
1. `generateContent()` in WizardStepGenerate calls `generateAdvancedContent(config)`
2. `generateAdvancedContent` calls `AIServiceController.generate(request, systemPrompt)`
3. `AIServiceController.generate` calls `callProvider()` which invokes `enhanced-ai-chat` edge function
4. `enhanced-ai-chat` is a CHAT function with tool-calling capabilities -- it's NOT optimized for long-form content generation
5. It either returns truncated content, tool calls instead of content, or fails
6. `generateAdvancedContent` returns `null`
7. WizardStepGenerate falls back to template: `"Write about ${s.title} here."`

**Root cause:** `AIServiceController.callProvider` routes through `enhanced-ai-chat` (line 620), which is a general chat function. For content generation, it should use `ai-proxy` directly (as specified in the architecture memory: "Direct interaction with ai-proxy is mandatory").

**Fix: Add a direct `ai-proxy` path for content generation in `generateAdvancedContent`**

File: `src/services/advancedContentGeneration.ts`

- Instead of going through `AIServiceController.generate()` (which routes through `enhanced-ai-chat`), call `supabase.functions.invoke('ai-proxy')` directly with the content generation prompt
- This matches the architecture pattern and gives the AI the full token budget for long-form content
- Add retry logic with a second provider if the first fails

The change replaces lines 127-145:
```typescript
// Get user's active provider
const { data: provider } = await supabase
  .from('ai_service_providers')
  .select('provider, api_key, preferred_model')
  .eq('status', 'active')
  .order('priority', { ascending: true })
  .limit(1)
  .single();

if (!provider) throw new Error('No AI provider configured');

// Call ai-proxy directly for content generation (not enhanced-ai-chat)
const { data, error } = await supabase.functions.invoke('ai-proxy', {
  body: {
    service: provider.provider,
    endpoint: 'chat',
    params: {
      model: provider.preferred_model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: Math.max(4000, config.targetLength * 2),
      temperature: 0.7,
    },
    apiKey: provider.api_key,
  }
});
```

This ensures the full prompt (with SERP data, outline, solution context) gets sent directly to the AI provider with adequate token limits, instead of being filtered through a chat function that may trigger tool calls or truncate output.

## Files to Modify

1. **`supabase/functions/ai-streaming/index.ts`** -- Add content-creation intent detection to suppress full blog generation in Phase 1 streaming. Short acknowledgment only.

2. **`src/services/advancedContentGeneration.ts`** -- Replace `AIServiceController.generate()` with direct `ai-proxy` invocation for reliable long-form content generation.

## Expected Result

- User says "create a blog about X" -> Chat shows brief "Launching the Content Wizard..." -> Wizard sidebar opens
- Wizard Step 4 "Generate" -> Full AI-generated prose (1000-2000+ words) based on outline, SERP data, and solution context
- No more "Write about X here" fallback templates

