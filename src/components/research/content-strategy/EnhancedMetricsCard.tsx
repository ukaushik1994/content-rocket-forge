import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, Target, BarChart3, Zap } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  progressLabel?: string;
  icon: LucideIcon;
  gradient: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  delay?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const EnhancedMetricsCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  progress,
  progressLabel,
  icon: Icon,
  gradient,
  badge,
  badgeVariant = 'outline',
  delay = 0,
  trend,
  trendValue
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />;
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1] // Custom easing for smoother animation
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group h-full"
    >
      <Card className={`
        h-full glass-card border border-white/20 shadow-xl overflow-hidden
        transition-all duration-500 group-hover:shadow-2xl group-hover:border-white/30
        ${gradient}
      `}>
        {/* Animated Border Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-xl" />
        </div>
        
        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white/90 flex items-center gap-2">
              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.4, type: "spring" }}
                className="p-2 rounded-lg glass-panel border border-white/20 group-hover:border-white/30 transition-all duration-300 group-hover:scale-110"
              >
                <Icon className="h-4 w-4" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.3 }}
              >
                {title}
              </motion.span>
            </CardTitle>
            
            {badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.4 }}
              >
                <Badge 
                  variant={badgeVariant} 
                  className="glass-panel border-white/20 text-xs"
                >
                  {badge}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Main Value */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: delay + 0.4, 
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            className="space-y-2"
          >
            <div className="text-3xl font-bold text-white tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {subtitle && (
              <p className="text-xs text-white/70 leading-relaxed">
                {subtitle}
              </p>
            )}
            
            {/* Trend Indicator */}
            {trend && trendValue && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: delay + 0.5 }}
                className="flex items-center gap-1"
              >
                {getTrendIcon()}
                <span className={`text-xs font-medium ${getTrendColor()}`}>
                  {trendValue}
                </span>
              </motion.div>
            )}
          </motion.div>
          
          {/* Progress Section */}
          {progress !== undefined && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ 
                delay: delay + 0.6, 
                duration: 0.8, 
                ease: "easeOut" 
              }}
              className="space-y-2"
            >
              <Progress 
                value={progress} 
                className="h-2 bg-white/10 overflow-hidden"
              />
              {progressLabel && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.8 }}
                  className="text-xs text-primary font-medium flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  {progressLabel}
                </motion.p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};