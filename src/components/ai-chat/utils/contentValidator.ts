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
  
  // Check 1: Ensure headings have proper spacing
  const headingMatches = repaired.match(/\n#{1,6}\s/g);
  if (!headingMatches || headingMatches.length === 0) {
    // Check if there are headings without proper newlines
    if (/#{1,6}\s/.test(repaired)) {
      issues.push('Missing heading spacing');
      repaired = repaired.replace(/(#{1,6}\s+.+)/g, '\n$1\n');
    }
  }
  
  // Check 2: Validate table structure
  const tableMatches = repaired.match(/\|.+\|/g);
  if (tableMatches && tableMatches.length > 1) {
    const hasSeparator = tableMatches.some(line => /\|[\s\-:]+\|/.test(line) && line.includes('---'));
    if (!hasSeparator) {
      issues.push('Table missing separator row');
      // Try to insert separator after first row
      const firstTableLine = tableMatches[0];
      const cellCount = (firstTableLine.match(/\|/g) || []).length - 1;
      const separator = '| ' + Array(cellCount).fill('---').join(' | ') + ' |';
      repaired = repaired.replace(
        new RegExp(`(${escapeRegExp(firstTableLine)}\\n)([^|])`),
        `$1${separator}\n$2`
      );
    }
  }
  
  // Check 3: Ensure list items have spacing
  repaired = repaired.replace(/^(\*|-|\d+\.)\s*/gm, '\n$1 ');
  
  // Check 4: Remove excessive blank lines
  repaired = repaired.replace(/\n{4,}/g, '\n\n\n');
  
  // Check 5: Ensure paragraphs are separated properly
  // Add double newline after sentences followed by capital letters
  repaired = repaired.replace(/([.!?])\s+([A-Z][a-z])/g, '$1\n\n$2');
  
  // Check 6: Ensure proper spacing around tables
  repaired = repaired.replace(/([^\n])\n(\|.+\|)/g, '$1\n\n$2');
  repaired = repaired.replace(/(\|.+\|)\n([^\n|])/g, '$1\n\n$2');
  
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
