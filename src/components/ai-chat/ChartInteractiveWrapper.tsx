import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartControls } from './ChartControls';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChartInteractiveWrapperProps {
  chartIndex: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  linkedHoverData?: any;
  onHover?: (data: any) => void;
  onExportPNG?: () => void;
  onExportCSV?: () => void;
  className?: string;
}

export const ChartInteractiveWrapper: React.FC<ChartInteractiveWrapperProps> = ({
  chartIndex,
  title,
  description,
  children,
  linkedHoverData,
  onHover,
  onExportPNG,
  onExportCSV,
  className
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div
      className={cn("relative", className)}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden">
        {/* Header with Controls */}
        <div className="p-4 border-b flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          {/* Chart Controls */}
          <ChartControls
            showFilter={true}
            onToggleFilter={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Linked Data Indicator */}
        <AnimatePresence>
          {linkedHoverData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-2 bg-primary/10 border-b"
            >
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="text-xs">
                  Linked Data
                </Badge>
                <span className="text-muted-foreground">
                  {linkedHoverData.name || linkedHoverData.label}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Content */}
        <div className="p-4">
          {children}
        </div>
      </Card>
    </motion.div>
  );
};
