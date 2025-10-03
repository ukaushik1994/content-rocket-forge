import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComparisonPanelProps {
  comparisons: any[];
  onClose: () => void;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  comparisons,
  onClose
}) => {
  if (comparisons.length < 2) return null;

  const [point1, point2] = comparisons;

  const calculateDifference = (key: string) => {
    const val1 = point1[key];
    const val2 = point2[key];
    
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      const diff = val2 - val1;
      const percentDiff = ((diff / val1) * 100).toFixed(1);
      return {
        absolute: diff,
        percent: percentDiff,
        isIncrease: diff > 0
      };
    }
    
    return null;
  };

  const keys = Object.keys(point1).filter(
    key => typeof point1[key] === 'number' && key !== 'chartIndex'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="glass-panel bg-glass border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Comparison Analysis</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Point 1 */}
          <div className="space-y-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Point 1
            </Badge>
            {keys.map(key => (
              <div key={key} className="glass-panel bg-glass border border-white/10 rounded p-3">
                <div className="text-xs text-muted-foreground capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-lg font-bold">
                  {point1[key].toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Differences */}
          <div className="space-y-3 flex flex-col items-center justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground mb-4" />
            {keys.map(key => {
              const diff = calculateDifference(key);
              if (!diff) return null;

              return (
                <div 
                  key={key} 
                  className={cn(
                    "glass-panel border rounded p-3 w-full text-center",
                    diff.isIncrease 
                      ? "bg-success/10 border-success/20" 
                      : "bg-destructive/10 border-destructive/20"
                  )}
                >
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                    {diff.isIncrease ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={diff.isIncrease ? "text-success" : "text-destructive"}>
                      {diff.isIncrease ? '+' : ''}{diff.percent}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {diff.isIncrease ? '+' : ''}{diff.absolute.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Point 2 */}
          <div className="space-y-3">
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              Point 2
            </Badge>
            {keys.map(key => (
              <div key={key} className="glass-panel bg-glass border border-white/10 rounded p-3">
                <div className="text-xs text-muted-foreground capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-lg font-bold">
                  {point2[key].toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
