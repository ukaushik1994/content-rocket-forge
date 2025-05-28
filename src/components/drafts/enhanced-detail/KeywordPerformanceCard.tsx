
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordPerformanceCardProps {
  keywords: string[];
  keywordUsage: any[];
  isAnalyzing: boolean;
}

export const KeywordPerformanceCard: React.FC<KeywordPerformanceCardProps> = ({
  keywords,
  keywordUsage,
  isAnalyzing
}) => {
  const getDensityScore = (density: string) => {
    const num = parseFloat(density.replace('%', ''));
    if (num >= 1 && num <= 3) return 'optimal';
    if (num < 1) return 'low';
    return 'high';
  };

  const getDensityColor = (density: string) => {
    const score = getDensityScore(density);
    if (score === 'optimal') return 'text-green-500';
    if (score === 'low') return 'text-yellow-500';
    return 'text-red-500';
  };

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
    <Card className="h-full bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Keyword Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[calc(100%-4rem)] p-6">
          {keywords.length > 0 ? (
            <div className="space-y-4">
              {/* Keywords Overview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-green-500">{keywords.length}</div>
                  <div className="text-xs text-muted-foreground">Total Keywords</div>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-white/10 text-center">
                  <div className="text-lg font-bold text-green-500">
                    {keywordUsage.filter(k => getDensityScore(k.density) === 'optimal').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Optimized</div>
                </div>
              </div>

              {/* Keywords List */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-700 dark:text-green-300">All Keywords</h4>
                {keywords.map((keyword, index) => {
                  const usage = keywordUsage.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-background/50 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{keyword}</span>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                          {usage && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getDensityColor(usage.density)}`}
                            >
                              {usage.density}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {usage && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Usage: {usage.count} times</span>
                            <span className={getDensityColor(usage.density)}>
                              {getDensityScore(usage.density) === 'optimal' ? 'Optimal' : 
                               getDensityScore(usage.density) === 'low' ? 'Too Low' : 'Too High'}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(parseFloat(usage.density.replace('%', '')) * 10, 100)} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      {!usage && (
                        <div className="text-sm text-muted-foreground">
                          No usage data available
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Keyword Usage Analysis */}
              {keywordUsage.length > 0 && (
                <div className="mt-6 p-4 bg-background/30 rounded-lg border border-white/10">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Usage Analysis
                  </h4>
                  <div className="space-y-2">
                    {keywordUsage.map((usage, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="truncate">{usage.keyword}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-muted-foreground">{usage.count}x</span>
                          <span className={`font-medium ${getDensityColor(usage.density)}`}>
                            {usage.density}
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
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No keywords available</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
