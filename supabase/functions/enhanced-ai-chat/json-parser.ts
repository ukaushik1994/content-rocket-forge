/**
 * Enhanced JSON extraction utility for AI responses
 */

export function extractJSONBlocks(text: string): any[] {
  const jsonBlocks: any[] = [];
  
  // Pattern 1: Multiline JSON blocks in code fences
  const codeBlockPattern = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/gm;
  let codeMatch;
  while ((codeMatch = codeBlockPattern.exec(text)) !== null) {
    try {
      const cleaned = cleanJSONString(codeMatch[1]);
      const parsed = JSON.parse(cleaned);
      jsonBlocks.push(parsed);
    } catch (e) {
      console.log('Code block JSON parse failed:', e);
      const fixed = attemptJSONFix(codeMatch[1]);
      if (fixed) {
        jsonBlocks.push(fixed);
      }
    }
  }
  
  // Pattern 2: Standalone JSON objects (handle multiline)
  const standaloneJsonPattern = /(?:^|\n)\s*(\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\})\s*(?:\n|$)/gm;
  let standaloneMatch;
  while ((standaloneMatch = standaloneJsonPattern.exec(text)) !== null) {
    try {
      const cleaned = cleanJSONString(standaloneMatch[1]);
      const parsed = JSON.parse(cleaned);
      // Only include if it looks like structured data (has expected fields)
      if (isValidStructuredData(parsed)) {
        jsonBlocks.push(parsed);
      }
    } catch (e) {
      console.log('Standalone JSON parse failed:', e);
      const fixed = attemptJSONFix(standaloneMatch[1]);
      if (fixed && isValidStructuredData(fixed)) {
        jsonBlocks.push(fixed);
      }
    }
  }
  
  // Phase 3: Detect and repair truncated JSON blocks
  const truncatedJsonPattern = /```json\s*(\{[\s\S]*?)$/gm;
  let truncatedMatch;
  
  while ((truncatedMatch = truncatedJsonPattern.exec(text)) !== null) {
    try {
      // Attempt to close open brackets
      let jsonStr = truncatedMatch[1].trim();
      const openBraces = (jsonStr.match(/\{/g) || []).length;
      const closeBraces = (jsonStr.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        jsonStr += '}'.repeat(openBraces - closeBraces);
        console.warn('⚠️ Repaired truncated JSON block by adding closing braces');
        
        const parsed = JSON.parse(jsonStr);
        if (isValidStructuredData(parsed)) {
          jsonBlocks.push(parsed);
        }
      }
    } catch (e) {
      console.error('❌ Failed to repair truncated JSON:', e);
    }
  }
  
  return jsonBlocks;
}

function cleanJSONString(jsonStr: string): string {
  return jsonStr
    .trim()
    .replace(/^\s*```(?:json)?\s*/, '') // Remove opening code fence
    .replace(/\s*```\s*$/, '') // Remove closing code fence
    .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
    .trim();
}

function isValidStructuredData(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  
  // Check for visualData structure
  if (obj.visualData && typeof obj.visualData === 'object') return true;
  
  // Check for actions structure
  if (Array.isArray(obj.actions)) return true;
  
  // Check if it's a direct visualData object
  if (obj.type && (obj.metrics || obj.charts || obj.data || obj.headers)) return true;
  
  // Check for chart configuration
  if (obj.chartConfig && obj.chartConfig.type && obj.chartConfig.data) return true;
  
  // Reject CSV-like or raw data objects
  if (typeof obj === 'object' && Object.keys(obj).length > 10 && 
      Object.values(obj).every(v => typeof v === 'string' || typeof v === 'number')) {
    return false; // Likely CSV data
  }
  
  return false;
}

function attemptJSONFix(jsonString: string): any | null {
  try {
    // Clean and fix common JSON issues
    let fixed = cleanJSONString(jsonString)
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Add quotes to keys
      .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2') // Add quotes to string values
      .replace(/,\s*[}\]]/g, (match) => match.replace(',', '')) // Remove trailing commas
      .replace(/\n\s*/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return JSON.parse(fixed);
  } catch (e) {
    console.log('JSON fix attempt failed:', e);
    return null;
  }
}

export function removeExtractedJSON(text: string): string {
  // Remove JSON code blocks
  let cleaned = text.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gm, '');
  
  // Remove standalone JSON objects
  cleaned = cleaned.replace(/(?:^|\n)\s*\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}\s*(?:\n|$)/gm, '\n');
  
  // Remove CSV-like patterns that shouldn't be displayed
  cleaned = cleaned.replace(/^[A-Za-z\s,]+(?:,\s*[A-Za-z\s]+)*\n(?:[^,\n]*,\s*)*[^,\n]*$/gm, '');
  
  // Remove quoted CSV data patterns
  cleaned = cleaned.replace(/^"[^"]*"(?:,\s*"[^"]*")*$/gm, '');
  
  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  // If content becomes too minimal, preserve some context
  if (cleaned.length < 50 && text.length > 200) {
    // Extract any conversational parts that aren't data
    const lines = text.split('\n');
    const conversationalLines = lines.filter(line => 
      line.length > 10 && 
      !line.match(/^[A-Za-z\s,]+(?:,\s*[A-Za-z\s]+)*$/) && // Not CSV headers
      !line.match(/^"[^"]*"(?:,\s*"[^"]*")*$/) && // Not CSV data
      !line.match(/^\s*\{/) && // Not JSON
      !line.match(/^\s*\}/) &&
      !line.trim().match(/^[0-9,.\s]+$/) // Not just numbers and commas
    );
    cleaned = conversationalLines.slice(0, 3).join('\n');
  }
  
  return cleaned || text;
}