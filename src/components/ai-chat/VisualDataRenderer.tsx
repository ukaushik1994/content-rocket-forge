import React from 'react';
import { motion } from 'framer-motion';
import { VisualData } from '@/types/enhancedChat';
import { LineChart, BarChart, PieChartComponent } from '@/components/ui/chart';
import { InteractiveChart } from './InteractiveChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';
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
  console.log('📊 VisualDataRenderer: Received data:', {
    hasData: !!data,
    dataType: typeof data,
    visualDataType: data?.type,
    keys: data ? Object.keys(data) : [],
    fullData: data
  });
  
  if (!data) {
    console.log('❌ VisualDataRenderer: No data provided');
    return null;
  }

  // Validate data structure
  if (typeof data !== 'object') {
    console.warn('❌ VisualDataRenderer: Invalid visual data type:', typeof data);
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
    console.log('📈 renderChart: Starting chart render process');
    if (!data.chartConfig) {
      console.warn('❌ renderChart: No chartConfig found in visual data:', data);
      return null;
    }

    const { type, data: chartData, categories, colors, valueFormatter, height = 300 } = data.chartConfig;
    
    console.log('📈 renderChart: Chart config details:', {
      type,
      dataLength: chartData?.length,
      categories,
      colors,
      chartData: chartData?.slice(0, 3), // Show first 3 items
      fullConfig: data.chartConfig
    });

    // Process data for different chart types
    const processedConfig = {
      ...data.chartConfig,
      // Extract actual data series from chartConfig.series if available
      categories: data.chartConfig.series?.map(s => s.dataKey) || categories || []
    };

    console.log('📈 renderChart: Processed chart config:', processedConfig);
    
    // Use InteractiveChart with error boundary for enhanced experience
    return (
      <div>
        {(() => {
          console.log('📈 renderChart: About to render InteractiveChart component');
          return null;
        })()}
        <ChartErrorBoundary>
          <InteractiveChart
            chartConfig={processedConfig}
            title={(data as any).title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
            description={(data as any).description || "Interactive data visualization"}
            allowTypeSwitch={true}
            allowDataFilter={true}
            onDataUpdate={(newData) => {
              console.log('📈 Chart data updated:', newData);
              // Handle real-time data updates here
            }}
          />
        </ChartErrorBoundary>
      </div>
    );
  };

  const renderMetrics = () => {
    console.log('📊 renderMetrics: Starting metrics render, hasMetrics:', !!data.metrics);
    if (!data.metrics) {
      console.log('❌ renderMetrics: No metrics data found');
      return null;
    }
    console.log('📊 renderMetrics: Rendering', data.metrics.length, 'metrics');

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
      <div className="grid gap-2 auto-rows-min" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {data.metrics.map((metric, index) => {
          const IconComponent = metric.icon && (LucideIcons[metric.icon as keyof typeof LucideIcons] as LucideIcon | undefined);
          
          return (
            <motion.div
              key={metric.id}
              className="group relative max-w-xs"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Simple background gradient */}
              <div className={cn(
                "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200",
                getColorGradient(metric.color)
              )} />
              
              <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-2 group-hover:shadow-lg transition-all duration-200">
                {/* Compact vertical layout */}
                <div className="flex flex-col">
                  {/* Title and icon row */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {IconComponent ? (
                        <div className={cn(
                          "p-1 rounded bg-gradient-to-br from-white/10 to-white/5",
                          "group-hover:from-white/15 group-hover:to-white/8 transition-all duration-200"
                        )}>
                          <IconComponent className={cn("w-3 h-3", getIconColorClass(metric.color))} />
                        </div>
                      ) : (
                        <div className="p-1 rounded bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/8 transition-all duration-200">
                          <Activity className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      
                      <p className="text-[10px] md:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200 leading-none truncate">
                        {metric.title}
                      </p>
                    </div>
                    
                    <Sparkles className="w-2.5 h-2.5 text-primary/30 group-hover:text-primary/60 transition-colors duration-200 flex-shrink-0" />
                  </div>
                  
                  {/* Value */}
                  <div className="text-base md:text-lg font-bold leading-none group-hover:text-gradient transition-all duration-200">
                    {typeof metric.value === 'string' ? metric.value : metric.value?.toLocaleString() || 'N/A'}
                  </div>
                  
                  {/* Change indicator if present */}
                  {metric.change && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                        metric.change.type === 'increase' 
                          ? "bg-success/20 text-success" 
                          : "bg-destructive/20 text-destructive"
                      )}>
                        {metric.change.type === 'increase' ? (
                          <TrendingUp className="h-2.5 w-2.5" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5" />
                        )}
                        <span>
                          {metric.change.value}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderWorkflow = () => {
    console.log('🔄 renderWorkflow: Starting workflow render, hasWorkflow:', !!data.workflowStep);
    if (!data.workflowStep) {
      console.log('❌ renderWorkflow: No workflow data found');
      return null;
    }

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
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={cn(colors.bg, colors.text, colors.border, "border")}
                  >
                    {item.status.replace('-', ' ')}
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        </Card>
      </motion.div>
    );
  };

  // Main render logic with comprehensive logging
  console.log('📊 VisualDataRenderer: About to render, data type:', data.type);

  switch (data.type) {
    case 'chart':
      console.log('📈 VisualDataRenderer: Rendering chart');
      return renderChart();
    case 'metrics':
      console.log('📊 VisualDataRenderer: Rendering metrics');
      return renderMetrics();
    case 'workflow':
      console.log('🔄 VisualDataRenderer: Rendering workflow');
      return renderWorkflow();
    case 'summary':
      console.log('📋 VisualDataRenderer: Rendering summary');
      return renderSummary();
    case 'serp_analysis':
      console.log('🔍 VisualDataRenderer: SERP analysis handled by SerpVisualData component');
      return null; // Handled by SerpVisualData component
    default:
      console.warn('⚠️ VisualDataRenderer: Unknown data type:', data.type);
      return (
        <div className="p-4 border border-warning/30 bg-warning/10 rounded-lg">
          <p className="text-warning font-medium">Unknown visualization type: {data.type}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Expected types: chart, metrics, workflow, summary, serp_analysis
          </p>
        </div>
      );
  }
};