import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Lightbulb, 
  ArrowRight, 
  Star, 
  Plus, 
  TrendingUp,
  Zap,
  Target,
  Link
} from 'lucide-react';
import { useSolutionRecommendations } from '@/hooks/useSolutionRecommendations';
import { Solution } from '@/contexts/content-builder/types/solution-types';

interface SolutionRecommendationsProps {
  currentSolutions: Solution[];
  contextSolutions?: Solution[];
  allSolutions: Solution[];
  onSelectSolution: (solution: Solution) => void;
  onCreateComparison?: (solution1: Solution, solution2: Solution) => void;
  className?: string;
}

export const SolutionRecommendations: React.FC<SolutionRecommendationsProps> = ({
  currentSolutions,
  contextSolutions = [],
  allSolutions,
  onSelectSolution,
  onCreateComparison,
  className = ""
}) => {
  const { recommendations, isLoading } = useSolutionRecommendations(
    currentSolutions,
    contextSolutions,
    allSolutions
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complementary': return <Plus className="h-4 w-4" />;
      case 'enhancement': return <TrendingUp className="h-4 w-4" />;
      case 'workflow': return <Link className="h-4 w-4" />;
      case 'alternative': return <ArrowRight className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complementary': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'enhancement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'workflow': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'alternative': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Recommended Solutions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on your current solutions and conversation context
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.solution.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Zap className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{rec.solution.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${getTypeColor(rec.type)}`}>
                                <span className="flex items-center gap-1">
                                  {getTypeIcon(rec.type)}
                                  {rec.type}
                                </span>
                              </Badge>
                              <div className="flex items-center gap-1">
                                {getScoreStars(rec.score)}
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({Math.round(rec.score * 100)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {rec.reason}
                        </p>
                        
                        {rec.solution.description && (
                          <p className="text-xs text-muted-foreground/80 mb-3 line-clamp-1">
                            {rec.solution.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {rec.solution.category && (
                              <Badge variant="outline" className="text-xs">
                                {rec.solution.category}
                              </Badge>
                            )}
                            {rec.solution.targetAudience && rec.solution.targetAudience.length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                                      <Target className="h-2 w-2" />
                                      {rec.solution.targetAudience.length} audiences
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      {rec.solution.targetAudience.join(', ')}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {onCreateComparison && currentSolutions.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCreateComparison(currentSolutions[0], rec.solution)}
                                className="h-7 px-2 text-xs"
                              >
                                Compare
                              </Button>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => onSelectSolution(rec.solution)}
                              className="h-7 px-3 text-xs"
                            >
                              Explore
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};