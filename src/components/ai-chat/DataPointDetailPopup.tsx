import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPointDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const DataPointDetailPopup: React.FC<DataPointDetailPopupProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!data) return null;

  const entries = Object.entries(data).filter(
    ([key]) => key !== 'chartIndex' && key !== 'payload' && key !== 'dataKey'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border border-white/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Data Point Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {entries.map(([key, value], index) => {
                const isNumeric = typeof value === 'number';
                const trend = isNumeric && value > 50 ? 'up' : 'down';

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-panel bg-glass border border-white/10 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs text-muted-foreground font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                      {isNumeric && (
                        <div className={cn(
                          "p-1 rounded",
                          trend === 'up' ? "bg-success/20" : "bg-destructive/20"
                        )}>
                          {trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-success" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-lg font-bold">
                      {typeof value === 'number' 
                        ? value.toLocaleString()
                        : String(value)
                      }
                    </div>

                    {isNumeric && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "mt-2 text-xs",
                          trend === 'up' 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {trend === 'up' ? 'Above Average' : 'Below Average'}
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {data.chartIndex !== undefined && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-muted-foreground">
                  From Chart {data.chartIndex + 1}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
