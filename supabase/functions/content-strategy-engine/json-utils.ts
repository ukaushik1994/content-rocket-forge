/**
 * Strip markdown code fences from AI response
 * Handles: ```json ... ```, ```... ```, and raw JSON
 */
export function stripMarkdownCodeFence(text: string): string {
  if (!text) return '{}';
  
  let cleaned = text.trim();
  
  // Remove opening fence: ```json or ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  
  // Remove closing fence: ```
  cleaned = cleaned.replace(/\s*```\s*$/i, '');
  
  return cleaned.trim();
}

/**
 * Safe JSON parse with markdown stripping
 */
export function parseAIResponse<T = any>(text: string, fallback: T): T {
  try {
    const cleaned = stripMarkdownCodeFence(text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ JSON parse failed:', error);
    console.log('Raw text:', text.substring(0, 200));
    return fallback;
  }
}
