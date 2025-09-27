
import React from 'react';
import { motion } from 'framer-motion';
import { VisualData } from '@/types/enhancedChat';
import { LineChart, BarChart, PieChartComponent } from '@/components/ui/chart';
import { InteractiveChart } from './InteractiveChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Sparkles,
  BarChart3,
  PieChart,
  TrendingUp as LineIcon
} from 'lucide-react';

interface VisualDataRendererProps {
  data: VisualData;
}

export const VisualDataRenderer: React.FC<VisualDataRendererProps> = ({ data }) => {
  if (!data) return null;

  // Validate data structure
  if (typeof data !== 'object') {
    console.warn('Invalid visual data type:', typeof data);
    return null;
  }

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return LineIcon;
      case 'bar':
        return BarChart3;
      case 'pie':
        return PieChart;
      default:
        return Activity;
    }
  };

  const getColorGradient = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'from-info/20 to-info/5';
      case 'green':
        return 'from-success/20 to-success/5';
      case 'purple':
        return 'from-primary/20 to-primary/5';
      case 'orange':
        return 'from-warning/20 to-warning/5';
      default:
        return 'from-neon-blue/20 to-neon-purple/5';
    }
  };

  const getIconColorClass = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'text-info';
      case 'green':
        return 'text-success';
      case 'purple':
        return 'text-primary';
      case 'orange':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  const renderChart = () => {
    if (!data.chartConfig) return null;

    const { type, data: chartData, categories, colors, valueFormatter, height = 300 } = data.chartConfig;
    
    // Use InteractiveChart for enhanced experience
    return (
      <InteractiveChart
        chartConfig={data.chartConfig}
        title={`${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
        description="Interactive data visualization"
        allowTypeSwitch={true}
        allowDataFilter={true}
        onDataUpdate={(newData) => {
          console.log('Chart data updated:', newData);
          // Handle real-time data updates here
        }}
      />
    );
  };

  const renderMetrics = () => {
    if (!data.metrics) return null;

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 30, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      }
    };

    return (
      <motion.div
        className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.metrics.map((metric, index) => {
          const IconComponent = metric.icon && (LucideIcons[metric.icon as keyof typeof LucideIcons] as LucideIcon | undefined);
          
          return (
            <motion.div
              key={metric.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="relative group"
            >
              {/* Floating particles effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-grid opacity-5 group-hover:opacity-15 transition-opacity duration-300 rounded-lg" />
              
              {/* Animated background gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg",
                getColorGradient(metric.color)
              )} />
              
              <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-5 md:p-6 min-h-[120px] group-hover:shadow-neon transition-all duration-300">
                {/* Header with icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {IconComponent ? (
                      <motion.div 
                        className={cn(
                          "p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10",
                          "group-hover:from-white/20 group-hover:to-white/10 transition-all duration-300"
                        )}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <IconComponent className={cn("w-5 h-5", getIconColorClass(metric.color))} />
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Activity className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200 whitespace-normal break-words leading-snug">
                        {metric.title}
                      </p>
                    </div>
                  </div>
                  
                  {/* Sparkles decoration */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <Sparkles className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors duration-300" />
                  </motion.div>
                </div>
                
                {/* Value with enhanced styling */}
                <motion.div 
                  className="text-2xl md:text-3xl font-bold group-hover:text-gradient transition-all duration-300 mb-3 whitespace-normal break-words leading-tight"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {metric.value}
                </motion.div>
                
                {/* Change indicator with enhanced styling */}
                {metric.change && (
                  <motion.div 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.6 }}
                  >
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      "backdrop-blur-sm border",
                      metric.change.type === 'increase' 
                        ? "bg-success/20 text-success border-success/30" 
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    )}>
                      {metric.change.type === 'increase' ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {metric.change.value}% {metric.change.period}
                      </span>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  const renderWorkflow = () => {
    if (!data.workflowStep) return null;

    const { title, description, actions, progress } = data.workflowStep;
    const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="relative group"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
        
        <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-6 group-hover:shadow-neon transition-all duration-300">
          {/* Header with enhanced styling */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/5 border border-violet-500/20"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Target className="w-6 h-6 text-violet-400" />
              </motion.div>
              
              <div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
            
            {progress && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30 px-3 py-1"
                >
                  {progress.current} / {progress.total}
                </Badge>
              </motion.div>
            )}
          </div>
          
          {/* Enhanced progress bar */}
          {progress && (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-violet-400">{Math.round(progressPercentage)}%</span>
              </div>
              
              <div className="relative">
                {/* Background track */}
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  {/* Animated progress fill */}
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
                
                {/* Glow effect */}
                <div 
                  className="absolute top-0 h-3 bg-gradient-to-r from-violet-500/50 to-purple-500/50 rounded-full blur-sm opacity-75"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </motion.div>
          )}
          
          {/* Actions section */}
          {actions && actions.length > 0 && (
            <motion.div 
              className="mt-6 pt-4 border-t border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-muted-foreground mb-3">Available Actions</p>
              <div className="flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="bg-white/5 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                    >
                      {action.label}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  const renderSummary = () => {
    if (!data.summary) return null;

    const { title, items } = data.summary;

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'good':
          return CheckCircle2;
        case 'warning':
          return AlertTriangle;
        case 'needs-attention':
          return Info;
        default:
          return Info;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'good':
          return {
            bg: 'bg-success/20',
            text: 'text-success',
            border: 'border-success/30',
            icon: 'text-success'
          };
        case 'warning':
          return {
            bg: 'bg-warning/20',
            text: 'text-warning',
            border: 'border-warning/30',
            icon: 'text-warning'
          };
        case 'needs-attention':
          return {
            bg: 'bg-destructive/20',
            text: 'text-destructive',
            border: 'border-destructive/30',
            icon: 'text-destructive'
          };
        default:
          return {
            bg: 'bg-info/20',
            text: 'text-info',
            border: 'border-info/30',
            icon: 'text-info'
          };
      }
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="relative group"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-10 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
        
        <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-6 group-hover:shadow-neon transition-all duration-300">
          {/* Header with enhanced styling */}
          <div className="flex items-center gap-4 mb-6">
            <motion.div 
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/5 border border-blue-500/20"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Info className="w-6 h-6 text-info" />
            </motion.div>
            
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              {title}
            </h3>
          </div>
          
          {/* Enhanced summary items */}
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item, index) => {
              const StatusIcon = getStatusIcon(item.status);
              const colors = getStatusColor(item.status);
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/5 hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", colors.bg, colors.border, "border")}>
                      <StatusIcon className={cn("w-4 h-4", colors.icon)} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    <Badge 
                      className={cn(
                        "text-xs font-medium backdrop-blur-sm border",
                        colors.bg,
                        colors.text,
                        colors.border
                      )}
                    >
                      {item.status === 'good' ? 'Good' : item.status === 'warning' ? 'OK' : 'Needs Attention'}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="my-6"
    >
      {data.type === 'chart' && renderChart()}
      {data.type === 'metrics' && renderMetrics()}
      {data.type === 'workflow' && renderWorkflow()}
      {data.type === 'summary' && renderSummary()}
    </motion.div>
  );
};
