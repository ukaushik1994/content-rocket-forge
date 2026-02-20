

# Fix: Content Wizard Still Not Launching

## Root Cause

The `extractParams` function in the `launch_content_wizard` rule returns `null` when the user doesn't specify a topic (e.g., "create a blog" without "about X"). When `extractParams` returns `null`, line 189 of the intent detector treats this as "not enough info" and **skips the match entirely**.

This means the tool hint `launch_content_wizard` is never sent to the AI. The AI handles the message generically and asks for all details manually (Topic, Audience, Length, Tone, Points) -- exactly what we see in the screenshot.

```text
User: "create a blog"
  -> Pattern match: YES (line 49: /create (a)? blog/)
  -> extractParams: tries to find "about|on|for" -> NOT FOUND
  -> tries fallback -> NOT FOUND
  -> returns NULL
  -> Line 189: if (params === null) continue;  <-- SKIPS THE MATCH
  -> No tool hint sent
  -> AI responds generically: "What topic? What audience? What tone?"
```

## The Fix (1 file, 1 line)

**File: `src/utils/actionIntentDetector.ts`, line 60**

Change the `extractParams` function to return empty object `{}` instead of `null` when no keyword is found. This tells the system "wizard intent detected, but no keyword yet" -- which is the correct behavior. The edge function's tool definition already instructs the AI to ask for the topic before calling the tool.

Current (broken):
```
return null;  // <-- causes intent to be skipped
```

Fixed:
```
return {};    // <-- wizard detected, AI will ask for topic
```

This single change makes "create a blog", "write an article", "help me create content" all correctly trigger the `launch_content_wizard` tool hint, which the AI then handles by either:
- Asking for a topic (if none given), then calling the tool
- Directly calling the tool (if topic is in the message)

No other files need changes.

