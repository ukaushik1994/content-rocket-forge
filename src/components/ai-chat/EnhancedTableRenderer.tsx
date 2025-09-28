import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { TableExportButton } from './TableExportButton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedTableRendererProps {
  children: React.ReactNode;
  rawTableData?: string;
  className?: string;
}

export const EnhancedTableRenderer: React.FC<EnhancedTableRendererProps> = ({
  children,
  rawTableData,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {rawTableData && (
            <TableExportButton 
              tableData={rawTableData}
              filename="ai-chat-table"
            />
          )}
        </div>
      </div>

      {/* Enhanced Table with Horizontal Scroll */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div className="min-w-full">
            {children}
          </div>
        </div>
        
        {/* Scroll Indicator for mobile */}
        <div className="block md:hidden text-xs text-muted-foreground mt-2 text-center">
          ← Scroll horizontally to see more columns →
        </div>
      </div>
    </div>
  );
};