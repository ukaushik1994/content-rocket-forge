
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Heading2, KeyRound, Wand2, Sparkles, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';

interface RecommendationsCardProps {
  recommendations: string[];
  recommendationIds: string[];
  isAnalyzing: boolean;
  handleRewriteContent: (recommendation: string, id: string) => void;
  isRecommendationApplied: (id: string) => boolean;
  showRecoveryOption?: boolean;
  onForceSkip?: () => void;
  improvements?: SeoImprovement[];
}

export const RecommendationsCard = memo(({ 
  recommendations, 
  recommendationIds,
  isAnalyzing,
  handleRewriteContent,
  isRecommendationApplied,
  showRecoveryOption,
  onForceSkip,
  improvements = []
}: RecommendationsCardProps) => {
  
  // Get appropriate icon based on recommendation type
  const getRecommendationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'keyword':
        return <KeyRound className="h-4 w-4 text-blue-500" />;
      case 'content':
      case 'readability':
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'structure':
        return <Heading2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
    }
  };
  
  // Get appropriate background class based on recommendation type
  const getRecommendationBg = (type: string, impact: string, isApplied: boolean) => {
    if (isApplied) return 'bg-green-500/5 border-green-500/20';
    
    // Impact colors
    if (impact === 'high') {
      return 'border-red-500/20 hover:bg-red-500/5';
    }
    
    // Type colors
    switch (type.toLowerCase()) {
      case 'keyword':
        return 'border-blue-500/20 hover:bg-blue-500/5';
      case 'content':
      case 'readability':
        return 'border-green-500/20 hover:bg-green-500/5';
      case 'structure':
        return 'border-purple-500/20 hover:bg-purple-500/5';
      default:
        return 'border-indigo-500/20 hover:bg-indigo-500/5';
    }
  };

  // Show limited number of recommendations to improve performance
  const visibleRecommendations = improvements.slice(0, 5);
  const hasMoreRecommendations = improvements.length > visibleRecommendations.length;
  
  return (
    <Card className="shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between items-center">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Optimization Suggestions
          </span>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-400/30">
            Click suggestions to optimize
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleRecommendations.length > 0 ? (
          <>
            <motion.ul 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {visibleRecommendations.map((improvement, index) => {
                const isApplied = isRecommendationApplied(improvement.id);
                const { recommendation, type, impact } = improvement;
                
                return (
                  <motion.li 
                    key={index} 
                    className={`flex items-start gap-2 p-3 border rounded-md transition-all ${getRecommendationBg(type, impact, isApplied)} ${isApplied ? 'opacity-70' : ''}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="mt-0.5">
                      {isApplied ? 
                        <CheckCircle className="h-5 w-5 text-green-500" /> : 
                        getRecommendationIcon(type)
                      }
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${isApplied ? 'text-muted-foreground' : ''}`}>
                        {recommendation}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {isApplied ? (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/30 bg-green-500/10">
                            Optimization Applied
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline" className={`text-xs ${
                              impact === 'high' ? 'text-red-500 border-red-500/30 bg-red-500/10' :
                              impact === 'medium' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' :
                              'text-blue-500 border-blue-500/30 bg-blue-500/10'
                            }`}>
                              {impact === 'high' ? 'High Impact' : 
                               impact === 'medium' ? 'Medium Impact' : 'Low Impact'}
                            </Badge>
                            
                            <Badge variant="outline" className={`text-xs ${
                              type === 'keyword' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5' :
                              type === 'structure' ? 'text-purple-500 border-purple-500/30 bg-purple-500/5' :
                              'text-green-500 border-green-500/30 bg-green-500/5'
                            }`}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={`${isApplied ? 'opacity-0 pointer-events-none' : 'opacity-100'} gap-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 border border-purple-500/30`}
                      onClick={() => handleRewriteContent(recommendation, improvement.id)}
                      disabled={isApplied}
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Optimize</span>
                    </Button>
                  </motion.li>
                );
              })}
            </motion.ul>
            
            {hasMoreRecommendations && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-gray-100">
                  + {improvements.length - visibleRecommendations.length} more suggestions
                </Badge>
              </div>
            )}
            
            {/* Recovery option - shown when analysis is taking too long */}
            {showRecoveryOption && (
              <div className="mt-4 p-3 border border-red-200 rounded-md bg-red-50">
                <div className="flex items-center gap-2 mb-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">Is your analysis stuck?</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-100"
                  onClick={onForceSkip}
                >
                  Skip & Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 px-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 text-purple-500 animate-spin mb-3" />
                <p className="text-muted-foreground">Analyzing your content...</p>
                
                {/* Recovery option */}
                {showRecoveryOption && (
                  <div className="mt-6 max-w-sm mx-auto">
                    <div className="p-3 border border-red-200 rounded-md bg-red-50">
                      <div className="flex items-center gap-2 mb-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">Analysis is taking too long</p>
                      </div>
                      <p className="text-xs text-red-700 mb-3">
                        You can skip this step and continue with your content.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-100"
                        onClick={onForceSkip}
                      >
                        Skip & Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <Sparkles className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-muted-foreground">Run the analysis to get optimization suggestions</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Add display name for React devtools
RecommendationsCard.displayName = 'RecommendationsCard';
