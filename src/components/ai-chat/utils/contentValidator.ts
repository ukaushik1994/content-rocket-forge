/**
 * Content validation and repair utilities for AI chat responses
 */

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  repairedContent: string;
}

/**
 * Validates and repairs markdown content before rendering
 * Ensures proper spacing, table structure, and formatting
 */
export function validateAndRepairMarkdown(content: string): ValidationResult {
  const issues: string[] = [];
  let repaired = content;
  
  // STEP 1: Check headings
  if (/#{1,6}\s/.test(repaired) && !repaired.match(/\n#{1,6}\s/g)) {
    issues.push('Missing heading spacing');
    repaired = repaired.replace(/(#{1,6}\s+.+)/g, '\n$1\n');
  }
  
  // STEP 2: List item spacing
  repaired = repaired.replace(/^(\*|-|\d+\.)\s*/gm, '\n$1 ');
  
  // STEP 3: Remove excessive blank lines
  repaired = repaired.replace(/\n{4,}/g, '\n\n\n');
  
  // STEP 4: Paragraph separation
  repaired = repaired.replace(/([.!?])(\s+)([A-Z][a-z])/g, (match, punct, space, nextChar) => {
    if (space.length === 1) {
      return `${punct}\n\n${nextChar}`;
    }
    return match;
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    repairedContent: repaired.trim()
  };
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detects if content contains malformed table structures
 */
export function detectMalformedTable(content: string): boolean {
  const lines = content.split('\n');
  let pipeLineCount = 0;
  let hasSeparatorRow = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect table separator rows (only dashes and pipes)
    if (/^\|[\s\-:]+\|$/.test(trimmed) && trimmed.includes('---')) {
      hasSeparatorRow = true;
      pipeLineCount++;
      continue;
    }
    
    // Detect table data rows (proper start/end pipes, 2+ columns)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cellCount = (trimmed.match(/\|/g) || []).length;
      if (cellCount >= 3) { // At least 2 columns (3 pipes)
        pipeLineCount++;
      }
    }
  }
  
  // Valid table: has separator row AND at least one data row
  return hasSeparatorRow && pipeLineCount >= 2;
}
