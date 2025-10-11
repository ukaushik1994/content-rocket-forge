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
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  syncZoom: boolean;
  onToggleSyncZoom: () => void;
  linkedHoverData?: any;
  onHover?: (data: any) => void;
  className?: string;
}

export const ChartInteractiveWrapper: React.FC<ChartInteractiveWrapperProps> = ({
  chartIndex,
  title,
  description,
  children,
  zoomLevel,
  onZoomChange,
  syncZoom,
  onToggleSyncZoom,
  linkedHoverData,
  onHover,
  className
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.25, 2);
    onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.25, 0.5);
    onZoomChange(newZoom);
  };

  const handleResetZoom = () => {
    onZoomChange(1);
  };

  return (
    <motion.div
      className={cn(
        "relative",
        isFullscreen && "fixed inset-0 z-50 bg-background p-8",
        className
      )}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={cn(
        "overflow-hidden",
        isFullscreen && "h-full"
      )}>
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
            chartIndex={chartIndex}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            syncZoom={syncZoom}
            onToggleSyncZoom={onToggleSyncZoom}
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

        {/* Chart Content with Zoom */}
        <div 
          className={cn(
            "p-4 transition-transform duration-200",
            isFullscreen && "h-[calc(100%-80px)]"
          )}
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          {children}
        </div>
      </Card>
    </motion.div>
  );
};
