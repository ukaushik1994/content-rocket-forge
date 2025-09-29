import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  LineChart,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ChartSuggestion {
  type: 'line' | 'bar' | 'pie' | 'area';
  confidence: number;
  reasoning: string;
  suggestedOptions?: {
    categories?: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
  };
}

interface ChartSuggestionPanelProps {
  suggestions: ChartSuggestion[];
  improvements: string[];
  currentType: 'line' | 'bar' | 'pie' | 'area';
  onApplySuggestion: (type: 'line' | 'bar' | 'pie' | 'area') => void;
  className?: string;
}

export const ChartSuggestionPanel: React.FC<ChartSuggestionPanelProps> = ({
  suggestions,
  improvements,
  currentType,
  onApplySuggestion,
  className
}) => {
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return LineChart;
      case 'bar':
        return BarChart3;
      case 'pie':
        return PieChart;
      case 'area':
        return TrendingUp;
      default:
        return BarChart3;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { variant: 'default' as const, label: 'High' };
    if (confidence >= 0.6) return { variant: 'secondary' as const, label: 'Medium' };
    return { variant: 'outline' as const, label: 'Low' };
  };

  if (!suggestions.length && !improvements.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Chart Type Suggestions */}
      {suggestions.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium text-foreground">AI Chart Recommendations</h4>
          </div>
          
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => {
              const Icon = getChartIcon(suggestion.type);
              const isCurrentType = suggestion.type === currentType;
              const confidenceBadge = getConfidenceBadge(suggestion.confidence);
              
              return (
                <motion.div
                  key={suggestion.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                    isCurrentType 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-background/50 border-border hover:bg-background/80"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-md",
                      isCurrentType ? "bg-primary/20" : "bg-muted/50"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        isCurrentType ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-sm font-medium capitalize",
                          isCurrentType ? "text-primary" : "text-foreground"
                        )}>
                          {suggestion.type} Chart
                        </span>
                        
                        {isCurrentType && (
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        )}
                        
                        <Badge 
                          variant={confidenceBadge.variant}
                          className="text-xs"
                        >
                          {confidenceBadge.label}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                  
                  {!isCurrentType && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApplySuggestion(suggestion.type)}
                      className="ml-2 shrink-0"
                    >
                      Apply
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Chart Improvements */}
      {improvements.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-info/5 to-warning/5 border border-info/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-info" />
            <h4 className="text-sm font-medium text-foreground">Suggested Improvements</h4>
          </div>
          
          <div className="space-y-2">
            {improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 p-2 rounded bg-background/30"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-info mt-2 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {improvement}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};