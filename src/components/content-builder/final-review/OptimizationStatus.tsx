import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, Wand2, RefreshCw } from 'lucide-react';
import { ContentSyncService } from '@/services/contentSyncService';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

interface OptimizationStatusProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const OptimizationStatus = ({ onRefresh, isRefreshing = false }: OptimizationStatusProps) => {
  const { state } = useContentBuilder();
  const appliedCount = ContentSyncService.getAppliedCount();
  
  const getContentStatus = () => {
    if (!state.content || state.content.trim().length === 0) {
      return { status: 'empty', color: 'destructive', label: 'No Content' };
    }
    
    if (state.content.length < 500) {
      return { status: 'short', color: 'default', label: 'Short Content' };
    }
    
    if (state.content.length > 3000) {
      return { status: 'long', color: 'secondary', label: 'Long Content' };
    }
    
    return { status: 'good', color: 'default', label: 'Good Length' };
  };
  
  const getOptimizationStatus = () => {
    if (appliedCount === 0) {
      return { status: 'none', color: 'secondary', label: 'No Optimizations' };
    }
    
    if (appliedCount < 3) {
      return { status: 'few', color: 'default', label: 'Some Optimizations' };
    }
    
    return { status: 'many', color: 'default', label: 'Well Optimized' };
  };

  const contentStatus = getContentStatus();
  const optimizationStatus = getOptimizationStatus();

  return (
    <Card className="bg-glass border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-400" />
          Optimization Status
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="ml-auto text-white/70 hover:text-white"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Content Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Content</span>
          <Badge variant={contentStatus.color as any} className="text-xs">
            {contentStatus.label}
          </Badge>
        </div>
        
        {/* Optimization Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Applied Fixes</span>
          <Badge variant={optimizationStatus.color as any} className="text-xs">
            {appliedCount} {optimizationStatus.label}
          </Badge>
        </div>
        
        {/* Keyword Status */}
        {state.mainKeyword && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Main Keyword</span>
            <Badge variant="outline" className="text-xs">
              {state.mainKeyword}
            </Badge>
          </div>
        )}
        
        {/* SEO Status */}
        {state.seoScore !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">SEO Score</span>
            <Badge 
              variant={state.seoScore >= 80 ? 'default' : state.seoScore >= 60 ? 'secondary' : 'destructive'} 
              className="text-xs"
            >
              {state.seoScore}/100
            </Badge>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-xs text-white/60 mb-1">System Status</div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            <span className="text-xs text-white/80">AI Suggestions Active</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            <span className="text-xs text-white/80">Content Sync Ready</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            <span className="text-xs text-white/80">Undo System Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationStatus;