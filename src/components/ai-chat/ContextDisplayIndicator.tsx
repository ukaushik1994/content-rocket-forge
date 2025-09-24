import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Eye,
  Zap,
  Target
} from 'lucide-react';

interface ContextSource {
  type: 'solution' | 'company' | 'competitor' | 'brand';
  name: string;
  confidence: number;
  dataPoints: number;
}

interface ContextDisplayIndicatorProps {
  sources: ContextSource[];
  isActive: boolean;
  overallConfidence: number;
  onShowDetails?: () => void;
  className?: string;
  variant?: 'compact' | 'detailed';
}

export const ContextDisplayIndicator: React.FC<ContextDisplayIndicatorProps> = ({
  sources,
  isActive,
  overallConfidence,
  onShowDetails,
  className = "",
  variant = 'compact'
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800';
    if (confidence >= 70) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'solution': return <Zap className="h-3 w-3" />;
      case 'company': return <Target className="h-3 w-3" />;
      case 'competitor': return <Database className="h-3 w-3" />;
      case 'brand': return <Eye className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getStatusIcon = () => {
    if (overallConfidence >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (overallConfidence >= 60) return <Info className="h-4 w-4 text-blue-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  if (!isActive || sources.length === 0) return null;

  if (variant === 'compact') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className={`inline-flex items-center gap-2 ${className}`}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowDetails}
                  className={`h-7 px-2 gap-1.5 text-xs font-medium transition-all duration-200 ${getConfidenceColor(overallConfidence)}`}
                >
                  <Brain className="h-3 w-3" />
                  Context Active
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {Math.round(overallConfidence)}%
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  <div className="font-medium text-xs">AI Context Sources:</div>
                  {sources.slice(0, 3).map((source, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {getSourceIcon(source.type)}
                      <span>{source.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(source.confidence)}%
                      </Badge>
                    </div>
                  ))}
                  {sources.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{sources.length - 3} more sources
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Detailed variant
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={className}
      >
        <Card className="bg-gradient-to-r from-background via-background to-muted/20 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium text-sm">AI Context Active</h4>
                  <p className="text-xs text-muted-foreground">
                    Using {sources.length} data source{sources.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge className={getConfidenceColor(overallConfidence)}>
                  {Math.round(overallConfidence)}% confidence
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Active Sources
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((source, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50"
                  >
                    {getSourceIcon(source.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.dataPoints} data points
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(source.confidence)}`}
                    >
                      {Math.round(source.confidence)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {onShowDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowDetails}
                className="w-full mt-3 h-8 text-xs"
              >
                View Context Details
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};