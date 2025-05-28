
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { validateKeywordUsage } from '@/utils/validation/dataValidation';

interface KeywordPerformanceCardProps {
  keywords: string[];
  keywordUsage: any[];
  isAnalyzing: boolean;
  onRetryAnalysis?: () => void;
}

export const KeywordPerformanceCard: React.FC<KeywordPerformanceCardProps> = ({
  keywords,
  keywordUsage,
  isAnalyzing,
  onRetryAnalysis
}) => {
  // Validate input data
  const validKeywords = React.useMemo(() => {
    return Array.isArray(keywords) ? keywords.filter(k => k && typeof k === 'string') : [];
  }, [keywords]);

  const validKeywordUsage = React.useMemo(() => {
    if (!Array.isArray(keywordUsage)) return [];
    
    const validation = validateKeywordUsage(keywordUsage);
    if (!validation.isValid) {
      console.warn('Keyword usage validation failed:', validation.errors);
    }
    
    return keywordUsage.filter(usage => 
      usage && 
      typeof usage === 'object' && 
      usage.keyword && 
      typeof usage.keyword === 'string'
    );
  }, [keywordUsage]);

  const getDensityScore = useCallback((density: string) => {
    if (!density || typeof density !== 'string') return 'unknown';
    const num = parseFloat(density.replace('%', ''));
    if (isNaN(num)) return 'unknown';
    if (num >= 1 && num <= 3) return 'optimal';
    if (num < 1) return 'low';
    return 'high';
  }, []);

  const getDensityColor = useCallback((density: string) => {
    const score = getDensityScore(density);
    switch (score) {
      case 'optimal': return 'text-green-500';
      case 'low': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  }, [getDensityScore]);

  const getScoreText = useCallback((density: string) => {
    const score = getDensityScore(density);
    switch (score) {
      case 'optimal': return 'Optimal';
      case 'low': return 'Too Low';
      case 'high': return 'Too High';
      default: return 'Unknown';
    }
  }, [getDensityScore]);

  if (isAnalyzing) {
    return (
      <Card className="h-full bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <motion.div
              className="h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-muted-foreground">Analyzing keywords...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary fallbackTitle="Keyword Analysis Error" onRetry={onRetryAnalysis}>
      <Card className="h-full bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full p-0">
          <ScrollArea className="h-[calc(100%-4rem)] p-6">
            {validKeywords && validKeywords.length > 0 ? (
              <div className="space-y-4">
                {/* Keywords Overview */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                    <div className="text-lg font-bold text-green-500">{validKeywords.length}</div>
                    <div className="text-xs text-muted-foreground">Total Keywords</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                    <div className="text-lg font-bold text-green-500">
                      {validKeywordUsage.filter(k => k?.density && getDensityScore(k.density) === 'optimal').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Optimized</div>
                  </div>
                </div>

                {/* Keywords List */}
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700 dark:text-green-300">All Keywords</h4>
                  {validKeywords.map((keyword, index) => {
                    const usage = validKeywordUsage.find(k => 
                      k?.keyword && k.keyword.toLowerCase() === keyword.toLowerCase()
                    );
                    
                    return (
                      <motion.div
                        key={`keyword-${index}-${keyword}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-background/50 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium truncate" title={keyword}>{keyword}</span>
                          <div className="flex items-center gap-2 ml-2">
                            {index === 0 && (
                              <Badge variant="default" className="text-xs">Primary</Badge>
                            )}
                            {usage && usage.density && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getDensityColor(usage.density)}`}
                              >
                                {usage.density}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {usage && usage.density ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Usage: {usage.count || 0} times</span>
                              <span className={getDensityColor(usage.density)}>
                                {getScoreText(usage.density)}
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(parseFloat(usage.density.replace('%', '') || '0') * 10, 100)} 
                              className="h-2"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No usage data available
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Keyword Usage Analysis */}
                {validKeywordUsage && validKeywordUsage.length > 0 && (
                  <div className="mt-6 p-4 bg-background/30 rounded-lg border border-white/10">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Usage Analysis
                    </h4>
                    <div className="space-y-2">
                      {validKeywordUsage.map((usage, index) => (
                        <div key={`usage-${index}-${usage.keyword}`} className="flex justify-between items-center text-sm">
                          <span className="truncate" title={usage.keyword}>{usage.keyword}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-muted-foreground">{usage.count || 0}x</span>
                            <span className={`font-medium ${getDensityColor(usage.density || '')}`}>
                              {usage.density || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No keywords available</p>
                  {onRetryAnalysis && (
                    <Button variant="outline" size="sm" onClick={onRetryAnalysis}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Analysis
                    </Button>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};
