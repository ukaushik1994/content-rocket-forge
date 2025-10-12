import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Filter, 
  Lock, 
  Unlock,
  FileImage,
  FileSpreadsheet
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChartControlsProps {
  chartIndex: number;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  syncZoom: boolean;
  onToggleSyncZoom: () => void;
  onExportPNG?: () => void;
  onExportCSV?: () => void;
  showFilter?: boolean;
  onToggleFilter?: () => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  chartIndex,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  syncZoom,
  onToggleSyncZoom,
  onExportPNG,
  onExportCSV,
  showFilter,
  onToggleFilter
}) => {
  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        {/* Zoom In */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onZoomIn}
              disabled={zoomLevel >= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>

        {/* Zoom Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>

        {/* Zoom Level Display */}
        {zoomLevel !== 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={onResetZoom}
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom</TooltipContent>
          </Tooltip>
        )}

        {/* Sync Zoom Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={syncZoom ? 'default' : 'ghost'}
              size="icon"
              className={cn("h-8 w-8", syncZoom && "bg-primary/20")}
              onClick={onToggleSyncZoom}
            >
              {syncZoom ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {syncZoom ? 'Unlink Zoom' : 'Link Zoom'}
          </TooltipContent>
        </Tooltip>

        {/* Filter Toggle */}
        {showFilter && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFilter}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Filters</TooltipContent>
          </Tooltip>
        )}

        {/* Export/Download Dropdown */}
        {(onExportPNG || onExportCSV) && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Export Chart</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {onExportPNG && (
                <DropdownMenuItem onClick={onExportPNG}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
              )}
              {onExportCSV && (
                <DropdownMenuItem onClick={onExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TooltipProvider>
    </div>
  );
};
