import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ProgressIndicatorCardProps {
  title: string;
  value: string | number;
  description: string;
  progress?: number;
  progressLabel?: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
  className?: string;
}

export const ProgressIndicatorCard: React.FC<ProgressIndicatorCardProps> = ({
  title,
  value,
  description,
  progress,
  progressLabel,
  icon: Icon,
  gradient,
  delay = 0,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group ${className}`}
    >
      <Card className={`glass-card border border-white/20 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/30 ${gradient}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
              <Icon className="h-4 w-4" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
            className="text-2xl font-bold text-white"
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.div>
          <p className="text-xs text-white/70 leading-relaxed">
            {description}
          </p>
          {progress !== undefined && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: delay + 0.4, duration: 0.6, ease: "easeOut" }}
              className="space-y-2"
            >
              <Progress 
                value={progress} 
                className="h-2 bg-white/10"
              />
              {progressLabel && (
                <p className="text-xs text-primary font-medium">
                  {progressLabel}
                </p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};