/**
 * Content validation and repair utilities for AI chat responses
 */

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  repairedContent: string;
}

interface TableProtection {
  placeholder: string;
  content: string;
}

/**
 * Extract tables and replace with placeholders to protect during processing
 */
function extractAndProtectTables(content: string): { content: string; tables: TableProtection[] } {
  const tables: TableProtection[] = [];
  let protectedContent = content;
  
  // Match full table blocks (header + separator + data rows)
  const tableRegex = /(\|.+\|\n\|[\s\-:]+\|\n(?:\|.+\|\n?)*)/g;
  
  let match;
  let index = 0;
  while ((match = tableRegex.exec(content)) !== null) {
    const placeholder = `__TABLE_PROTECTED_${index}__`;
    tables.push({
      placeholder,
      content: match[0]
    });
    protectedContent = protectedContent.replace(match[0], `\n${placeholder}\n`);
    index++;
  }
  
  return { content: protectedContent, tables };
}

/**
 * Restore protected tables back into content
 */
function restoreProtectedTables(content: string, tables: TableProtection[]): string {
  let restored = content;
  tables.forEach(table => {
    restored = restored.replace(table.placeholder, table.content);
  });
  return restored;
}

/**
 * Validates and repairs markdown content before rendering
 * Ensures proper spacing, table structure, and formatting
 */
export function validateAndRepairMarkdown(content: string): ValidationResult {
  const issues: string[] = [];
  
  // STEP 1: Extract and protect tables FIRST
  const { content: protectedContent, tables } = extractAndProtectTables(content);
  let repaired = protectedContent;
  
  // STEP 2: Check headings (safe - doesn't affect tables)
  if (/#{1,6}\s/.test(repaired) && !repaired.match(/\n#{1,6}\s/g)) {
    issues.push('Missing heading spacing');
    repaired = repaired.replace(/(#{1,6}\s+.+)/g, '\n$1\n');
  }
  
  // STEP 3: List item spacing (safe - doesn't affect tables)
  repaired = repaired.replace(/^(\*|-|\d+\.)\s*/gm, '\n$1 ');
  
  // STEP 4: Remove excessive blank lines
  repaired = repaired.replace(/\n{4,}/g, '\n\n\n');
  
  // STEP 5: Paragraph separation - ONLY for non-table content
  // Only add paragraph breaks if spacing is minimal
  repaired = repaired.replace(/([.!?])(\s+)([A-Z][a-z])/g, (match, punct, space, nextChar) => {
    // Only add paragraph break if there's just one space
    if (space.length === 1) {
      return `${punct}\n\n${nextChar}`;
    }
    return match;
  });
  
  // STEP 6: Restore tables
  repaired = restoreProtectedTables(repaired, tables);
  
  // STEP 7: Ensure proper spacing around restored tables
  repaired = repaired.replace(/([^\n])(\|.+\|)/g, '$1\n\n$2');
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
