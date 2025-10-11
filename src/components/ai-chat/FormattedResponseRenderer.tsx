import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTableRenderer } from './EnhancedTableRenderer';

// Process content but skip CSV conversion when visual data exists
const processCodeBlocks = (content: string, hasVisualData: boolean = false): string => {
  // If visual data exists, don't convert code blocks to avoid double processing
  if (hasVisualData) {
    return content;
  }
  
  // Pattern to match code blocks with optional language specifier
  const codeBlockPattern = /```(?:csv|)?\n?([\s\S]*?)\n?```/g;
  
  return content.replace(codeBlockPattern, (match, codeContent) => {
    const trimmedContent = codeContent.trim();
    
    // Check if this looks like CSV data
    if (detectCSVPattern(trimmedContent)) {
      try {
        // Convert CSV to markdown table
        const markdownTable = convertCSVToMarkdownTable(trimmedContent);
        return markdownTable;
      } catch (error) {
        console.warn('Failed to convert code block CSV to table:', error);
        // Return original code block if conversion fails
        return match;
      }
    }
    
    // Return original code block for non-CSV content
    return match;
  });
};

// Enhanced CSV detection for code blocks
const detectCSVPattern = (content: string): boolean => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return false;
  
  // Check if most lines have consistent comma separation
  const commaLinesCount = lines.filter(line => {
    const commas = (line.match(/,/g) || []).length;
    return commas >= 1 && commas <= 20; // Reasonable range for CSV columns
  }).length;
  
  // At least 70% of lines should have commas for CSV detection
  return commaLinesCount / lines.length >= 0.7;
};

// Helper to check if a line is a valid markdown table row
const isValidMarkdownTableRow = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
  
  const segments = trimmed.split('|').filter(s => s.trim());
  return segments.length >= 2;
};

// Simplified pipe removal - trust backend formatting
const cleanMalformedPipes = (content: string): string => {
  console.log('🧹 Frontend pipe cleaning (minimal)');
  
  // Only remove obvious malformed patterns, trust markdown parser for tables
  const cleaned = content
    .replace(/\|\|\|+/g, '') // Remove triple+ pipes
    .replace(/\|\s*-{3,}\s*\|/g, '---'); // Remove orphaned separators
  
  console.log('✅ Frontend pipe cleaning complete');
  return cleaned;
};

// Convert CSV content to markdown table
const convertCSVToMarkdownTable = (csvContent: string): string => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return csvContent;
  
  // Parse CSV lines (basic parsing - handles quoted fields)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(cell => cell.replace(/^"|"$/g, '')); // Remove surrounding quotes
  };
  
  const rows = lines.map(parseCSVLine);
  const maxColumns = Math.max(...rows.map(row => row.length));
  
  // Ensure all rows have the same number of columns
  const normalizedRows = rows.map(row => {
    while (row.length < maxColumns) {
      row.push('');
    }
    return row;
  });
  
  if (normalizedRows.length === 0) return csvContent;
  
  // Create markdown table
  const header = '| ' + normalizedRows[0].join(' | ') + ' |';
  const separator = '| ' + Array(maxColumns).fill('---').join(' | ') + ' |';
  const body = normalizedRows.slice(1).map(row => '| ' + row.join(' | ') + ' |').join('\n');
  
  return `\n${header}\n${separator}\n${body}\n`;
};



// Enhanced malformed table detection with better pattern recognition
const detectMalformedTable = (content: string): boolean => {
  const lines = content.split('\n');
  let pipeLineCount = 0;
  let consecutivePipeLines = 0;
  let maxConsecutive = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Count lines that look like table rows
    if (trimmed.startsWith('|') && (trimmed.match(/\|/g) || []).length >= 2) {
      pipeLineCount++;
      consecutivePipeLines++;
      maxConsecutive = Math.max(maxConsecutive, consecutivePipeLines);
    } else {
      consecutivePipeLines = 0;
    }
  }
  
  // More robust detection: need either 3+ pipe lines OR 2+ consecutive ones
  return pipeLineCount >= 3 || maxConsecutive >= 2;
};

// Improved malformed table repair with better error handling
const repairMalformedTable = (content: string): string => {
  console.log('🔧 Starting malformed table repair');
  const lines = content.split('\n');
  const result: string[] = [];
  let currentTableLines: string[] = [];
  let inTable = false;
  
  const processCurrentTable = () => {
    if (currentTableLines.length >= 2) {
      console.log('📋 Processing table with', currentTableLines.length, 'lines');
      try {
        const repairedTable = processTableLines(currentTableLines);
        if (repairedTable && repairedTable.trim()) {
          result.push(repairedTable);
          console.log('✅ Table repaired successfully');
        } else {
          console.warn('⚠️ Table repair produced empty result');
          result.push(...currentTableLines);
        }
      } catch (error) {
        console.warn('❌ Table repair failed:', error);
        result.push(...currentTableLines);
      }
    } else {
      result.push(...currentTableLines);
    }
    currentTableLines = [];
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Detect table lines with improved pattern matching
    const isTableLine = trimmed.startsWith('|') && (trimmed.match(/\|/g) || []).length >= 2;
    
    if (isTableLine) {
      if (!inTable) {
        console.log('🔍 Table start detected at line', i);
        inTable = true;
      }
      currentTableLines.push(line);
    } else if (inTable && trimmed === '') {
      // Allow one empty line within a table
      if (i + 1 < lines.length && 
          lines[i + 1].trim().startsWith('|') && 
          (lines[i + 1].trim().match(/\|/g) || []).length >= 2) {
        currentTableLines.push(line);
      } else {
        // End of table
        processCurrentTable();
        inTable = false;
        result.push(line);
      }
    } else {
      if (inTable) {
        // Process the collected table and end table mode
        processCurrentTable();
        inTable = false;
      }
      result.push(line);
    }
  }
  
  // Handle table at end of content
  if (inTable && currentTableLines.length > 0) {
    processCurrentTable();
  }
  
  console.log('🏁 Malformed table repair complete');
  return result.join('\n');
};

// Enhanced table line processing with better normalization
const processTableLines = (lines: string[]): string => {
  console.log('📊 Processing', lines.length, 'table lines');
  const nonEmptyLines = lines.filter(line => line.trim());
  if (nonEmptyLines.length < 2) {
    console.warn('⚠️ Insufficient non-empty lines for table processing');
    return lines.join('\n');
  }
  
  // Parse each line and extract content between pipes
  const parsedRows: string[][] = [];
  let maxColumns = 0;
  
  for (const line of nonEmptyLines) {
    try {
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter((cell, index, arr) => {
          // Remove empty cells at start/end (from leading/trailing pipes)
          if (index === 0 || index === arr.length - 1) return cell !== '';
          return true;
        });
      
      if (cells.length > 0) {
        parsedRows.push(cells);
        maxColumns = Math.max(maxColumns, cells.length);
      }
    } catch (error) {
      console.warn('❌ Error parsing table line:', line, error);
      // Skip problematic lines but continue processing
      continue;
    }
  }
  
  if (parsedRows.length === 0) {
    console.warn('⚠️ No valid rows found after parsing');
    return lines.join('\n');
  }
  
  console.log('📋 Parsed', parsedRows.length, 'rows with max', maxColumns, 'columns');
  
  // Normalize all rows to have the same number of columns
  const normalizedRows = parsedRows.map(row => {
    const normalized = [...row];
    while (normalized.length < maxColumns) {
      normalized.push('');
    }
    return normalized.slice(0, maxColumns); // Ensure we don't exceed maxColumns
  });
  
  // Create proper markdown table with validation
  try {
    const header = '| ' + normalizedRows[0].join(' | ') + ' |';
    const separator = '| ' + Array(maxColumns).fill('---').join(' | ') + ' |';
    const body = normalizedRows.slice(1).map(row => '| ' + row.join(' | ') + ' |').join('\n');
    
    const result = `${header}\n${separator}\n${body}`;
    console.log('✅ Table processing successful');
    return result;
  } catch (error) {
    console.warn('❌ Error creating markdown table:', error);
    return lines.join('\n');
  }
};

// Streamlined table detection with single-pass processing
const detectAndConvertTables = (content: string): { processedContent: string; hasErrors: boolean; errorCount: number } => {
  let errorCount = 0;
  let hasErrors = false;
  
  console.log('🔄 Starting table detection and conversion process');
  
  // Step 0: Clean malformed pipes before any processing
  let processedContent = cleanMalformedPipes(content);
  console.log('🧹 Malformed pipes cleaned');
  
  // Step 1: Pre-process code blocks to convert CSV to tables
  processedContent = processCodeBlocks(processedContent);
  console.log('📋 Code blocks processed');
  
  // Step 2: Check if content has malformed tables and repair them first
  if (detectMalformedTable(processedContent)) {
    console.log('🔧 Malformed table detected, attempting repair');
    try {
      processedContent = repairMalformedTable(processedContent);
      console.log('✅ Malformed table repaired successfully');
      
      // If we successfully repaired malformed tables, skip further processing
      // to avoid double-processing the same content
      return { 
        processedContent,
        hasErrors: false,
        errorCount: 0
      };
    } catch (error) {
      console.warn('❌ Failed to repair malformed table:', error);
      hasErrors = true;
      errorCount++;
      // Continue with regular processing as fallback
    }
  }
  
  // Step 3: Process remaining content for table patterns (only if no malformed tables were found/repaired)
  console.log('🔍 Scanning for additional table patterns');
  const lines = processedContent.split('\n');
  const processedLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      processedLines.push(line);
      i++;
      continue;
    }

    // Check if this line looks like a table header or data row
    const tableMatch = detectTablePattern(line);
    
    if (tableMatch) {
      console.log('📋 Table pattern detected at line', i);
      // Found a potential table, collect all consecutive table rows
      try {
        const tableLines = collectTableLines(lines, i);
        console.log('📊 Collected', tableLines.length, 'table lines');
        
        if (tableLines.length >= 2) { // Need at least header + 1 data row
          const markdownTable = convertToMarkdownTable(tableLines);
          if (markdownTable && markdownTable.trim()) {
            console.log('✅ Successfully converted to markdown table');
            processedLines.push(markdownTable);
            i += tableLines.length;
            continue;
          } else {
            console.warn('⚠️ Table conversion resulted in empty content');
            hasErrors = true;
            errorCount++;
          }
        } else {
          console.warn('⚠️ Insufficient table lines for conversion');
        }
      } catch (error) {
        console.warn('❌ Table conversion error:', error);
        hasErrors = true;
        errorCount++;
      }
    }
    
    // Add the line as regular content (only add once per iteration)
    processedLines.push(line);
    i++;
  }

  console.log('🏁 Table processing complete. Errors:', errorCount);
  return { 
    processedContent: processedLines.join('\n'),
    hasErrors,
    errorCount
  };
};

const detectTablePattern = (line: string): boolean => {
  const trimmed = line.trim();
  
  // Skip empty lines
  if (!trimmed) return false;
  
  // Check for pipe-separated values (|) - STRICT: must start AND end with |
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    const parts = trimmed.split('|').filter(p => p.trim().length > 0);
    // Must have at least 2 actual columns (not just random pipes in text)
    if (parts.length >= 2) {
      return true;
    }
  }
  
  // Check for CSV-like patterns with commas
  if (trimmed.includes(',') && trimmed.split(',').length >= 2) {
    const parts = trimmed.split(',');
    // Validate that it looks like tabular data (not just a sentence with commas)
    return parts.length >= 2 && 
           parts.some(part => part.trim().length > 0) &&
           parts.filter(part => part.trim().length > 0).length >= 2;
  }
  
  // Check for tab-separated values
  if (trimmed.includes('\t') && trimmed.split('\t').length >= 2) {
    return true;
  }
  
  // Check for space-aligned columns (multiple spaces between words)
  if (/\s{2,}/.test(trimmed) && trimmed.split(/\s{2,}/).length >= 2) {
    const parts = trimmed.split(/\s{2,}/);
    // Ensure we have meaningful content in multiple columns
    return parts.filter(part => part.trim().length > 0).length >= 2;
  }
  
  // Check for common table header patterns
  if (/^[A-Za-z0-9\s]+\s+[A-Za-z0-9\s]+/.test(trimmed) && 
      (trimmed.includes('Strategy') || trimmed.includes('Description') || 
       trimmed.includes('Timeline') || trimmed.includes('Budget') ||
       trimmed.includes('Priority') || trimmed.includes('Status'))) {
    return true;
  }
  
  // Check for numbered/lettered list with structured data
  if (/^\d+[\.\)]\s+/.test(trimmed) || /^[a-zA-Z][\.\)]\s+/.test(trimmed)) {
    // Look for structured data patterns within the line
    const content = trimmed.replace(/^\d+[\.\)]\s+/, '').replace(/^[a-zA-Z][\.\)]\s+/, '');
    if (content.includes(':') || content.includes('-') || content.includes('|')) {
      return true;
    }
  }
  
  return false;
};

const collectTableLines = (lines: string[], startIndex: number): string[] => {
  const tableLines: string[] = [];
  let i = startIndex;
  
  // Collect consecutive table lines
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines but continue collecting
    if (!line.trim()) {
      // Only allow 1 empty line between table rows
      if (tableLines.length > 0 && i + 1 < lines.length && detectTablePattern(lines[i + 1])) {
        i++;
        continue;
      } else {
        break;
      }
    }
    
    if (detectTablePattern(line)) {
      tableLines.push(line);
      i++;
    } else {
      break;
    }
  }
  
  // STRICT: Require at least 2 lines to be considered a valid table
  // Single lines with pipes are NOT tables (they're fragments in conversation)
  if (tableLines.length < 2) {
    return [];
  }
  
  return tableLines;
};

// Enhanced table conversion with comprehensive error handling
const convertToMarkdownTable = (tableLines: string[]): string => {
  console.log('🔄 Converting', tableLines.length, 'lines to markdown table');
  
  if (tableLines.length === 0) {
    console.warn('⚠️ No table lines to convert');
    return '';
  }
  
  const processedRows: string[][] = [];
  
  // Process each line to extract columns with enhanced error handling
  for (let lineIndex = 0; lineIndex < tableLines.length; lineIndex++) {
    const line = tableLines[lineIndex];
    const trimmed = line.trim();
    
    if (!trimmed) {
      console.log('📋 Skipping empty line', lineIndex);
      continue;
    }
    
    let columns: string[] = [];
    
    try {
      if (trimmed.includes('|')) {
        // Pipe-separated format - handle both existing markdown tables and raw pipe data
        columns = trimmed.split('|')
          .map(col => col.trim())
          .filter((col, index, array) => {
            // Remove empty first/last columns that are just markdown table borders
            if ((index === 0 || index === array.length - 1) && col === '') {
              return false;
            }
            return true;
          });
      } else if (trimmed.includes('\t')) {
        // Tab-separated format
        columns = trimmed.split('\t').map(col => col.trim());
      } else if (trimmed.includes(',')) {
        // CSV format - be more intelligent about parsing
        columns = trimmed.split(',').map(col => col.trim());
      } else if (/^\d+[\.\)]\s+/.test(trimmed) || /^[a-zA-Z][\.\)]\s+/.test(trimmed)) {
        // Handle numbered/lettered lists with structured data
        const listMatch = trimmed.match(/^(\d+[\.\)]|[a-zA-Z][\.\)])\s+(.+)/);
        if (listMatch) {
          const content = listMatch[2];
          if (content.includes(':')) {
            const parts = content.split(':');
            columns = [listMatch[1].trim(), parts[0].trim(), parts.slice(1).join(':').trim()];
          } else if (content.includes('-')) {
            const parts = content.split('-');
            columns = [listMatch[1].trim(), ...parts.map(p => p.trim())];
          } else {
            columns = [listMatch[1].trim(), content];
          }
        } else {
          columns = [trimmed];
        }
      } else if (/\s{2,}/.test(trimmed)) {
        // Space-separated format with better column detection
        columns = trimmed.split(/\s{2,}/).map(col => col.trim());
      } else {
        // Single column or unstructured text
        columns = [trimmed];
      }
      
      // Validate and add columns if they contain meaningful data
      if (columns.length > 0 && columns.some(col => col.length > 0)) {
        processedRows.push(columns);
        console.log('✅ Processed line', lineIndex, 'with', columns.length, 'columns');
      } else {
        console.warn('⚠️ Line', lineIndex, 'produced no valid columns');
      }
    } catch (error) {
      console.warn('❌ Error processing line', lineIndex, ':', error);
      // Fallback: treat entire line as single column
      if (trimmed.length > 0) {
        processedRows.push([trimmed]);
      }
    }
  }
  
  if (processedRows.length === 0) {
    console.warn('⚠️ No valid rows after processing, returning original content');
    return tableLines.join('\n');
  }
  
  // Find the maximum number of columns
  const maxColumns = Math.max(...processedRows.map(row => row.length));
  console.log('📊 Maximum columns detected:', maxColumns);
  
  // If all rows have only 1 column, it's probably not a table
  if (maxColumns === 1 && processedRows.length > 1) {
    console.log('📝 Single column detected, treating as regular text');
    return tableLines.join('\n');
  }
  
  // Normalize all rows to have the same number of columns
  const normalizedRows = processedRows.map((row, index) => {
    try {
      const normalizedRow = [...row];
      while (normalizedRow.length < maxColumns) {
        normalizedRow.push('');
      }
      return normalizedRow;
    } catch (error) {
      console.warn('❌ Error normalizing row', index, ':', error);
      // Fallback: create a row with the original content in first column
      const fallbackRow = [row[0] || ''];
      while (fallbackRow.length < maxColumns) {
        fallbackRow.push('');
      }
      return fallbackRow;
    }
  });
  
  // Build markdown table with error handling
  try {
    const markdownLines: string[] = [];
    
    // Header row - use first row as header
    markdownLines.push('| ' + normalizedRows[0].join(' | ') + ' |');
    
    // Separator row
    markdownLines.push('|' + ' --- |'.repeat(maxColumns));
    
    // Data rows
    for (let i = 1; i < normalizedRows.length; i++) {
      markdownLines.push('| ' + normalizedRows[i].join(' | ') + ' |');
    }
    
    const result = '\n' + markdownLines.join('\n') + '\n';
    console.log('✅ Successfully created markdown table');
    return result;
  } catch (error) {
    console.warn('❌ Error building markdown table:', error);
    return tableLines.join('\n');
  }
};

interface FormattedResponseRendererProps {
  content: string;
  className?: string;
  hasVisualData?: boolean;
}

export const FormattedResponseRenderer: React.FC<FormattedResponseRendererProps> = ({ 
  content, 
  className,
  hasVisualData = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Process content to convert text-based tables to markdown tables (skip if visual data exists)
  const processedResult = React.useMemo(() => {
    setIsProcessing(true);
    try {
      // ALWAYS clean malformed pipes first (even with visual data)
      let processedContent = cleanMalformedPipes(content);
      
      // Skip table processing if visual data already handles the tables
      if (hasVisualData) {
        return { 
          processedContent, 
          hasErrors: false, 
          errorCount: 0 
        };
      }
      
      const result = detectAndConvertTables(processedContent);
      return result;
    } catch (error) {
      console.error('Content processing error:', error);
      return { 
        processedContent: content, 
        hasErrors: true, 
        errorCount: 1 
      };
    } finally {
      setTimeout(() => setIsProcessing(false), 100);
    }
  }, [content, hasVisualData]);
  
  // Show warning if there were processing errors
  React.useEffect(() => {
    if (processedResult.hasErrors && processedResult.errorCount > 0) {
      toast({
        title: "Content Processing Warning",
        description: `${processedResult.errorCount} table(s) could not be properly formatted`,
        variant: "default",
      });
    }
  }, [processedResult.hasErrors, processedResult.errorCount, toast]);
  
  if (isProcessing) {
    return (
      <div className={cn("prose prose-sm max-w-none flex items-center justify-center py-4", className)}>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Processing content...</span>
      </div>
    );
  }
  
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-foreground mb-4 mt-6 first:mt-0 border-b border-border pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-foreground mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-foreground mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-foreground/90 mb-3 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-sm text-foreground/90 ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-foreground/90 ml-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-1 leading-relaxed">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-4 border-border" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/20 rounded-r-md mb-3">
              <div className="text-sm text-muted-foreground italic">
                {children}
              </div>
            </blockquote>
          ),
          table: ({ children }) => (
            <EnhancedTableRenderer rawTableData={processedResult.processedContent}>
              <table className="min-w-full border border-border rounded-lg bg-card">
                {children}
              </table>
            </EnhancedTableRenderer>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-foreground border-b border-border/50">
              {children}
            </td>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                {children}
              </code>
            ) : (
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3">
                <code className="text-xs font-mono text-foreground">
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {processedResult.processedContent}
      </ReactMarkdown>
    </div>
  );
};