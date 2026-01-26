import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Image, 
  FileText,
  Copy,
  Share2,
  Maximize2,
  Check,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportDropdownProps {
  data: any[];
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  onExportPNG?: () => void;
  onExportPDF?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  onFullscreen?: () => void;
  className?: string;
}

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  data,
  onExportCSV,
  onExportJSON,
  onExportPNG,
  onExportPDF,
  onCopy,
  onShare,
  onFullscreen,
  className
}) => {
  const [copied, setCopied] = useState(false);

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    
    if (!data?.length) return;
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (onExportJSON) {
      onExportJSON();
      return;
    }
    
    if (!data?.length) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else if (data?.length) {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-background/50 hover:bg-background"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-48 bg-popover/95 backdrop-blur-xl"
          >
            <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
              <div className="flex flex-col">
                <span>CSV</span>
                <span className="text-xs text-muted-foreground">Spreadsheet format</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
              <FileJson className="w-4 h-4 mr-2 text-amber-500" />
              <div className="flex flex-col">
                <span>JSON</span>
                <span className="text-xs text-muted-foreground">Data format</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onExportPNG} 
              disabled={!onExportPNG}
              className="cursor-pointer"
            >
              <Image className="w-4 h-4 mr-2 text-blue-500" />
              <div className="flex flex-col">
                <span>PNG Image</span>
                <span className="text-xs text-muted-foreground">Chart snapshot</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onExportPDF} 
              disabled={!onExportPDF}
              className="cursor-pointer"
            >
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              <div className="flex flex-col">
                <span>PDF Report</span>
                <span className="text-xs text-muted-foreground">Printable document</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Copy button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-9 w-9 bg-background/50 hover:bg-background"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {copied ? 'Copied!' : 'Copy data (⌘C)'}
          </TooltipContent>
        </Tooltip>

        {/* Share button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9 bg-background/50 hover:bg-background"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Share link
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen button */}
        {onFullscreen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onFullscreen}
                className="h-9 w-9 bg-background/50 hover:bg-background"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Fullscreen (F)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
