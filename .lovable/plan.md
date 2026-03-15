

## Short Answer

Your API keys are fine. The AI chat **never reaches the point of reading them** because it crashes immediately on startup.

The error `requiresVisualData is not defined` comes from a **stale cached file** (`query-analyzer.ts`) that Supabase's edge runtime compiled previously. We deleted the file from source, but the runtime is still using its old cached copy (visible in the stack trace: `file:///var/tmp/sb-compile-edge-runtime/enhanced-ai-chat/query-analyzer.ts:186:5`).

## Fix (one step)

Force-redeploy the `enhanced-ai-chat` edge function using the deploy tool. This clears the runtime cache and picks up the current source (which no longer has `query-analyzer.ts`).

No code changes needed — just a forced deployment of the existing function.

## After deploy

Send any message in the AI chat. If the response includes `deployVersion: "enhanced-ai-chat-v10-..."`, the fresh code is live and it will successfully read your API keys.

