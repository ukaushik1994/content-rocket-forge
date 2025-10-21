import React from 'react';
import { motion } from 'framer-motion';
import { VisualData } from '@/types/enhancedChat';
import { LineChart, BarChart, PieChartComponent } from '@/components/ui/chart';
import { InteractiveChart } from './InteractiveChart';
import { ChartErrorBoundary } from './ChartErrorBoundary';
import { MultiChartAnalysis } from './visualization/MultiChartAnalysis';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { EnhancedTableRenderer } from './EnhancedTableRenderer';
import { AccessibleTableWrapper } from './AccessibleTableWrapper';
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
    console.warn('❌ VisualDataRenderer: No data provided');
    return (
      <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg text-center">
        <Activity className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Visual data not available</p>
      </div>
    );
  }

  // Phase 2: Enhanced validation with specific error messages
  if (typeof data !== 'object') {
    console.warn('❌ VisualDataRenderer: Invalid visual data type:', typeof data);
    return null;
  }

  // Validate data.type exists and is a string
  if (!data.type || typeof data.type !== 'string') {
    console.error('❌ VisualDataRenderer: Invalid or missing data.type:', data);
    return (
      <Card className="p-4 border-warning/50 bg-warning/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-warning">Invalid Visual Data Format</p>
            <p className="text-xs text-muted-foreground mt-1">
              Received type: {data.type || 'undefined'} | Expected: chart, metrics, table, workflow, summary, serp_analysis
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Validate type is one of the expected values
  const validTypes = ['chart', 'metrics', 'table', 'workflow', 'summary', 'serp_analysis', 'multi_chart_analysis'];
  if (!validTypes.includes(data.type)) {
    console.warn(`⚠️ Unknown visual data type: "${data.type}" - attempting graceful degradation`);
    
    // Attempt to infer type from structure
    if (data.chartConfig) {
      console.log('🔍 Inferred type: chart (has chartConfig)');
      data.type = 'chart';
    } else if (data.metrics) {
      console.log('🔍 Inferred type: metrics (has metrics array)');
      data.type = 'metrics';
    } else if (data.tableData) {
      console.log('🔍 Inferred type: table (has tableData)');
      data.type = 'table';
    } else {
      return (
        <Card className="p-4 border-muted-foreground/30 bg-muted/20">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Unsupported Visualization Type</p>
              <p className="text-xs text-muted-foreground mt-1">
                Type "{data.type}" is not currently supported. Expected: {validTypes.join(', ')}
              </p>
            </div>
          </div>
        </Card>
      );
    }
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
    console.log('📈 renderChart: Starting enhanced chart render process');
    console.log('📈 renderChart: Full data object:', data);
    
    if (!data.chartConfig) {
      console.warn('❌ renderChart: No chartConfig found in visual data:', data);
      console.warn('❌ renderChart: Available data keys:', Object.keys(data));
      return (
        <div className="p-4 border border-warning/30 bg-warning/10 rounded-lg">
          <p className="text-warning font-medium">Chart configuration missing</p>
          <p className="text-xs text-muted-foreground mt-1">
            No chartConfig found in visual data. Available keys: {Object.keys(data).join(', ')}
          </p>
        </div>
      );
    }

    const { type, data: chartData, categories, colors, valueFormatter, height = 300 } = data.chartConfig;
    
    console.log('📈 renderChart: Enhanced chart config details:', {
      type,
      dataLength: chartData?.length,
      categories,
      colors,
      chartData: chartData?.slice(0, 3), // Show first 3 items
      fullConfig: data.chartConfig
    });

    // Enhanced processing with chart intelligence
    const processedConfig = {
      ...data.chartConfig,
      // Ensure proper height for larger datasets
      height: chartData?.length > 20 ? 400 : height
    };

    console.log('📈 renderChart: Enhanced processed chart config:', processedConfig);
    
    // Enhanced InteractiveChart with intelligent recommendations
    return (
      <div className="space-y-2">
        <ChartErrorBoundary>
          <InteractiveChart
            chartConfig={processedConfig}
            title={(data as any).title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
            description={(data as any).description || "AI-optimized data visualization"}
            allowTypeSwitch={true}
            allowDataFilter={true}
            showIntelligentSuggestions={true}
            allVisualData={[data]}
            onDataUpdate={(newData) => {
              console.log('📈 Enhanced chart data updated:', newData);
              // Handle real-time data updates with intelligence
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

    // Color theme mapping based on metric color
    const getColorTheme = (color?: string): string => {
      const colorMap: Record<string, string> = {
        'blue': 'blue',
        'green': 'green',
        'purple': 'purple',
        'orange': 'orange',
        'red': 'red',
        'yellow': 'yellow',
        'indigo': 'indigo',
        'cyan': 'cyan',
      };
      return colorMap[color || ''] || 'purple';
    };

    // Calculate progress value for progress bar
    const calculateProgress = (metric: any): number => {
      if (typeof metric.value === 'string' && metric.value.includes('%')) {
        const numValue = parseFloat(metric.value);
        return isNaN(numValue) ? 50 : numValue;
      }
      if (metric.change?.value) {
        return Math.min(Math.abs(metric.change.value), 100);
      }
      if (typeof metric.value === 'number' && metric.value <= 100) {
        return metric.value;
      }
      return 50;
    };

    return (
      <div className="grid gap-4 auto-rows-[120px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {data.metrics.map((metric, index) => {
          const IconComponent = metric.icon && (LucideIcons[metric.icon as keyof typeof LucideIcons] as LucideIcon | undefined);
          const colorTheme = getColorTheme(metric.color);
          const progressValue = calculateProgress(metric);
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className={`relative overflow-hidden bg-gradient-to-br from-${colorTheme}-500/10 to-${colorTheme}-600/5 border border-${colorTheme}-500/20 rounded-xl p-3 hover:border-${colorTheme}-400/30 transition-all duration-200 h-full`}>
                <div className="flex flex-col h-full">
                  {/* Top: Icon + Badge */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {IconComponent ? (
                        <div className={`p-1 bg-${colorTheme}-500/20 rounded-lg`}>
                          <IconComponent className={`h-3 w-3 text-${colorTheme}-400`} />
                        </div>
                      ) : (
                        <div className={`p-1 bg-${colorTheme}-500/20 rounded-lg`}>
                          <Activity className={`h-3 w-3 text-${colorTheme}-400`} />
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`bg-${colorTheme}-500/10 text-${colorTheme}-300 border-${colorTheme}-500/30 text-[10px] px-1.5 py-0 h-4`}>
                      {metric.title}
                    </Badge>
                  </div>

                  {/* Middle: Value + Progress */}
                  <div className="space-y-1.5">
                    <motion.div 
                      className={`text-xl font-bold text-${colorTheme}-400`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    >
                      {typeof metric.value === 'string' ? metric.value : metric.value?.toLocaleString() || 'N/A'}
                    </motion.div>
                    
                    <div className="space-y-1">
                      <Progress value={progressValue} className={`h-1 bg-${colorTheme}-500/10`} />
                      <p className={`text-xs text-${colorTheme}-300/70 leading-tight`}>
                        {metric.change?.period || metric.title}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Trend (if exists) */}
                  {metric.change && (
                    <motion.div 
                      className="flex items-center gap-1 text-xs mt-1 h-[24px]"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {metric.change.type === 'increase' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={metric.change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
                        {metric.change.value > 0 ? '+' : ''}{metric.change.value}%
                      </span>
                      {metric.change.period && (
                        <span className="text-muted-foreground">{metric.change.period}</span>
                      )}
                    </motion.div>
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

  const renderTable = () => {
    console.log('📋 renderTable: Starting table render, hasTableData:', !!data.tableData);
    
    // PHASE 4: Fallback rendering for malformed tables
    if (!data.tableData && typeof data === 'object' && JSON.stringify(data).includes('|')) {
      console.warn('⚠️ Malformed table detected - attempting markdown parse');
      try {
        const content = JSON.stringify(data);
        const lines = content.split('\\n').filter(l => l.includes('|'));
        if (lines.length > 2) {
          const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim().replace(/[\\*"]/g, ''));
          const rows = lines.slice(2).map(line => 
            line.split('|').filter(c => c.trim()).map(c => c.trim().replace(/[\\*"]/g, ''))
          );
          data.tableData = { headers, rows, title: "Recovered Data" };
          console.log('✅ Successfully recovered table from malformed data');
        }
      } catch (e) {
        console.error('❌ Failed to parse malformed table:', e);
        return (
          <Card className="p-4 border-destructive/30 bg-destructive/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium">Table format error</p>
                <p className="text-xs text-muted-foreground mt-1">AI generated invalid table structure</p>
              </div>
            </div>
          </Card>
        );
      }
    }
    
    if (!data.tableData) {
      console.log('❌ renderTable: No table data found');
      return null;
    }

    const { headers, rows, title, caption } = data.tableData;
    console.log('📋 renderTable: Rendering table with', headers.length, 'columns and', rows.length, 'rows');

    // Convert table data to markdown format for EnhancedTableRenderer
    const markdownTable = [
      '| ' + headers.join(' | ') + ' |',
      '| ' + headers.map(() => '---').join(' | ') + ' |',
      ...rows.map(row => '| ' + row.join(' | ') + ' |')
    ].join('\n');

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <AccessibleTableWrapper
          caption={title || caption}
          summary={`Table with ${headers.length} columns and ${rows.length} rows`}
        >
          <EnhancedTableRenderer rawTableData={markdownTable}>
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-muted/80 backdrop-blur-sm">
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left font-semibold text-foreground 
                                 first:rounded-tl-lg last:rounded-tr-lg
                                 border-b-2 border-border/50"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-card/50 hover:bg-muted/40 transition-colors duration-200
                               border-b border-border/30 last:border-b-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-foreground/90
                                   first:font-medium first:text-primary"
                      >
                        {(() => {
                          // PHASE 5: Smart number formatting
                          const cellValue = String(cell);
                          const numValue = cellValue.replace(/,/g, '');
                          
                          // Check if it's a number (not starting with #, and has 4+ digits)
                          if (!cellValue.startsWith('#') && 
                              !isNaN(Number(numValue)) && 
                              numValue.length >= 4 && 
                              !cellValue.includes('%')) {
                            return Number(numValue).toLocaleString();
                          }
                          
                          return cellValue;
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </EnhancedTableRenderer>
        </AccessibleTableWrapper>
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
    case 'table':
      console.log('📋 VisualDataRenderer: Rendering table');
      return renderTable();
    case 'multi_chart_analysis':
      // Multi-chart analysis is handled by EnhancedMessageBubble component
      // to ensure proper modal behavior and callback handling
      console.log('📊 VisualDataRenderer: multi_chart_analysis handled by parent component');
      return null;
    case 'serp_analysis':
      console.log('🔍 VisualDataRenderer: SERP analysis handled by SerpVisualData component');
      return null; // Handled by SerpVisualData component
    default:
      console.warn('⚠️ VisualDataRenderer: Unknown data type:', data.type);
      return (
        <div className="p-4 border border-warning/30 bg-warning/10 rounded-lg">
          <p className="text-warning font-medium">Unknown visualization type: {data.type}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Expected types: chart, metrics, workflow, summary, table, serp_analysis
          </p>
        </div>
      );
  }
};