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
  // STEP 1: Protect markdown tables by replacing with placeholders
  const tablePattern = /\|[^\n]+\|[\s\S]*?\n\|[-:\s|]+\|[\s\S]*?(?:\n\|[^\n]+\|)*/gm;
  const tables: string[] = [];
  let textWithPlaceholders = text.replace(tablePattern, (match) => {
    const placeholder = `__TABLE_PLACEHOLDER_${tables.length}__`;
    tables.push(match);
    return placeholder;
  });
  
  // STEP 2: Remove JSON code blocks
  let cleaned = textWithPlaceholders.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gm, '');
  
  // STEP 3: Remove standalone JSON objects (more precise - must start with { and have quotes)
  cleaned = cleaned.replace(/(?:^|\n)\s*\{\s*"[^"]+"\s*:[\s\S]*?\}\s*(?:\n|$)/gm, '\n');
  
  // STEP 4: Preserve markdown structure (but DON'T remove CSV patterns that might be table explanations)
  cleaned = cleaned
    // Ensure double line breaks between sections
    .replace(/\n{3,}/g, '\n\n')
    // Preserve heading markers
    .replace(/^(#{1,6})\s+/gm, '$1 ')
    // Preserve list markers
    .replace(/^(\*|-|\d+\.)\s+/gm, '$1 ')
    // Preserve blockquote markers
    .replace(/^>\s+/gm, '> ');
  
  // STEP 5: Restore markdown tables
  tables.forEach((table, index) => {
    cleaned = cleaned.replace(`__TABLE_PLACEHOLDER_${index}__`, table);
  });
  
  // STEP 6: If content becomes too minimal, preserve some context
  if (cleaned.length < 50 && text.length > 200) {
    // Extract any conversational parts that aren't data
    const lines = text.split('\n');
    const conversationalLines = lines.filter(line => 
      line.length > 10 && 
      !line.match(/^\s*\{/) && // Not JSON
      !line.match(/^\s*\}/) &&
      !line.trim().match(/^[0-9,.\s]+$/) // Not just numbers and commas
    );
    cleaned = conversationalLines.slice(0, 3).join('\n');
  }
  
  return cleaned.trim() || text;
}