import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// Table detection and conversion utilities
const detectAndConvertTables = (content: string): string => {
  // Split content into lines for processing
  const lines = content.split('\n');
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
      const tableLines = collectTableLines(lines, i);
      if (tableLines.length >= 2) { // Need at least header + 1 data row
        const markdownTable = convertToMarkdownTable(tableLines);
        processedLines.push(markdownTable);
        i += tableLines.length;
        continue;
      }
    }
    
    processedLines.push(line);
    i++;
  }

  return processedLines.join('\n');
};

const detectTablePattern = (line: string): boolean => {
  const trimmed = line.trim();
  
  // Check for pipe-separated values (|)
  if (trimmed.includes('|') && trimmed.split('|').length >= 3) {
    return true;
  }
  
  // Check for CSV-like patterns with commas
  if (trimmed.includes(',') && trimmed.split(',').length >= 2) {
    // Additional validation to avoid false positives
    const parts = trimmed.split(',');
    return parts.length >= 2 && parts.some(part => part.trim().length > 0);
  }
  
  // Check for space-aligned columns (multiple spaces between words)
  if (/\s{2,}/.test(trimmed) && trimmed.split(/\s{2,}/).length >= 2) {
    return true;
  }
  
  return false;
};

const collectTableLines = (lines: string[], startIndex: number): string[] => {
  const tableLines: string[] = [];
  let i = startIndex;
  
  while (i < lines.length && detectTablePattern(lines[i])) {
    tableLines.push(lines[i]);
    i++;
  }
  
  return tableLines;
};

const convertToMarkdownTable = (tableLines: string[]): string => {
  if (tableLines.length === 0) return '';
  
  const processedRows: string[][] = [];
  
  // Process each line to extract columns
  for (const line of tableLines) {
    let columns: string[];
    
    if (line.includes('|')) {
      // Pipe-separated format
      columns = line.split('|')
        .map(col => col.trim())
        .filter(col => col.length > 0);
    } else if (line.includes(',')) {
      // CSV format
      columns = line.split(',').map(col => col.trim());
    } else {
      // Space-separated format
      columns = line.split(/\s{2,}/).map(col => col.trim());
    }
    
    if (columns.length > 0) {
      processedRows.push(columns);
    }
  }
  
  if (processedRows.length === 0) return tableLines.join('\n');
  
  // Find the maximum number of columns
  const maxColumns = Math.max(...processedRows.map(row => row.length));
  
  // Normalize all rows to have the same number of columns
  const normalizedRows = processedRows.map(row => {
    while (row.length < maxColumns) {
      row.push('');
    }
    return row;
  });
  
  // Build markdown table
  const markdownLines: string[] = [];
  
  // Header row
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
  // Process content to convert text-based tables to markdown tables
  const processedContent = detectAndConvertTables(content);
  
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
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-border rounded-lg bg-card">
                {children}
              </table>
            </div>
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
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};