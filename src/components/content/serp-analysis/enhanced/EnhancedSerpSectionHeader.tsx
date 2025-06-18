
import React from 'react';
import { ChevronDown, ChevronRight, RefreshCw, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedSerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'blue' | 'green' | 'amber' | 'indigo' | 'teal' | 'rose' | 'purple';
  description?: string;
  count: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  apiSource?: string;
  dataFreshness?: 'fresh' | 'cached' | 'stale';
  selectedCount?: number;
}

export function EnhancedSerpSectionHeader({ 
  title, 
  expanded, 
  onToggle, 
  variant = 'blue',
  description,
  count,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  apiSource,
  dataFreshness = 'fresh',
  selectedCount = 0
}: EnhancedSerpSectionHeaderProps) {
  const variantColors = {
    blue: "text-blue-400 hover:text-blue-300 border-blue-500/20",
    green: "text-green-400 hover:text-green-300 border-green-500/20",
    amber: "text-amber-400 hover:text-amber-300 border-amber-500/20",
    indigo: "text-indigo-400 hover:text-indigo-300 border-indigo-500/20",
    teal: "text-teal-400 hover:text-teal-300 border-teal-500/20",
    rose: "text-rose-400 hover:text-rose-300 border-rose-500/20",
    purple: "text-purple-400 hover:text-purple-300 border-purple-500/20",
  };
  
  const bgVariantColors = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    green: "bg-green-500/10 text-green-300 border-green-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    teal: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  };

  const freshnessColors = {
    fresh: "bg-green-500/20 text-green-300 border-green-500/40",
    cached: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    stale: "bg-red-500/20 text-red-300 border-red-500/40"
  };
  
  return (
    <div className={`flex flex-col border-b border-white/10 hover:bg-white/5 transition-colors ${variantColors[variant]}`}>
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={onToggle}
          className={`justify-start h-auto py-0 px-0 text-left ${variantColors[variant]} hover:bg-transparent flex-1`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {expanded ? (
                <ChevronDown className="h-4 w-4 transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform" />
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-base font-medium">{title}</span>
              
              {count > 0 && (
                <Badge className={`text-xs font-medium ${bgVariantColors[variant]} border`}>
                  {count}
                </Badge>
              )}
              
              {selectedCount > 0 && (
                <Badge className="text-xs font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                  {selectedCount} selected
                </Badge>
              )}
              
              {description && (
                <span className="text-xs text-white/50 hidden md:inline">
                  • {description}
                </span>
              )}
            </div>
          </div>
        </Button>
        
        <div className="flex items-center gap-2 ml-4">
          {/* API Source Badge */}
          {apiSource && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className={`text-xs ${freshnessColors[dataFreshness]} border`}>
                    {apiSource}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data source: {apiSource}</p>
                  <p className="text-xs opacity-75">Freshness: {dataFreshness}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-7 w-7 p-0 hover:bg-white/10"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {expanded && hasMore && onLoadMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoading}
                className="h-7 px-2 text-xs hover:bg-white/10 gap-1"
              >
                <Plus className="h-3 w-3" />
                More
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-white/10"
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      {isLoading && expanded && (
        <div className="px-4 pb-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
