/**
 * Enhanced JSON extraction utility for AI responses
 */

export function extractJSONBlocks(text: string): any[] {
  const jsonBlocks: any[] = [];
  
  // Pattern 1: Complete JSON objects
  const completeJsonPattern = /\{(?:[^{}]|{[^{}]*})*\}/g;
  const matches = text.match(completeJsonPattern) || [];
  
  for (const match of matches) {
    try {
      const parsed = JSON.parse(match);
      jsonBlocks.push(parsed);
    } catch (e) {
      // Try to fix common JSON issues
      const fixed = attemptJSONFix(match);
      if (fixed) {
        jsonBlocks.push(fixed);
      }
    }
  }
  
  // Pattern 2: Nested JSON within markdown code blocks
  const codeBlockPattern = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
  let codeMatch;
  while ((codeMatch = codeBlockPattern.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(codeMatch[1]);
      jsonBlocks.push(parsed);
    } catch (e) {
      const fixed = attemptJSONFix(codeMatch[1]);
      if (fixed) {
        jsonBlocks.push(fixed);
      }
    }
  }
  
  return jsonBlocks;
}

function attemptJSONFix(jsonString: string): any | null {
  try {
    // Common fixes for malformed JSON
    let fixed = jsonString
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Add quotes to keys
      .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2') // Add quotes to string values
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
    
    return JSON.parse(fixed);
  } catch (e) {
    console.log('JSON fix attempt failed:', e);
    return null;
  }
}