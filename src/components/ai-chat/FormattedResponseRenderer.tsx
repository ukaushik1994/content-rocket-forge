import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedTableRenderer } from './EnhancedTableRenderer';

// Pre-process content to convert CSV code blocks to markdown tables
const processCodeBlocks = (content: string): string => {
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

// Enhanced malformed markdown table detection
const detectMalformedTable = (content: string): boolean => {
  const lines = content.split('\n');
  let pipeLineCount = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Count lines that start with | and have multiple pipes
    if (trimmed.startsWith('|') && (trimmed.match(/\|/g) || []).length >= 2) {
      pipeLineCount++;
    }
  }
  
  // If we have 2+ lines with pipe structure, it's likely a malformed table
  return pipeLineCount >= 2;
};

// Repair malformed markdown tables
const repairMalformedTable = (content: string): string => {
  const lines = content.split('\n');
  const tableLines: string[] = [];
  const nonTableLines: string[] = [];
  let inTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect table start/continuation
    if (line.startsWith('|') && (line.match(/\|/g) || []).length >= 2) {
      if (!inTable) inTable = true;
      tableLines.push(line);
    } else if (inTable && line === '') {
      // Empty line in table - continue table
      tableLines.push(line);
    } else {
      if (inTable) {
        // End of table, process it
        if (tableLines.length >= 2) {
          const repairedTable = processTableLines(tableLines);
          nonTableLines.push(repairedTable);
        } else {
          nonTableLines.push(...tableLines);
        }
        tableLines.length = 0;
        inTable = false;
      }
      nonTableLines.push(line);
    }
  }
  
  // Handle table at end of content
  if (tableLines.length >= 2) {
    const repairedTable = processTableLines(tableLines);
    nonTableLines.push(repairedTable);
  } else if (tableLines.length > 0) {
    nonTableLines.push(...tableLines);
  }
  
  return nonTableLines.join('\n');
};

// Process and repair table lines
const processTableLines = (lines: string[]): string => {
  const nonEmptyLines = lines.filter(line => line.trim());
  if (nonEmptyLines.length < 2) return lines.join('\n');
  
  // Parse each line and extract content between pipes
  const parsedRows: string[][] = [];
  let maxColumns = 0;
  
  for (const line of nonEmptyLines) {
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
  }
  
  if (parsedRows.length === 0) return lines.join('\n');
  
  // Normalize all rows to have the same number of columns
  const normalizedRows = parsedRows.map(row => {
    while (row.length < maxColumns) {
      row.push('');
    }
    return row.slice(0, maxColumns); // Ensure we don't exceed maxColumns
  });
  
  // Create proper markdown table
  const header = '| ' + normalizedRows[0].join(' | ') + ' |';
  const separator = '| ' + Array(maxColumns).fill('---').join(' | ') + ' |';
  const body = normalizedRows.slice(1).map(row => '| ' + row.join(' | ') + ' |').join('\n');
  
  return `${header}\n${separator}\n${body}`;
};

// Enhanced table detection with error handling and recovery
const detectAndConvertTables = (content: string): { processedContent: string; hasErrors: boolean; errorCount: number } => {
  let errorCount = 0;
  let hasErrors = false;
  
  // First, pre-process code blocks to convert CSV to tables
  let processedContent = processCodeBlocks(content);
  
  // Then, detect and repair malformed markdown tables
  if (detectMalformedTable(processedContent)) {
    try {
      processedContent = repairMalformedTable(processedContent);
    } catch (error) {
      console.warn('Failed to repair malformed table:', error);
      hasErrors = true;
      errorCount++;
    }
  }
  
  // Split content into lines for existing CSV processing
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
      // Found a potential table, collect all consecutive table rows
      try {
        const tableLines = collectTableLines(lines, i);
        if (tableLines.length >= 2) { // Need at least header + 1 data row
          const markdownTable = convertToMarkdownTable(tableLines);
          if (markdownTable && markdownTable.trim()) {
            processedLines.push(markdownTable);
            i += tableLines.length;
            continue;
          } else {
            // Fallback: treat as regular text if conversion fails
            hasErrors = true;
            errorCount++;
            processedLines.push(line);
          }
        }
      } catch (error) {
        // Graceful fallback - treat as regular text
        hasErrors = true;
        errorCount++;
        console.warn('Table conversion error:', error);
        processedLines.push(line);
      }
    }
    
    processedLines.push(line);
    i++;
  }

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
  
  // Check for pipe-separated values (|) - most common markdown table format
  if (trimmed.includes('|') && trimmed.split('|').length >= 2) {
    return true;
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
  
  return tableLines;
};

const convertToMarkdownTable = (tableLines: string[]): string => {
  if (tableLines.length === 0) return '';
  
  const processedRows: string[][] = [];
  
  // Process each line to extract columns
  for (const line of tableLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    let columns: string[];
    
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
    
    if (columns.length > 0 && columns.some(col => col.length > 0)) {
      processedRows.push(columns);
    }
  }
  
  if (processedRows.length === 0) return tableLines.join('\n');
  
  // Find the maximum number of columns
  const maxColumns = Math.max(...processedRows.map(row => row.length));
  
  // If all rows have only 1 column, it's probably not a table
  if (maxColumns === 1 && processedRows.length > 1) {
    return tableLines.join('\n');
  }
  
  // Normalize all rows to have the same number of columns
  const normalizedRows = processedRows.map(row => {
    const normalizedRow = [...row];
    while (normalizedRow.length < maxColumns) {
      normalizedRow.push('');
    }
    return normalizedRow;
  });
  
  // Build markdown table
  const markdownLines: string[] = [];
  
  // Header row - use first row as header
  markdownLines.push('| ' + normalizedRows[0].join(' | ') + ' |');
  
  // Separator row
  markdownLines.push('|' + ' --- |'.repeat(maxColumns));
  
  // Data rows
  for (let i = 1; i < normalizedRows.length; i++) {
    markdownLines.push('| ' + normalizedRows[i].join(' | ') + ' |');
  }
  
  return '\n' + markdownLines.join('\n') + '\n';
};

interface FormattedResponseRendererProps {
  content: string;
  className?: string;
}

export const FormattedResponseRenderer: React.FC<FormattedResponseRendererProps> = ({ 
  content, 
  className 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Process content to convert text-based tables to markdown tables
  const processedResult = React.useMemo(() => {
    setIsProcessing(true);
    try {
      const result = detectAndConvertTables(content);
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
  }, [content]);
  
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
            <h1 className="text-lg font-semibold text-foreground mb-3 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-foreground mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-medium text-foreground mb-2 mt-2 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-foreground mb-2 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-foreground ml-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-foreground">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
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
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/20 rounded-r-md mb-3">
              <div className="text-sm text-muted-foreground italic">
                {children}
              </div>
            </blockquote>
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