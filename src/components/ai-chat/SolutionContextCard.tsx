import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Lightbulb, Zap, ArrowRight, Target } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types/solution-types';

interface SolutionContextCardProps {
  solution: Solution;
  contextConfidence: number;
  onCreateWorkflow?: (solutionId: string, workflowType: string) => void;
  onViewFullDetails?: (solutionId: string) => void;
  className?: string;
}

export const SolutionContextCard: React.FC<SolutionContextCardProps> = ({
  solution,
  contextConfidence,
  onCreateWorkflow,
  onViewFullDetails,
  className = ""
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 70) return 'text-blue-500';
    if (confidence >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High Confidence';
    if (confidence >= 70) return 'Good Match';
    if (confidence >= 50) return 'Moderate Match';
    return 'Low Confidence';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {solution.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {solution.category}
                </Badge>
                <div className={`text-xs font-medium ${getConfidenceColor(contextConfidence)}`}>
                  {getConfidenceLabel(contextConfidence)} ({contextConfidence}%)
                </div>
              </div>
            </div>
            {solution.externalUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(solution.externalUrl!, '_blank')}
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {solution.description}
          </p>
          
          {/* Key Features */}
          {solution.features && solution.features.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Key Features
              </h4>
              <div className="flex flex-wrap gap-1">
                {solution.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {solution.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{solution.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Target Audience */}
          {solution.targetAudience && solution.targetAudience.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
                <Target className="h-3 w-3" />
                Target Audience
              </h4>
              <div className="flex flex-wrap gap-1">
                {solution.targetAudience.slice(0, 2).map((audience, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {audience}
                  </Badge>
                ))}
                {solution.targetAudience.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{solution.targetAudience.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button
              variant="default"
              size="sm"
              onClick={() => onCreateWorkflow?.(solution.id, 'content-strategy')}
              className="flex-1 h-8 text-xs"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Create Strategy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewFullDetails?.(solution.id)}
              className="h-8 text-xs"
            >
              Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};