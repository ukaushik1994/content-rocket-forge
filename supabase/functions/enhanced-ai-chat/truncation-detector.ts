/**
 * Truncation Detection Utility
 * Detects incomplete AI responses
 */

export interface TruncationResult {
  isTruncated: boolean;
  confidence: number;
  reasons: string[];
}

export function detectTruncation(response: string): TruncationResult {
  const reasons: string[] = [];
  let confidence = 0;

  if (!response || response.length === 0) {
    return { isTruncated: false, confidence: 0, reasons: [] };
  }

  // Check for incomplete JSON blocks
  if (response.includes('```json') && !response.includes('```\n}')) {
    reasons.push('Incomplete JSON code block');
    confidence += 0.3;
  }

  // Check for mid-sentence cutoff
  if (response.endsWith(',') || response.endsWith('{') || response.endsWith('[')) {
    reasons.push('Response ends mid-structure');
    confidence += 0.25;
  }

  // Check for unclosed brackets
  const openBraces = (response.match(/\{/g) || []).length;
  const closeBraces = (response.match(/\}/g) || []).length;
  const openBrackets = (response.match(/\[/g) || []).length;
  const closeBrackets = (response.match(/\]/g) || []).length;

  if (openBraces > closeBraces) {
    reasons.push(`Unclosed braces (${openBraces - closeBraces} open)`);
    confidence += 0.3;
  }

  if (openBrackets > closeBrackets) {
    reasons.push(`Unclosed brackets (${openBrackets - closeBrackets} open)`);
    confidence += 0.2;
  }

  // Check for incomplete markdown code blocks
  const codeBlockCount = (response.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    reasons.push('Unclosed markdown code block');
    confidence += 0.25;
  }

  // Check if ends with "..."
  if (response.trim().endsWith('...') || response.trim().endsWith('…')) {
    reasons.push('Response ends with ellipsis');
    confidence += 0.15;
  }

  const isTruncated = confidence >= 0.4;

  return {
    isTruncated,
    confidence: Math.min(confidence, 1.0),
    reasons
  };
}

export function createFallbackVisualData(query: string, reason: string): any {
  console.log('🔄 Creating fallback visual data due to:', reason);
  
  return {
    type: 'chart',
    title: 'Data Visualization',
    subtitle: 'Response was incomplete - please retry',
    parseError: true,
    errorMessage: reason,
    chartConfig: null
  };
}
