
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, TrendingUp, AlertCircle, CheckCircle2, RefreshCw, Hash, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface KeywordPerformanceCardProps {
  keywords: string[];
  keywordUsage: any[];
  isAnalyzing: boolean;
  onRetryAnalysis: () => void;
}

export const KeywordPerformanceCard: React.FC<KeywordPerformanceCardProps> = ({
  keywords,
  keywordUsage,
  isAnalyzing,
  onRetryAnalysis
}) => {
  const [expandedKeyword, setExpandedKeyword] = useState<string | null>(null);

  const getKeywordScore = (usage: any) => {
    const density = parseFloat(usage.density.replace('%', ''));
    if (density >= 1 && density <= 3) return { score: 100, status: 'excellent', color: 'text-green-500' };
    if (density >= 0.5 && density <= 5) return { score: 75, status: 'good', color: 'text-yellow-500' };
    if (density > 0) return { score: 50, status: 'low', color: 'text-orange-500' };
    return { score: 0, status: 'missing', color: 'text-red-500' };
  };

  const getOverallKeywordScore = () => {
    if (keywordUsage.length === 0) return 0;
    const totalScore = keywordUsage.reduce((acc, usage) => acc + getKeywordScore(usage).score, 0);
    return Math.round(totalScore / keywordUsage.length);
  };

  const getRecommendation = (usage: any) => {
    const density = parseFloat(usage.density.replace('%', ''));
    if (density === 0) return 'Add this keyword to your content';
    if (density < 0.5) return 'Increase keyword usage slightly';
    if (density > 5) return 'Reduce keyword usage to avoid over-optimization';
    if (density > 3) return 'Consider reducing keyword density slightly';
    return 'Optimal keyword density';
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Keyword Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            {keywordUsage.length > 0 && (
              <Badge variant="outline" className="bg-green-500/20 border-green-500/30">
                {getOverallKeywordScore()}% Score
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetryAnalysis}
              className="p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[calc(100%-4rem)] p-6">
          <div className="space-y-4">
            {/* Overall Performance Summary */}
            {keywordUsage.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-background/50 rounded-lg border border-green-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Overall Performance</span>
                  </div>
                  <div className={`text-lg font-bold ${getOverallKeywordScore() >= 75 ? 'text-green-500' : getOverallKeywordScore() >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {getOverallKeywordScore()}%
                  </div>
                </div>
                <Progress 
                  value={getOverallKeywordScore()} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground mt-2">
                  {keywordUsage.length} of {keywords.length} keywords analyzed
                </div>
              </motion.div>
            )}

            {/* Individual Keyword Analysis */}
            {keywords.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Keyword Analysis</span>
                </div>
                
                {keywords.map((keyword, idx) => {
                  const usage = keywordUsage.find(u => u.keyword.toLowerCase() === keyword.toLowerCase());
                  const score = usage ? getKeywordScore(usage) : { score: 0, status: 'not analyzed', color: 'text-gray-500' };
                  const isExpanded = expandedKeyword === keyword;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-green-500/20 rounded-lg overflow-hidden"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto bg-background/30 hover:bg-background/50"
                        onClick={() => setExpandedKeyword(isExpanded ? null : keyword)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={idx === 0 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {idx === 0 ? 'Primary' : 'Secondary'}
                          </Badge>
                          <span className="font-medium">{keyword}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {usage ? (
                            <>
                              <span className="text-sm text-muted-foreground">{usage.count} mentions</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${score.color.replace('text-', 'border-').replace('-500', '-300')}`}
                              >
                                {usage.density}
                              </Badge>
                              {score.status === 'excellent' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : score.status === 'good' ? (
                                <TrendingUp className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Not found</span>
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      </Button>
                      
                      {isExpanded && usage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 border-t border-green-500/20 bg-background/20"
                        >
                          <div className="space-y-3 pt-3">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Mentions</div>
                                <div className="font-medium">{usage.count}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Density</div>
                                <div className="font-medium">{usage.density}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Score</div>
                                <div className={`font-medium ${score.color}`}>{score.score}%</div>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-background/30 rounded border">
                              <div className="text-xs text-muted-foreground mb-1">Recommendation</div>
                              <div className="text-sm">{getRecommendation(usage)}</div>
                            </div>
                            
                            <Progress value={score.score} className="h-2" />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No keywords to analyze</p>
                <p className="text-xs mt-1">Add keywords to get performance insights</p>
              </div>
            )}

            {/* Performance Insights */}
            {keywordUsage.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20"
              >
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Insights
                </h4>
                <div className="space-y-2 text-sm">
                  {keywordUsage.filter(usage => getKeywordScore(usage).status === 'excellent').length > 0 && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>
                        {keywordUsage.filter(usage => getKeywordScore(usage).status === 'excellent').length} keywords optimally placed
                      </span>
                    </div>
                  )}
                  
                  {keywordUsage.filter(usage => parseFloat(usage.density.replace('%', '')) === 0).length > 0 && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        {keywordUsage.filter(usage => parseFloat(usage.density.replace('%', '')) === 0).length} keywords missing from content
                      </span>
                    </div>
                  )}
                  
                  {keywordUsage.filter(usage => parseFloat(usage.density.replace('%', '')) > 5).length > 0 && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        {keywordUsage.filter(usage => parseFloat(usage.density.replace('%', '')) > 5).length} keywords may be over-optimized
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
