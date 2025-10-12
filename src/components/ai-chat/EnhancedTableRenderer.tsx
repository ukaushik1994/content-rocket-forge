import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EnhancedTableRendererProps {
  children: React.ReactNode;
  rawTableData?: string;
  className?: string;
}

/**
 * Analyze table columns and apply intelligent alignment based on content type
 */
const analyzeTableColumns = (tableElement: HTMLTableElement) => {
  const headers = tableElement.querySelectorAll('th');
  const rows = tableElement.querySelectorAll('tbody tr');
  
  headers.forEach((header, colIndex) => {
    const headerText = header.textContent?.toLowerCase() || '';
    let alignment = 'left'; // default
    let columnType = 'text';
    
    // Detect column type from header text
    if (headerText.includes('count') || headerText.includes('total') || 
        headerText.includes('score') || headerText.includes('value') ||
        headerText.includes('metric') || headerText.includes('amount') ||
        headerText.includes('number') || headerText.includes('%')) {
      alignment = 'right';
      columnType = 'number';
    } else if (headerText.includes('date') || headerText.includes('time') ||
               headerText.includes('timestamp') || headerText.includes('created') ||
               headerText.includes('updated')) {
      alignment = 'center';
      columnType = 'date';
    } else if (headerText.includes('priority')) {
      alignment = 'left';
      columnType = 'priority';
    } else if (headerText.includes('note') || headerText.includes('description') ||
               headerText.includes('detail')) {
      columnType = 'notes';
    }
    
    // Apply alignment and data attributes to all cells in column
    rows.forEach(row => {
      const cell = row.children[colIndex] as HTMLElement;
      if (cell) {
        cell.style.textAlign = alignment;
        cell.setAttribute('data-type', columnType);
        cell.setAttribute('data-column', headerText);
        
        // Add priority styling if applicable
        if (columnType === 'priority') {
          const cellText = cell.textContent?.toLowerCase() || '';
          if (cellText.includes('high')) {
            cell.setAttribute('data-priority', 'high');
          } else if (cellText.includes('medium')) {
            cell.setAttribute('data-priority', 'medium');
          } else if (cellText.includes('low')) {
            cell.setAttribute('data-priority', 'low');
          }
        }
      }
    });
    
    // Apply to header cell as well
    (header as HTMLElement).style.textAlign = alignment;
  });
};

/**
 * Validate table structure and ensure consistency
 */
const validateTableStructure = (tableElement: HTMLTableElement): boolean => {
  const rows = tableElement.querySelectorAll('tr');
  if (rows.length < 2) return false; // Need at least header + 1 data row
  
  // Check column count consistency
  const columnCounts = Array.from(rows).map(row => row.children.length);
  const uniqueCounts = new Set(columnCounts);
  
  if (uniqueCounts.size > 1) {
    console.warn('⚠️ Inconsistent column count detected in table');
    return false;
  }
  
  return true;
};

export const EnhancedTableRenderer: React.FC<EnhancedTableRendererProps> = ({
  children,
  rawTableData,
  className
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (tableRef.current) {
      const tableElement = tableRef.current.querySelector('table');
      if (tableElement) {
        // Validate structure
        const isValid = validateTableStructure(tableElement);
        
        if (isValid) {
          // Apply intelligent column analysis
          analyzeTableColumns(tableElement);
          console.log('✅ Table intelligence applied');
        } else {
          console.warn('⚠️ Table structure validation failed');
        }
      }
    }
  }, [children]);
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Enhanced Table with smart column detection */}
      <div className="relative">
        <div className="overflow-visible">
          <div ref={tableRef} className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};