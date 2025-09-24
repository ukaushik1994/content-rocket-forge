import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, Users, Zap } from 'lucide-react';

interface SolutionIntelligenceCardProps {
  solution: {
    id: string;
    name: string;
    description: string;
    features?: string[];
    targetAudience?: string[];
    painPoints?: string[];
    category?: string;
    externalUrl?: string;
  };
  onAnalyze?: (solutionId: string) => void;
  onCreateContent?: (solutionId: string) => void;
  onViewDetails?: (solutionId: string) => void;
}

export const SolutionIntelligenceCard: React.FC<SolutionIntelligenceCardProps> = ({
  solution,
  onAnalyze,
  onCreateContent,
  onViewDetails
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-foreground">
                {solution.name}
              </CardTitle>
              {solution.category && (
                <Badge variant="secondary" className="mt-1">
                  {solution.category}
                </Badge>
              )}
            </div>
            {solution.externalUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={solution.externalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {solution.description}
          </p>
          
          {solution.features && solution.features.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Key Features</span>
              </div>
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
          
          {solution.targetAudience && solution.targetAudience.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Target Audience</span>
              </div>
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
          
          <div className="flex gap-2 pt-2">
            {onAnalyze && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAnalyze(solution.id)}
                className="flex-1"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            )}
            {onCreateContent && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => onCreateContent(solution.id)}
                className="flex-1"
              >
                Create Content
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};