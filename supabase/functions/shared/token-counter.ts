/**
 * Token counting utilities for AI context optimization
 * Approximate token estimation: 1 token ≈ 4 characters for English text
 */

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateObjectTokens(obj: any): number {
  if (!obj) return 0;
  return estimateTokens(JSON.stringify(obj));
}
