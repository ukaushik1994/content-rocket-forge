

# Fix: Content Wizard Generation -- Full AI Prose + Offering Context

## Root Causes Found

### Bug 1: Wrong response path (THE main bug causing fallback templates)
In `src/services/advancedContentGeneration.ts` line 172, the content extraction path is:
```
aiData?.choices?.[0]?.message?.content
```
But the `ai-proxy` returns a NESTED structure:
```json
{ "success": true, "data": { "choices": [{ "message": { "content": "..." } }] }, "provider": "OpenAI" }
```
So the correct path is `aiData?.data?.choices?.[0]?.message?.content`. The current code always evaluates to `undefined`, which returns `null`, which triggers the "Write about X here" fallback in `WizardStepGenerate.tsx` line 280.

### Bug 2: Encrypted API key being sent
Line 162 passes `apiKey: provider.api_key` -- this is the encrypted value from the DB. The `ai-proxy` already decrypts the key automatically via `getApiKey(service, userId)` when the request has an auth header. Sending the encrypted value means `ai-proxy` uses it directly (encrypted) as the API key, causing provider auth failures. Fix: remove the `apiKey` field from the request body.

### Bug 3: `max_tokens` gets deleted for newer models
The `chatOpenAI` function (ai-proxy line 230-231) deletes `max_tokens` from the request body after converting it. But since the whole `params` object is spread into `requestBody` (line 211: `...params`), the `max_tokens` from our request gets caught in cleanup. This is actually handled correctly but worth noting.

### Issue 4: Solution context is shallow in the prompt
The `buildAdvancedContentPrompt` function (line 372-417) includes basic solution fields but truncates them:
- Features: only first 5
- Pain points: only first 3
- Use cases: only first 3
- Missing: `benefits`, `integrations`, `positioningStatement`, competitor details

The `AISolutionIntegrationService.createSolutionAwarePrompt` does add richer context but only when `contentType` AND `contentIntent` are both truthy (line 72). The wizard passes `contentIntent: 'inform'` which is fine, but `contentType` comes from `wizardState.contentArticleType` which defaults to... let me check.

Actually, looking at ContentWizardSidebar line 76, it defaults to empty. This means the condition on line 72 (`config.contentType && config.contentIntent`) may fail if contentArticleType is empty, skipping the rich solution context entirely.

## The Fix (2 files)

### File 1: `src/services/advancedContentGeneration.ts`

**A. Fix response extraction (line 172)**
Change from:
```typescript
const generatedContent = aiData?.choices?.[0]?.message?.content 
  || aiData?.content 
  || aiData?.text
  || (typeof aiData === 'string' ? aiData : null);
```
To:
```typescript
const generatedContent = aiData?.data?.choices?.[0]?.message?.content
  || aiData?.choices?.[0]?.message?.content
  || aiData?.data?.content
  || aiData?.content
  || aiData?.text
  || (typeof aiData === 'string' ? aiData : null);
```

**B. Remove encrypted apiKey from request (lines 149-164)**
Remove `apiKey: provider.api_key` from the `supabase.functions.invoke('ai-proxy')` body. The proxy already decrypts the key from the DB using the auth header.

**C. Enrich solution context in prompt (lines 372-417)**
Expand the solution section in `buildAdvancedContentPrompt` to include ALL available fields:
- All features (not just 5)
- All pain points (not just 3)
- All use cases (not just 3)
- Benefits array
- Integrations
- Positioning statement
- Competitor names and their strengths/weaknesses
- Full case study details (challenge, solution, results, testimonials)
- Pricing tiers
- Technical specs (platforms, API capabilities, security features)
- Metrics (adoption rate, ROI, customer satisfaction)

**D. Default contentType fallback (line 72)**
Change the condition to default to 'general' if contentType is empty:
```typescript
const effectiveContentType = config.contentType || 'general';
if (config.selectedSolution && effectiveContentType) {
```

### File 2: `src/components/ai-chat/content-wizard/ContentWizardSidebar.tsx`

**Default `contentArticleType`** to `'comprehensive'` instead of empty string in the initial wizard state (line ~75), ensuring the solution-aware prompt enrichment always runs.

## Expected Result

- "Generate" button in Step 4 produces 1000-2000+ word AI-written prose
- Content naturally integrates the selected offering's features, pain points, case studies, pricing, and competitive positioning
- No more "Write about X here" fallback templates
- Selecting GLC (or any offering) means its full context flows into the AI prompt

