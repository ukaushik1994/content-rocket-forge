import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  ChevronRight,
  RefreshCw,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { performanceMonitorService, PerformanceData } from '@/services/performanceMonitorService';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizationChange {
  type: string;
  section: string;
  original: string;
  improved: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationResult {
  optimizedContent: string;
  changes: OptimizationChange[];
  predictedImpact: {
    bounceRate: string;
    ctr: string;
    engagement: string;
    performance: string;
  };
  summary: string;
}

interface OptimizationSuggestionsProps {
  contentId: string;
  currentContent: string;
  performanceData: PerformanceData;
  contentType?: string;
  targetKeywords?: string[];
  onApply?: (optimizedContent: string) => void;
  className?: string;
}

export const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({
  contentId,
  currentContent,
  performanceData,
  contentType = 'blog',
  targetKeywords = [],
  onApply,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [selectedChange, setSelectedChange] = useState<OptimizationChange | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchOptimizations = async () => {
    if (!currentContent) return;
    
    setLoading(true);
    try {
      const result = await performanceMonitorService.requestOptimization(
        contentId,
        currentContent,
        performanceData,
        contentType,
        targetKeywords
      );

      if (result) {
        setOptimization(result);
      }
    } catch (error) {
      console.error('Error fetching optimizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate optimization suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChange = (change: OptimizationChange) => {
    setAppliedChanges(prev => new Set([...prev, `${change.type}-${change.section}`]));
    toast({
      title: 'Change Applied',
      description: `Applied ${change.type} optimization to ${change.section}`
    });
  };

  const handleApplyAll = () => {
    if (optimization?.optimizedContent && onApply) {
      onApply(optimization.optimizedContent);
      toast({
        title: 'All Changes Applied',
        description: 'The optimized content has been applied'
      });
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'headline':
        return '📰';
      case 'cta':
        return '🎯';
      case 'structure':
        return '📋';
      case 'readability':
        return '📖';
      case 'seo':
        return '🔍';
      case 'performance':
        return '⚡';
      default:
        return '✨';
    }
  };

  const hasPerformanceData = performanceData.ga4 || performanceData.gsc || performanceData.psi || performanceData.heatmap;

  if (!hasPerformanceData) {
    return (
      <Card className={`bg-muted/30 ${className}`}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No performance data available to generate optimizations.</p>
          <p className="text-sm mt-1">Connect analytics to enable AI optimization suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card/50 backdrop-blur ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Optimization Suggestions
            </CardTitle>
            <CardDescription className="mt-1">
              Data-driven content improvements based on performance metrics
            </CardDescription>
          </div>
          <Button
            onClick={fetchOptimizations}
            disabled={loading}
            variant={optimization ? 'outline' : 'default'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {optimization ? 'Regenerate' : 'Generate Suggestions'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : optimization ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">{optimization.summary}</p>
            </div>

            {/* Predicted Impact */}
            <div>
              <h4 className="font-medium mb-3">Predicted Impact</h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Bounce Rate', value: optimization.predictedImpact.bounceRate },
                  { label: 'CTR', value: optimization.predictedImpact.ctr },
                  { label: 'Engagement', value: optimization.predictedImpact.engagement },
                  { label: 'Performance', value: optimization.predictedImpact.performance }
                ].map((metric) => {
                  const isPositive = metric.value.startsWith('+') || metric.value.includes('improve');
                  const isNegative = metric.value.startsWith('-') && metric.label !== 'Bounce Rate';
                  
                  return (
                    <div 
                      key={metric.label}
                      className="p-3 rounded-lg bg-muted/30 text-center"
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
                        <span className={`font-bold ${
                          isPositive ? 'text-green-500' : 
                          isNegative ? 'text-red-500' : 
                          'text-muted-foreground'
                        }`}>
                          {metric.value}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Changes List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Suggested Changes ({optimization.changes.length})</h4>
                {onApply && (
                  <Button size="sm" onClick={handleApplyAll}>
                    Apply All Changes
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  <AnimatePresence>
                    {optimization.changes.map((change, index) => {
                      const changeKey = `${change.type}-${change.section}`;
                      const isApplied = appliedChanges.has(changeKey);
                      
                      return (
                        <motion.div
                          key={changeKey}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            isApplied 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : selectedChange === change
                                ? 'bg-primary/10 border-primary/30'
                                : 'bg-muted/20 border-border/30 hover:bg-muted/40'
                          }`}
                          onClick={() => setSelectedChange(change)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getChangeTypeIcon(change.type)}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize">{change.type}</span>
                                  {getPriorityBadge(change.priority)}
                                </div>
                                <p className="text-xs text-muted-foreground">{change.section}</p>
                              </div>
                            </div>
                            {isApplied ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyChange(change);
                                }}
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                          
                          <p className="text-sm mt-2 text-muted-foreground">{change.reason}</p>
                          
                          {selectedChange === change && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-3 border-t border-border/30 space-y-2"
                            >
                              <div>
                                <p className="text-xs font-medium text-red-400 mb-1">Original:</p>
                                <p className="text-sm bg-red-500/10 p-2 rounded line-through">
                                  {change.original.substring(0, 200)}
                                  {change.original.length > 200 ? '...' : ''}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-green-400 mb-1">Improved:</p>
                                <p className="text-sm bg-green-500/10 p-2 rounded">
                                  {change.improved.substring(0, 200)}
                                  {change.improved.length > 200 ? '...' : ''}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Click "Generate Suggestions" to get AI-powered optimization recommendations</p>
            <p className="text-sm mt-1">Based on your GA4, Search Console, PageSpeed, and heatmap data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
