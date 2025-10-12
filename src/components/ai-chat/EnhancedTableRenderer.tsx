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
      {/* Table wrapper without export buttons */}

      {/* Enhanced Table */}
      <div className="relative">
        <div className="overflow-visible">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};