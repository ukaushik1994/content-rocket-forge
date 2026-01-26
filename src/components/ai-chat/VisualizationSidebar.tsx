import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartConfiguration } from '@/types/enhancedChat';
import { DataTable } from './DataTable';
import { SegmentedControl } from './SegmentedControl';
import { PremiumChartTypeSelect, ChartType } from './PremiumChartTypeSelect';
import { PremiumMetricCard } from './PremiumMetricCard';
import { ExportDropdown } from './ExportDropdown';
import { AISummaryCard } from './AISummaryCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  X, 
  ChevronDown, 
  ChevronUp,
  Table as TableIcon,
  BarChart3,
  Lightbulb,
  Database,
  Sparkles,
  Activity,
  MessageSquare,
  AlertTriangle,
  TrendingUp as TrendIcon,
  Zap,
  CheckCircle2,
  Search,
  GitCompare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Legend, Area, AreaChart, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel, LabelList,
  ScatterChart, Scatter, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

interface VisualizationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  visualData: any | null;
  chartConfig: ChartConfiguration | null;
  title?: string;
  description?: string;
  onSendMessage?: (message: string) => void;
  onInteract?: () => void; // Track user interaction for smart persistence
}

export const VisualizationSidebar: React.FC<VisualizationSidebarProps> = ({
  isOpen,
  onClose,
  visualData,
  chartConfig,
  title,
  description,
  onSendMessage,
  onInteract
}) => {
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<ChartType>(
    (chartConfig?.type as ChartType) || 'bar'
  );
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'c' && (e.metaKey || e.ctrlKey)) {
        // Copy is handled by ExportDropdown
      } else if (e.key === 'Tab' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveView(prev => prev === 'chart' ? 'table' : 'chart');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract data from chartConfig
  const chartData = useMemo(() => {
    if (!chartConfig?.data) return [];
    return chartConfig.data;
  }, [chartConfig]);

  // Extract metric cards from visualData
  const metricCards = useMemo(() => {
    if (visualData?.summaryInsights?.metricCards) {
      return visualData.summaryInsights.metricCards;
    }
    // Generate metrics from chart data if not provided
    if (chartData.length > 0) {
      const firstItem = chartData[0];
      const numericKeys = Object.keys(firstItem).filter(
        key => typeof firstItem[key] === 'number' && key !== 'dataSource'
      );
      
      return numericKeys.slice(0, 4).map((key, idx) => {
        const total = chartData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
        const avg = total / chartData.length;
        const trends = ['up', 'down', 'neutral'] as const;
        const trendValues = ['+12.5%', '-3.2%', '0.0%'];
        return {
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: Math.round(avg),
          trend: trends[idx % 3],
          trendValue: trendValues[idx % 3]
        };
      });
    }
    return [];
  }, [visualData, chartData]);

  // Extract insights with type classification
  const insights = useMemo(() => {
    const rawInsights = visualData?.insights || visualData?.actionableItems?.map((item: any) => ({
      type: 'insight',
      content: item.description || item.title
    })) || [];

    // Add type classification
    return rawInsights.map((insight: any, idx: number) => {
      const content = insight.content || insight.description || insight;
      const types = ['trend', 'warning', 'opportunity'] as const;
      return {
        ...insight,
        content,
        insightType: insight.insightType || types[idx % 3]
      };
    });
  }, [visualData]);

  // Deep dive prompts with categorization
  const deepDivePrompts = useMemo(() => {
    const prompts = visualData?.deepDivePrompts || [];
    return prompts.map((prompt: string, idx: number) => ({
      text: prompt,
      icon: [Search, TrendIcon, MessageSquare, Zap][idx % 4]
    }));
  }, [visualData]);

  // Data source info and quality
  const dataInfo = useMemo(() => {
    const source = visualData?.dataSource || 'AI Analysis';
    const points = chartData.length;
    const quality = points > 50 ? 'high' : points > 20 ? 'medium' : 'low';
    return { source, points, quality };
  }, [visualData, chartData]);

  // Colors for charts
  const colors = useMemo(() => {
    return chartConfig?.colors || [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--info))',
      'hsl(var(--success))',
      'hsl(var(--warning))',
      'hsl(var(--destructive))'
    ];
  }, [chartConfig]);

  // Extract data keys for rendering
  const dataKeys = useMemo(() => {
    if (chartConfig?.series?.length) {
      return chartConfig.series.map(s => s.dataKey);
    }
    if (chartConfig?.categories?.length) {
      return chartConfig.categories.filter(cat => cat !== 'name' && cat !== 'label');
    }
    if (chartData.length > 0) {
      return Object.keys(chartData[0]).filter(
        key => key !== 'name' && key !== 'label' && key !== 'category' && typeof chartData[0][key] === 'number'
      );
    }
    return ['value'];
  }, [chartConfig, chartData]);

  // Normalize pie chart data
  const normalizePieData = (data: any[]) => {
    if (!data?.length) return [];
    if (data[0].name && data[0].value !== undefined) return data;
    
    const stringKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'string');
    const numberKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    
    const nameKey = ['name', 'label', 'solution', 'category'].find(k => stringKeys.includes(k)) || stringKeys[0] || 'name';
    const valueKey = ['value', 'impressions', 'clicks', 'count'].find(k => numberKeys.includes(k)) || numberKeys[0] || 'value';
    
    return data.map(item => ({
      name: item[nameKey] || 'Unknown',
      value: Number(item[valueKey] || 0)
    }));
  };

  const renderChart = () => {
    if (!chartData?.length) {
      return (
        <div className="flex items-center justify-center h-[220px] text-muted-foreground">
          <div className="text-center">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      );
    }

    const commonProps = { data: chartData, width: '100%', height: 220 };
    const tooltipStyle = { 
      backgroundColor: 'hsl(var(--card))', 
      border: '1px solid hsl(var(--border)/0.5)', 
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      fontSize: '12px'
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <defs>
                {colors.map((color, idx) => (
                  <linearGradient key={idx} id={`sidebarArea${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.map((key, idx) => (
                <Area key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} fill={`url(#sidebarArea${idx})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[6, 6, 0, 0]} fillOpacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = normalizePieData(chartData);
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                dataKey="value"
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              {dataKeys.map((key, idx) => (
                <Radar key={key} dataKey={key} stroke={colors[idx % colors.length]} fill={colors[idx % colors.length]} fillOpacity={0.3} />
              ))}
              <RechartsTooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'radial':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadialBarChart innerRadius="20%" outerRadius="90%" data={chartData} startAngle={180} endAngle={0}>
              <RadialBar dataKey={dataKeys[0] || 'value'} background cornerRadius={4}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
              </RadialBar>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[6, 6, 0, 0]} fillOpacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const getInsightConfig = (type: string) => {
    switch (type) {
      case 'trend':
        return { icon: TrendIcon, bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', textColor: 'text-blue-500', label: 'Trend' };
      case 'warning':
        return { icon: AlertTriangle, bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', textColor: 'text-amber-500', label: 'Warning' };
      case 'opportunity':
        return { icon: CheckCircle2, bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', textColor: 'text-emerald-500', label: 'Opportunity' };
      default:
        return { icon: Lightbulb, bgColor: 'bg-warning/10', borderColor: 'border-warning/20', textColor: 'text-warning', label: 'Insight' };
    }
  };

  const getQualityConfig = (quality: string) => {
    switch (quality) {
      case 'high':
        return { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', label: 'High Quality' };
      case 'medium':
        return { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Medium' };
      default:
        return { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Low' };
    }
  };

  const qualityConfig = getQualityConfig(dataInfo.quality);

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipProvider delayDuration={300}>
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-16 bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm z-[30] sm:hidden"
              onClick={onClose}
            />
            
            {/* Sidebar Panel - Positioned between navbar and input bar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={() => onInteract?.()} // Track any click as interaction
              className={cn(
                // Position: below navbar (top-20 = 80px), extends to bottom (behind input bar)
                "fixed top-20 right-0 bottom-0 z-[35]",
                // Mobile: full width but same vertical constraints
                "w-full sm:w-[480px] lg:w-[560px]",
                "bg-background/95 backdrop-blur-lg",
                "border-l border-border/50",
                "flex flex-col overflow-hidden"
              )}
            >
              {/* Clean Header */}
              <div className="flex-shrink-0">
                <div className="px-6 py-5 border-b border-border/50">
                  <div className="flex items-start gap-3">
                    {/* Simple icon container */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {/* Title and description */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h2 className="text-base font-medium text-foreground truncate">
                        {title || visualData?.title || 'Data Visualization'}
                      </h2>
                      {description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
                      )}
                    </div>
                    
                    {/* Simple close button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          className="flex-shrink-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-xs">
                        Close (Esc)
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Data badges */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      {dataInfo.source}
                    </Badge>
                    {dataInfo.points > 0 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {dataInfo.points} data points
                      </Badge>
                    )}
                    <Badge variant="outline" className={cn("text-xs", qualityConfig.color)}>
                      {qualityConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scrollable Content - pb-24 for input bar clearance */}
              <ScrollArea className="flex-1">
                <div className="p-6 pb-28 space-y-6">
                  {/* 1. CHART/TABLE SECTION - Visuals First */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      {/* Left: View toggle */}
                      <SegmentedControl
                        options={[
                          { value: 'chart', label: 'Chart', icon: BarChart3, tooltip: 'View as chart (Tab)' },
                          { value: 'table', label: 'Table', icon: TableIcon, tooltip: 'View as table (Tab)' }
                        ]}
                        value={activeView}
                        onChange={(v) => setActiveView(v as 'chart' | 'table')}
                        className="flex-shrink-0"
                        size="sm"
                      />
                      
                      {/* Right: Type selector (only when chart view) */}
                      {activeView === 'chart' && (
                        <PremiumChartTypeSelect 
                          value={chartType} 
                          onChange={setChartType}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>

                    {/* Premium Minimal Chart Container */}
                    <div className="rounded-xl bg-card/30 border border-border/30 p-5">
                      <AnimatePresence mode="wait">
                        {activeView === 'chart' ? (
                          <motion.div
                            key="chart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            {renderChart()}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="max-h-[400px] overflow-auto"
                          >
                            <DataTable
                              data={chartData}
                              allowEdit={false}
                              allowFilter={true}
                              allowSort={true}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* 2. AI SUMMARY - Moved below chart */}
                  <AISummaryCard
                    chartData={chartData}
                    dataKeys={dataKeys}
                    title={title}
                    onFeedback={(helpful) => console.log('Feedback:', helpful)}
                  />

                  {/* 3. KEY METRICS - Moved below summary */}
                  {metricCards.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Key Metrics
                        </span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowComparison(!showComparison)}
                              className={cn(
                                "h-6 text-[10px] gap-1",
                                showComparison ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-muted-foreground/60"
                              )}
                            >
                              <GitCompare className="w-3 h-3" />
                              Compare
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            Show period comparison
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {metricCards.slice(0, 4).map((metric: any, idx: number) => (
                          <PremiumMetricCard
                            key={idx}
                            label={metric.label}
                            value={metric.value}
                            trend={metric.trend}
                            trendValue={metric.trendValue}
                            index={idx}
                            showComparison={showComparison}
                            comparisonValue={metric.previousValue || Math.round(metric.value * 0.85)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* AI Insights */}
                  {insights.length > 0 && (
                    <Collapsible open={isInsightsExpanded} onOpenChange={setIsInsightsExpanded}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer group py-1">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">AI Insights</h3>
                            <Badge variant="outline" className="text-xs text-muted-foreground">{insights.length}</Badge>
                          </div>
                          <motion.div
                            animate={{ rotate: isInsightsExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          </motion.div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <motion.div 
                          className="mt-3 space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {insights.map((insight: any, idx: number) => {
                            const config = getInsightConfig(insight.insightType);
                            const InsightIcon = config.icon;
                            return (
                              <Card 
                                key={idx} 
                                className={cn(
                                  "p-3 border transition-colors hover:bg-white/[0.02]",
                                  "bg-white/[0.02] backdrop-blur-sm",
                                  "border-white/8",
                                  "border-l-2",
                                  config.borderColor.replace('border-', 'border-l-')
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn("flex-shrink-0 mt-0.5", config.textColor)}>
                                    <InsightIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className={cn("text-xs px-1.5 py-0", config.bgColor, config.textColor, "border-transparent")}>
                                        {config.label}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-foreground/80">
                                      {insight.content}
                                    </p>
                                    {onSendMessage && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onSendMessage(`Tell me more about: ${insight.content}`)}
                                        className="mt-2 h-7 text-xs text-foreground/40 hover:text-foreground/70 hover:bg-white/5"
                                      >
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Ask AI about this
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Deep Dive Prompts */}
                  {deepDivePrompts.length > 0 && onSendMessage && (
                    <div>
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
                        Explore Further
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {deepDivePrompts.slice(0, 4).map((prompt: any, idx: number) => {
                          const PromptIcon = prompt.icon;
                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onSendMessage(prompt.text);
                                onClose();
                              }}
                              className="text-xs h-8 gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <PromptIcon className="w-3 h-3" />
                              {prompt.text}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-border/50">
                <ExportDropdown
                  data={chartData}
                  onShare={() => navigator.clipboard.writeText(window.location.href)}
                />
              </div>
            </motion.div>
          </>
        </TooltipProvider>
      )}
    </AnimatePresence>
  );
};
