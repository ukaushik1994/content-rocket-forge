

# Fix: AI Chat Not Using Tools (Critical Bug) + Add Name Search to Offerings Tool

## Root Cause

**Critical bug found**: The `TOOL_USAGE_MODULE` (which tells the AI when and how to use all 60+ tools) is computed with count placeholders replaced but **never appended to the system prompt**. The variable `toolUsageWithCounts` is built on lines 1882-1893 and then completely discarded. This means the AI has no instructions about its tools, doesn't know when to call `get_solutions`, and can't intelligently use any data-fetching tools.

This is why "earlier the AI was completely aware" — the module was likely being appended before a recent refactor broke it.

Additionally, the `get_solutions` tool lacks a `name` search parameter, unlike `get_competitors` which has `competitor_name` with ilike search.

## Changes

### File: `supabase/functions/enhanced-ai-chat/index.ts`

**Fix 1 — Append `toolUsageWithCounts` to system prompt (NORMAL path, ~line 1893):**
After the variable is built, add:
```
systemPrompt += '\n\n' + toolUsageWithCounts;
```

**Fix 2 — Same fix for HIGH token path (~line 1865):**
After `toolUsageWithCounts` is built, add:
```
systemPrompt += '\n\n' + toolUsageWithCounts;
```

### File: `supabase/functions/enhanced-ai-chat/tools.ts`

**Fix 3 — Add `name` search parameter to `get_solutions` tool definition (line 146-153):**
Add a `name` property:
```
name: { type: "string", description: "Search by offering/product name (case-insensitive partial match)" }
```

**Fix 4 — Add name filter to `get_solutions` execution (line 690-696):**
Add ilike filter when `toolArgs.name` is provided:
```
if (toolArgs.name) query = query.ilike('name', `%${toolArgs.name}%`);
```

Also update the tool description to explicitly mention: "Search by name to look up specific offerings."

### File: `supabase/functions/enhanced-ai-chat/index.ts` (TOOL_USAGE_MODULE)

**Fix 5 — Add example for name-based offering lookup (~line 1414-1427):**
```
- User: "Tell me about GL Connect" → Call get_solutions with name="GL Connect"
```

## Impact

These fixes restore the AI's full tool awareness and add targeted name-based offering search — solving both the "AI doesn't know about offerings" issue and the broader "AI stopped being smart" regression.

