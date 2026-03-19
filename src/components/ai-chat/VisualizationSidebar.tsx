import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarActionPanel } from './SidebarActionPanel';
import { ChartConfiguration } from '@/types/enhancedChat';
import { DataTable } from './DataTable';
import { SegmentedControl } from './SegmentedControl';
import { PremiumChartTypeSelect, ChartType } from './PremiumChartTypeSelect';
import { PremiumMetricCard } from './PremiumMetricCard';
import { ExportDropdown } from './ExportDropdown';
import { AISummaryCard } from './AISummaryCard';
import { getMetricContext } from '@/hooks/useAnalystEngine';
import { MiniSparkline } from './MiniSparkline';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContentWizardSidebar } from './content-wizard/ContentWizardSidebar';
import { ProposalBrowserSidebar } from './proposal-browser/ProposalBrowserSidebar';
import { RepositoryPanel } from './panels/RepositoryPanel';
import { ApprovalsPanel } from './panels/ApprovalsPanel';
import { ResearchIntelligencePanel } from '@/components/panels/ResearchIntelligencePanel';
import { RepurposePanel } from './panels/RepurposePanel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Globe, ExternalLink, ChevronRight } from 'lucide-react';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarTrendData, TimeframeOption } from '@/hooks/useSidebarTrendData';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Legend, Area, AreaChart, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel, LabelList,
  ScatterChart, Scatter, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

// Helper function to classify insight type based on content keywords
const classifyInsightType = (content: string): 'trend' | 'warning' | 'opportunity' => {
  const lower = content.toLowerCase();
  if (/failed|error|issue|risk|problem|critical|urgent|alert|warning|down|decrease|declining|dropped/.test(lower)) {
    return 'warning';
  }
  if (/opportunity|potential|improve|recommend|action|ready|suggest|could|boost|increase|growth|rising|trending up/.test(lower)) {
    return 'opportunity';
  }
  return 'trend';
};

interface VisualizationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  visualData: any | null;
  chartConfig: ChartConfiguration | null;
  title?: string;
  description?: string;
  onSendMessage?: (message: string) => void;
  onInteract?: () => void;
  analystState?: import('@/hooks/useAnalystEngine').AnalystState | null;
}

export const VisualizationSidebar: React.FC<VisualizationSidebarProps> = ({
  isOpen,
  onClose,
  visualData,
  chartConfig,
  title,
  description,
  onSendMessage,
  onInteract,
  analystState
}) => {
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<ChartType>(
    (chartConfig?.type as ChartType) || 'bar'
  );
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('30d');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [showAllSessionCharts, setShowAllSessionCharts] = useState(false);
  const [expandedChartIndex, setExpandedChartIndex] = useState<number | null>(null);
  
  const { user } = useAuth();

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveView(prev => prev === 'chart' ? 'table' : 'chart');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract data with fallback chain
  const chartData = useMemo(() => {
    if (chartConfig?.data && chartConfig.data.length > 0) return chartConfig.data;
    if (visualData?.data && Array.isArray(visualData.data) && visualData.data.length > 0) return visualData.data;
    if (visualData?.tableData?.rows && visualData.tableData.rows.length > 0) {
      const headers = visualData.tableData.headers || [];
      return visualData.tableData.rows.map((row: any[], idx: number) => {
        const item: any = { name: row[0] || `Item ${idx + 1}` };
        headers.slice(1).forEach((header: string, i: number) => {
          const value = row[i + 1];
          item[header] = typeof value === 'number' ? value : parseFloat(value) || 0;
        });
        return item;
      });
    }
    if (visualData?.type === 'comparison_chart' && visualData?.metrics) {
      return visualData.metrics.map((metric: string, idx: number) => ({
        name: metric,
        [visualData.labels?.[0] || 'Current']: visualData.current?.[idx] || 0,
        [visualData.labels?.[1] || 'Previous']: visualData.previous?.[idx] || 0
      }));
    }
    if (visualData?.summaryInsights?.metricCards && visualData.summaryInsights.metricCards.length > 0) {
      return visualData.summaryInsights.metricCards.map((card: any) => ({
        name: card.label || card.title || 'Metric',
        value: typeof card.value === 'number' ? card.value : parseFloat(card.value) || 0
      }));
    }
    return [];
  }, [chartConfig, visualData]);

  const hasChartData = chartData.length > 0;

  // Data source for trend hook
  const dataSource = useMemo(() => visualData?.dataSource || 'AI Analysis', [visualData]);
  
  const { trendData, isLoading: isTrendLoading, timeframeLabel } = useSidebarTrendData({
    userId: user?.id || null,
    dataSource,
    timeframe: selectedTimeframe,
    chartData
  });

  // Metric cards from visualData with real trend calculations
  const metricCards = useMemo(() => {
    if (visualData?.summaryInsights?.metricCards) {
      return visualData.summaryInsights.metricCards.map((metric: any) => {
        const key = metric.label?.toLowerCase().replace(/\s+/g, '') || '';
        const trend = trendData[key];
        if (trend) {
          return {
            ...metric,
            trend: trend.trend,
            trendValue: `${trend.changePercent >= 0 ? '+' : ''}${trend.changePercent.toFixed(1)}%`,
            previousValue: Math.round(trend.previous),
            comparisonPeriod: timeframeLabel
          };
        }
        return metric;
      });
    }
    
    if (chartData.length > 0) {
      const firstItem = chartData[0];
      const numericKeys = Object.keys(firstItem).filter(
        key => typeof firstItem[key] === 'number' && !['id', 'index', 'dataSource'].includes(key)
      );
      
      return numericKeys.slice(0, 4).map((key) => {
        const values = chartData.map(item => Number(item[key]) || 0);
        const total = values.reduce((sum, val) => sum + val, 0);
        const avg = total / chartData.length;
        const trend = trendData[key];
        
        if (trend) {
          return {
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            value: Math.round(avg),
            trend: trend.trend,
            trendValue: `${trend.changePercent >= 0 ? '+' : ''}${trend.changePercent.toFixed(1)}%`,
            previousValue: Math.round(trend.previous),
            comparisonPeriod: timeframeLabel
          };
        }
        
        const midpoint = Math.floor(values.length / 2);
        const firstHalfAvg = midpoint > 0 ? values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint : 0;
        const secondHalfAvg = midpoint > 0 ? values.slice(midpoint).reduce((a, b) => a + b, 0) / (values.length - midpoint) : avg;
        const changePercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;
        
        return {
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: Math.round(avg),
          trend: changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'neutral',
          trendValue: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
          previousValue: Math.round(firstHalfAvg),
          comparisonPeriod: timeframeLabel
        };
      });
    }
    return [];
  }, [visualData, chartData, trendData, timeframeLabel]);

  // Insights from visualData
  const insights = useMemo(() => {
    const rawInsights = visualData?.insights || visualData?.actionableItems?.map((item: any) => ({
      type: 'insight',
      content: item.description || item.title
    })) || [];
    return rawInsights.map((insight: any) => {
      const content = insight.content || insight.description || insight;
      return {
        ...insight,
        content,
        insightType: insight.insightType || classifyInsightType(content)
      };
    });
  }, [visualData]);

  // Deep dive prompts
  const deepDivePrompts = useMemo(() => {
    const prompts = visualData?.deepDivePrompts || [];
    return prompts.map((prompt: string, idx: number) => ({
      text: prompt,
      icon: [Search, TrendIcon, MessageSquare, Zap][idx % 4]
    }));
  }, [visualData]);

  // Data source info
  const dataInfo = useMemo(() => {
    const source = visualData?.dataSource || 'AI Analysis';
    const points = chartData.length;
    const timeframe = selectedTimeframe === '7d' ? 'Last 7 days' : 
                      selectedTimeframe === '30d' ? 'Last 30 days' : 'Custom';
    const hasRequiredFields = chartData.every(item => 
      item.name !== undefined && 
      Object.values(item).some(v => typeof v === 'number')
    );
    const hasMinimumPoints = points >= 5;
    const noNullValues = chartData.every(item => 
      !Object.values(item).includes(null) && 
      !Object.values(item).includes(undefined)
    );
    const hasVariation = new Set(chartData.map(d => d.name)).size > 1;
    const qualityScore = [hasRequiredFields, hasMinimumPoints, noNullValues, hasVariation].filter(Boolean).length;
    const quality = qualityScore >= 4 ? 'high' : qualityScore >= 2 ? 'medium' : 'low';
    return { source, points, quality, timeframe };
  }, [visualData, chartData, selectedTimeframe]);

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

  const dataKeys = useMemo(() => {
    if (chartConfig?.series?.length) return chartConfig.series.map(s => s.dataKey);
    if (chartConfig?.categories?.length) return chartConfig.categories.filter(cat => cat !== 'name' && cat !== 'label');
    if (chartData.length > 0) {
      return Object.keys(chartData[0]).filter(
        key => key !== 'name' && key !== 'label' && key !== 'category' && typeof chartData[0][key] === 'number'
      );
    }
    return ['value'];
  }, [chartConfig, chartData]);

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

  // Phase 2: Smart label truncation for XAxis
  const shouldRotateLabels = chartData.length >= 5;
  const xAxisTickFormatter = (value: string) => {
    if (typeof value !== 'string') return value;
    return value.length > 18 ? value.substring(0, 16) + '…' : value;
  };
  const xAxisProps = {
    dataKey: "name",
    stroke: "hsl(var(--muted-foreground))",
    fontSize: 10,
    tickLine: false,
    axisLine: false,
    tickFormatter: xAxisTickFormatter,
    ...(shouldRotateLabels ? { angle: -35, textAnchor: "end" as const, dy: 4, height: 60 } : { dy: 8 }),
  };
  const chartBottomMargin = shouldRotateLabels ? 24 : 8;

  const ChartLoadingSkeleton = () => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <p className="text-xs text-muted-foreground">Loading chart...</p>
    </div>
  );

  const renderChart = (type: ChartType = chartType, height: number = 260) => {
    if (isChartLoading) return <ChartLoadingSkeleton />;
    
    if (!chartData?.length) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center max-w-xs">
            <Database className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No chart data available</p>
            <p className="text-xs text-muted-foreground/70 mb-3">
              The AI didn't provide structured data for visualization.
            </p>
            {onSendMessage && (
              <Button variant="outline" size="sm" onClick={() => onSendMessage("Show me a chart of my content performance")} className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Request a chart
              </Button>
            )}
          </div>
        </div>
      );
    }

    const commonProps = { data: chartData, width: '100%', height };
    const tooltipStyle = { 
      backgroundColor: 'hsl(var(--popover))', 
      border: 'none', 
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      fontSize: '11px',
      padding: '8px 12px'
    };
    const modernColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: chartBottomMargin, left: 0 }}>
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`lineGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis {...xAxisProps} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={32} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} />
              <RechartsTooltip contentStyle={tooltipStyle} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
              {dataKeys.map((key, idx) => (
                <React.Fragment key={key}>
                  <Area type="natural" dataKey={key} stroke={modernColors[idx % modernColors.length]} strokeWidth={2.5} fill={`url(#lineGradient${idx})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))', fill: modernColors[idx % modernColors.length] }} />
                </React.Fragment>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: chartBottomMargin, left: 0 }}>
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`areaGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis {...xAxisProps} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={32} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} />
              <RechartsTooltip contentStyle={tooltipStyle} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
              {dataKeys.map((key, idx) => (
                <Area key={key} type="natural" dataKey={key} stroke={modernColors[idx % modernColors.length]} strokeWidth={2} fill={`url(#areaGradient${idx})`} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))', fill: modernColors[idx % modernColors.length] }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: chartBottomMargin, left: 0 }} barCategoryGap="20%">
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`barGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis {...xAxisProps} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={32} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} />
              <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 4 }} />
              {dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={`url(#barGradient${idx})`} radius={[8, 8, 0, 0]} maxBarSize={48} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = normalizePieData(chartData);
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`pieGradient${idx}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                  </linearGradient>
                ))}
              </defs>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {pieData.map((_, idx) => (<Cell key={idx} fill={`url(#pieGradient${idx})`} />))}
              </Pie>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={48} wrapperStyle={{ paddingTop: '12px' }} iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`radarGradient${idx}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <PolarAngleAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} tickFormatter={xAxisTickFormatter} />
              {dataKeys.map((key, idx) => (
                <Radar key={key} dataKey={key} stroke={modernColors[idx % modernColors.length]} strokeWidth={2} fill={`url(#radarGradient${idx})`} dot={{ r: 3, fill: modernColors[idx % modernColors.length] }} />
              ))}
              <RechartsTooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'radial':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadialBarChart innerRadius="30%" outerRadius="90%" data={chartData} startAngle={180} endAngle={-180} cx="50%" cy="50%">
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`radialGradient${idx}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <RadialBar dataKey={dataKeys[0] || 'value'} background={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} cornerRadius={8}>
                {chartData.map((_, idx) => (<Cell key={idx} fill={`url(#radialGradient${idx})`} />))}
              </RadialBar>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart margin={{ top: 16, right: 16, bottom: chartBottomMargin, left: 0 }}>
              <XAxis dataKey={dataKeys[0] || 'x'} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} tickFormatter={xAxisTickFormatter} />
              <YAxis dataKey={dataKeys[1] || 'y'} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={32} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Scatter data={chartData} fill={modernColors[0]}>
                {chartData.map((_, idx) => (<Cell key={idx} fill={modernColors[idx % modernColors.length]} />))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer {...commonProps}>
            <FunnelChart>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Funnel dataKey="value" data={chartData} isAnimationActive>
                {chartData.map((_, idx) => (<Cell key={idx} fill={modernColors[idx % modernColors.length]} />))}
                <LabelList position="right" fill="hsl(var(--foreground))" fontSize={10} dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={chartData} margin={{ top: 16, right: 16, bottom: chartBottomMargin, left: 0 }}>
              <defs>
                <linearGradient id="composedBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={modernColors[0]} stopOpacity={1} />
                  <stop offset="100%" stopColor={modernColors[0]} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis {...xAxisProps} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={32} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.slice(0, 1).map((key) => (
                <Bar key={key} dataKey={key} fill="url(#composedBarGradient)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              ))}
              {dataKeys.slice(1, 2).map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={modernColors[idx + 1]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: chartBottomMargin, left: 0 }} barCategoryGap="20%">
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`defaultBarGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis {...xAxisProps} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} width={32} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value} />
              <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 4 }} />
              {dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={`url(#defaultBarGradient${idx})`} radius={[8, 8, 0, 0]} maxBarSize={48} />
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
      case 'search':
        return { icon: Search, bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', textColor: 'text-cyan-500', label: 'Web' };
      default:
        return { icon: Lightbulb, bgColor: 'bg-warning/10', borderColor: 'border-warning/20', textColor: 'text-warning', label: 'Insight' };
    }
  };

  const getQualityConfig = (quality: string) => {
    switch (quality) {
      case 'high': return { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', label: 'High Quality' };
      case 'medium': return { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Medium' };
      default: return { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Low' };
    }
  };

  const qualityConfig = getQualityConfig(dataInfo.quality);
  const { isMobile, isTablet } = useResponsiveBreakpoint();

  // ─── Delegate to specialized panels ───────────────────────────────────
  if (visualData?.type === 'content_wizard') {
    return <ContentWizardSidebar isOpen={isOpen} onClose={onClose} keyword={visualData.keyword || ''} solutionId={visualData.solution_id} contentType={visualData.content_type} extractedContext={visualData.extractedContext} />;
  }
  if (visualData?.type === 'proposal_browser') {
    return <ProposalBrowserSidebar isOpen={isOpen} onClose={onClose} keyword={visualData.keyword || ''} />;
  }
  if (visualData?.type === 'repository') return <RepositoryPanel isOpen={isOpen} onClose={onClose} />;
  if (visualData?.type === 'approvals') return <ApprovalsPanel isOpen={isOpen} onClose={onClose} />;
  if (visualData?.type === 'research_intelligence') return <ResearchIntelligencePanel isOpen={isOpen} onClose={onClose} />;
  if (visualData?.type === 'content_repurpose') return <RepurposePanel isOpen={isOpen} onClose={onClose} contentId={visualData.contentId} />;

  // ─── Derived analyst data ─────────────────────────────────────────────
  const hasAnalystData = analystState && (
    analystState.insightsFeed.length > 0 || 
    analystState.cumulativeMetrics.length > 0 || 
    analystState.accumulatedCharts.length > 0 ||
    analystState.platformData.length > 0
  );

  // Merge analyst insights feed with current response insights
  const mergedInsightsFeed = useMemo(() => {
    const allInsights = [...(analystState?.insightsFeed || [])];
    // Add current response insights if not already present
    for (const insight of insights) {
      const content = typeof insight === 'string' ? insight : insight.content;
      if (!allInsights.some(i => i.content === content)) {
        allInsights.push({
          id: `current-${Math.random().toString(36).slice(2)}`,
          content,
          type: insight.insightType || 'trend',
          source: 'ai' as const,
          timestamp: new Date(),
        });
      }
    }
    return allInsights;
  }, [analystState?.insightsFeed, insights]);

  // Whether we have any current response data to show
  const hasCurrentResponseData = hasChartData || (visualData && visualData.type !== 'analyst');

  // Determine sidebar title
  const sidebarTitle = hasCurrentResponseData 
    ? (title || visualData?.title || 'Data Visualization') 
    : 'Intelligence Panel';
  const sidebarDescription = hasCurrentResponseData 
    ? description 
    : hasAnalystData 
      ? `${analystState!.insightsFeed.length} insights · ${analystState!.topics.length} topics`
      : 'Charts & insights companion';

  // ─── UNIFIED LAYOUT ──────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipProvider delayDuration={300}>
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-16 bottom-24 left-0 right-0 bg-black/40 backdrop-blur-sm z-[35] lg:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={() => onInteract?.()}
              className={cn(
                "fixed top-20 right-0 bottom-24 z-[35]",
                "w-full sm:w-[400px] lg:w-[520px] xl:w-[600px]",
                "bg-background/90 backdrop-blur-md",
                "border-l border-border/10",
                "flex flex-col overflow-hidden"
              )}
            >
              {/* ─── Header ─────────────────────────────────────────── */}
              <div className="flex-shrink-0 px-6 py-5 border-b border-border/10">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-muted-foreground mt-0.5" />
                    {analystState?.isEnriching && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-base font-medium text-foreground truncate">{sidebarTitle}</h2>
                    {sidebarDescription && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{sidebarDescription}</p>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">Close (Esc)</TooltipContent>
                  </Tooltip>
                </div>

                {/* Topic tags from analyst engine */}
                {analystState && analystState.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {analystState.topics.map((topic) => (
                      <Badge key={topic.name} variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/20 border-border/30 text-muted-foreground">
                        {topic.name}
                        {topic.mentionCount > 1 && <span className="ml-1 text-primary/70">×{topic.mentionCount}</span>}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Data context badges + timeframe */}
                {hasCurrentResponseData && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      {dataInfo.source}
                    </Badge>
                    {dataInfo.points > 0 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">{dataInfo.points} pts</Badge>
                    )}
                    <Select value={selectedTimeframe} onValueChange={(val) => setSelectedTimeframe(val as TimeframeOption)}>
                      <SelectTrigger className="h-6 text-xs border-border/50 bg-transparent w-auto gap-1 px-2">
                        <Clock className="w-3 h-3" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="7d" className="text-xs">Last 7 days</SelectItem>
                        <SelectItem value="30d" className="text-xs">Last 30 days</SelectItem>
                        <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline" className={cn("text-xs", qualityConfig.color)}>{qualityConfig.label}</Badge>
                    {isTrendLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                  </div>
                )}

                {/* Goal Progress */}
                {analystState?.goalProgress && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-2.5 rounded-lg bg-muted/15 border border-border/15 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{analystState.goalProgress.goalName}</span>
                      <span className="text-[10px] font-semibold text-primary">{analystState.goalProgress.percentage}%</span>
                    </div>
                    <Progress value={analystState.goalProgress.percentage} className="h-1.5" />
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full",
                        analystState.goalProgress.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        analystState.goalProgress.status === 'nearly_done' ? 'bg-blue-500/10 text-blue-500' :
                        analystState.goalProgress.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {analystState.goalProgress.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60">Next: {analystState.goalProgress.nextStep}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ─── Scrollable Content ──────────────────────────────── */}
              <ScrollArea className="flex-1">
                <div className="p-6 pb-28 space-y-5">

                  {/* 1. CURRENT RESPONSE: Chart/Table (only if current message has data) */}
                  {hasCurrentResponseData && hasChartData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                      <div className="flex items-center justify-between mb-4">
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
                        {activeView === 'chart' && (
                          <PremiumChartTypeSelect value={chartType} onChange={setChartType} className="flex-shrink-0" />
                        )}
                      </div>
                      <div className="rounded-xl bg-transparent border border-border/20 p-5">
                        <AnimatePresence mode="wait">
                          {activeView === 'chart' ? (
                            <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                              {renderChart()}
                            </motion.div>
                          ) : (
                            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="max-h-[400px] overflow-auto">
                              <DataTable data={chartData} allowEdit={false} allowFilter={true} allowSort={true} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. AI SUMMARY */}
                  {hasCurrentResponseData && hasChartData && (
                    <AISummaryCard chartData={chartData} dataKeys={dataKeys} title={title} timeframe={dataInfo.timeframe} dataSource={dataInfo.source} onFeedback={(helpful) => {
                      console.log('Visualization feedback:', { helpful, title, dataSource: dataInfo.source });
                    }} />
                  )}

                  {/* 3. WORKSPACE HEALTH (from analyst engine) */}
                  {analystState?.healthScore && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Workspace Health</span>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" opacity={0.2} />
                            <circle cx="18" cy="18" r="15.5" fill="none"
                              stroke={analystState.healthScore.total >= 70 ? 'hsl(142 71% 45%)' : analystState.healthScore.total >= 40 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'}
                              strokeWidth="2.5" strokeLinecap="round"
                              strokeDasharray={`${analystState.healthScore.total * 0.974} 100`}
                              className="transition-all duration-700 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground">{analystState.healthScore.total}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            {analystState.healthScore.trend === 'improving' && <TrendIcon className="w-3 h-3 text-emerald-500" />}
                            {analystState.healthScore.trend === 'declining' && <TrendIcon className="w-3 h-3 text-red-500 rotate-180" />}
                            {analystState.healthScore.trend === 'stable' && <Activity className="w-3 h-3 text-muted-foreground" />}
                            <span className="text-xs text-muted-foreground capitalize">{analystState.healthScore.trend}</span>
                          </div>
                          {analystState.healthScore.topCritical && (
                            <p className="text-[10px] text-amber-500">⚡ {analystState.healthScore.topCritical} needs attention</p>
                          )}
                        </div>
                      </div>
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                          <ChevronDown className="w-3 h-3" />Score breakdown
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 space-y-1.5">
                            {analystState.healthScore.factors.map((factor) => (
                              <div key={factor.name} className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-muted-foreground truncate">{factor.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all", factor.status === 'good' ? 'bg-emerald-500' : factor.status === 'warning' ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${(factor.score / factor.maxScore) * 100}%` }} />
                                  </div>
                                  <span className="text-[9px] text-muted-foreground/60 w-7 text-right">{factor.score}/{factor.maxScore}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </motion.div>
                  )}

                  {/* 4. KEY METRICS — prefer analyst cumulative metrics, fall back to chart-derived */}
                  {(() => {
                    const metricsToShow = (analystState?.cumulativeMetrics && analystState.cumulativeMetrics.length > 0)
                      ? analystState.cumulativeMetrics.slice(0, 4)
                      : metricCards;
                    if (metricsToShow.length === 0) return null;
                    return (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Key Metrics</span>
                          <Badge variant="outline" className="text-[9px] text-muted-foreground/50 h-5">{dataInfo.timeframe}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {metricsToShow.map((metric: any, idx: number) => (
                            <PremiumMetricCard
                              key={metric.id || idx}
                              label={metric.label || metric.title}
                              value={metric.value}
                              trend={metric.trend || (metric.change?.type === 'increase' ? 'up' : metric.change?.type === 'decrease' ? 'down' : 'neutral')}
                              trendValue={metric.trendValue || (metric.change ? `${metric.change.value > 0 ? '+' : ''}${metric.change.value}%` : undefined)}
                              index={idx}
                              comparisonValue={metric.previousValue}
                              comparisonPeriod={metric.comparisonPeriod || timeframeLabel}
                              target={metric.target}
                              targetLabel={metric.targetLabel}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* 5. PLATFORM STATS (from analyst engine, with sparklines) */}
                  {analystState && analystState.platformData.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Platform Stats</span>
                      <div className="grid grid-cols-2 gap-2">
                        {analystState.platformData.map((dp, idx) => {
                          const context = getMetricContext(dp.label, dp.value, analystState.platformData);
                          return (
                            <Card key={dp.label} className="p-3 bg-muted/10 border-border/20">
                              <div className="flex items-start justify-between">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dp.label}</p>
                                {dp.trendData && dp.trendData.some(v => v > 0) && (
                                  <MiniSparkline data={dp.trendData} height={16} width={40} trend={dp.trendData[dp.trendData.length - 1] > dp.trendData[0] ? 'up' : dp.trendData[dp.trendData.length - 1] < dp.trendData[0] ? 'down' : 'neutral'} />
                                )}
                              </div>
                              <p className="text-lg font-semibold text-foreground mt-0.5">{dp.value.toLocaleString()}</p>
                              {context && <p className="text-[9px] text-muted-foreground/60 mt-1 leading-relaxed">{context}</p>}
                            </Card>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── Section Divider ─── */}
                  {(analystState?.platformData?.length || 0) > 0 && <div className="border-t border-border/10" />}

                  {/* 5.5 SESSION CHARTS DASHBOARD — accumulated charts from conversation */}
                  {analystState && analystState.accumulatedCharts.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Session Charts</span>
                        <Badge variant="outline" className="text-[9px] text-muted-foreground/50 h-5">{analystState.accumulatedCharts.length} charts</Badge>
                      </div>
                      
                      {/* If we have a current response chart, show accumulated as mini-grid */}
                      {hasCurrentResponseData && hasChartData ? (
                        <div className="grid grid-cols-2 gap-2">
                          {analystState.accumulatedCharts
                            .slice(0, showAllSessionCharts ? undefined : 4)
                            .map((chart, idx) => (
                            <Card 
                              key={`session-chart-${idx}`}
                              className={cn(
                                "p-2 bg-muted/5 border-border/15 cursor-pointer transition-all hover:border-primary/30 hover:bg-primary/5",
                                expandedChartIndex === idx && "border-primary/40 bg-primary/10"
                              )}
                              onClick={() => setExpandedChartIndex(expandedChartIndex === idx ? null : idx)}
                            >
                              <p className="text-[9px] font-medium text-muted-foreground truncate mb-1">{chart.title || `Chart ${idx + 1}`}</p>
                              <div className="h-[100px]">
                                {(() => {
                                  const miniData = chart.data || [];
                                  if (!miniData.length) return <div className="flex items-center justify-center h-full text-[9px] text-muted-foreground/40">No data</div>;
                                  const miniKeys = chart.categories?.filter(c => c !== 'name') || Object.keys(miniData[0]).filter(k => k !== 'name' && typeof miniData[0][k] === 'number');
                                  const miniColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'];
                                  return (
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={miniData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                                        {miniKeys.slice(0, 2).map((key, kIdx) => (
                                          <Bar key={key} dataKey={key} fill={miniColors[kIdx % miniColors.length]} radius={[2, 2, 0, 0]} />
                                        ))}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  );
                                })()}
                              </div>
                            </Card>
                          ))}
                          {analystState.accumulatedCharts.length > 4 && !showAllSessionCharts && (
                            <button onClick={() => setShowAllSessionCharts(true)} className="col-span-2 text-[10px] text-primary/60 hover:text-primary transition-colors py-1">
                              Show all ({analystState.accumulatedCharts.length}) →
                            </button>
                          )}
                        </div>
                      ) : (
                        /* No current response data — show all charts in a stack as the dashboard view */
                        <div className="space-y-3">
                          {analystState.accumulatedCharts.map((chart, idx) => (
                            <Card key={`dashboard-chart-${idx}`} className="p-3 bg-muted/5 border-border/15">
                              <p className="text-xs font-medium text-foreground/80 mb-2">{chart.title || `Chart ${idx + 1}`}</p>
                              <div className="h-[180px]">
                                {(() => {
                                  const stackData = chart.data || [];
                                  if (!stackData.length) return <div className="flex items-center justify-center h-full text-xs text-muted-foreground/40">No data</div>;
                                  const stackKeys = chart.categories?.filter(c => c !== 'name') || Object.keys(stackData[0]).filter(k => k !== 'name' && typeof stackData[0][k] === 'number');
                                  const stackColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
                                  return (
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={stackData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} width={28} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                                        {stackKeys.slice(0, 3).map((key, kIdx) => (
                                          <Bar key={key} dataKey={key} fill={stackColors[kIdx % stackColors.length]} radius={[4, 4, 0, 0]} />
                                        ))}
                                      </BarChart>
                                    </ResponsiveContainer>
                                  );
                                })()}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ─── Section Divider ─── */}
                  {analystState && analystState.accumulatedCharts.length > 0 && <div className="border-t border-border/10" />}

                  {/* 5.7 WEB INTELLIGENCE — web search results from analyst */}
                  {analystState && analystState.webSearchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Web Intelligence</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] text-cyan-500/60 border-cyan-500/20 h-5">{analystState.webSearchResults.length} searches</Badge>
                      </div>
                      <div className="space-y-2">
                        {analystState.webSearchResults.map((ws, wsIdx) => (
                          <Collapsible key={`ws-${wsIdx}`}>
                            <CollapsibleTrigger className="w-full">
                              <Card className="p-2.5 bg-transparent border-border/15 border-l-2 border-l-cyan-500/30 hover:border-l-cyan-500/60 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Search className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                                    <span className="text-xs text-foreground/80 truncate">"{ws.query}"</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-[9px] text-muted-foreground/50">{ws.results.length} results</span>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                                  </div>
                                </div>
                              </Card>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-1.5 ml-4 space-y-1.5">
                                {ws.results.slice(0, 3).map((result, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-2 rounded-lg bg-muted/10 border border-border/10 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-colors group"
                                  >
                                    <div className="flex items-start gap-1.5">
                                      <ExternalLink className="w-3 h-3 text-cyan-500/50 group-hover:text-cyan-500 mt-0.5 flex-shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-foreground/80 line-clamp-1 group-hover:text-cyan-500 transition-colors">{result.title}</p>
                                        <p className="text-[9px] text-muted-foreground/60 line-clamp-2 mt-0.5">{result.snippet}</p>
                                        <span className="text-[8px] text-muted-foreground/40 mt-0.5 block">{new URL(result.url).hostname}</span>
                                      </div>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                      {onSendMessage && (
                        <button onClick={() => onSendMessage('[web-search] Search for more relevant information')} className="w-full text-[10px] text-cyan-500/60 hover:text-cyan-500 transition-colors py-1.5 border border-dashed border-cyan-500/15 hover:border-cyan-500/30 rounded-lg">
                          Search more →
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Web intel prompt when topics suggest it but no results yet */}
                  {analystState && analystState.webSearchResults.length === 0 && analystState.topics.some(t => t.category === 'keywords' || t.category === 'competitors') && onSendMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      <button onClick={() => onSendMessage('[web-search] Get web intelligence on current topics')} className="w-full p-3 rounded-lg bg-cyan-500/5 border border-dashed border-cyan-500/15 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-colors text-left">
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-cyan-500/50" />
                          <div>
                            <p className="text-[11px] font-medium text-foreground/70">Get Web Intelligence</p>
                            <p className="text-[9px] text-muted-foreground/50">Fetch SERP & competitor data for current topics</p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  )}

                  {/* ─── Section Divider ─── */}
                  <div className="border-t border-border/10" />

                  {/* 6. INSIGHTS FEED (merged: analyst cumulative + current response) */}
                  {mergedInsightsFeed.length > 0 && (
                    <Collapsible open={isInsightsExpanded} onOpenChange={setIsInsightsExpanded}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between cursor-pointer group py-1">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">Insights Feed</h3>
                            <Badge variant="outline" className="text-xs text-muted-foreground">{mergedInsightsFeed.length}</Badge>
                          </div>
                          <motion.div animate={{ rotate: isInsightsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                          </motion.div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <motion.div className="mt-3 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                          {mergedInsightsFeed.slice(-12).reverse().map((insight: any, idx: number) => {
                            const config = getInsightConfig(insight.insightType || insight.type);
                            const InsightIcon = config.icon;
                            return (
                              <Card key={insight.id || idx} className={cn("p-2.5 border bg-transparent border-border/15 border-l-2", config.borderColor.replace('border-', 'border-l-'))}>
                                <div className="flex items-start gap-2">
                                  <InsightIcon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", config.textColor)} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground/80 leading-relaxed">{insight.content}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] text-muted-foreground/40">
                                        {insight.source === 'platform' ? '📊 Platform' : insight.source === 'web' ? '🌐 Web' : insight.source === 'cross-signal' ? '🔗 Cross-signal' : '🤖 AI'}
                                      </span>
                                      {onSendMessage && (
                                        <button onClick={() => onSendMessage(`Tell me more about: ${insight.content}`)} className="text-[9px] text-primary/50 hover:text-primary transition-colors">
                                          Explore →
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* 7. EXPLORE NEXT — dynamic prompts from analyst + deep dives */}
                  {onSendMessage && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Explore Next</span>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const dynamicPrompts: { id: string; label: string; action: string }[] = [];

                          // From deep dive prompts (current response)
                          for (const prompt of deepDivePrompts.slice(0, 2)) {
                            dynamicPrompts.push({ id: `dd-${prompt.text.slice(0, 10)}`, label: prompt.text, action: prompt.text });
                          }

                          // From analyst topics
                          if (analystState) {
                            for (const topic of analystState.topics.slice(0, 2)) {
                              if (!dynamicPrompts.some(p => p.label.includes(topic.name))) {
                                dynamicPrompts.push({ id: `topic-${topic.name}`, label: `Deep dive: ${topic.name}`, action: `Give me a detailed analysis of my ${topic.name.toLowerCase()} performance` });
                              }
                            }
                            const warnings = analystState.insightsFeed.filter(i => i.type === 'warning').slice(0, 1);
                            for (const warning of warnings) {
                              dynamicPrompts.push({ id: `warn-${warning.id}`, label: 'Address warning', action: `How can I fix this: ${warning.content}` });
                            }
                            for (const action of analystState.suggestedActions.slice(0, 2)) {
                              dynamicPrompts.push({ id: action.id, label: action.title, action: action.action || action.title });
                            }
                          }

                          if (dynamicPrompts.length === 0) {
                            return ['Show content performance', 'Campaign health overview', 'Keyword rankings analysis'].map((prompt, idx) => (
                              <button key={idx} onClick={() => onSendMessage?.(prompt)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/20 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors">
                                {prompt}
                              </button>
                            ));
                          }

                          return dynamicPrompts.slice(0, 5).map((prompt) => (
                            <button key={prompt.id} onClick={() => onSendMessage?.(prompt.action)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/20 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors">
                              {prompt.label}
                            </button>
                          ));
                        })()}
                      </div>
                    </motion.div>
                  )}

                  {/* 8. QUICK ACTIONS */}
                  {onSendMessage && hasCurrentResponseData && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <SidebarActionPanel dataSource={dataInfo.source} onSendMessage={onSendMessage} onClose={onClose} />
                    </motion.div>
                  )}

                  {/* Empty state — only when nothing at all */}
                  {!hasCurrentResponseData && !hasAnalystData && (
                    <div className="flex-1 flex items-center justify-center py-16">
                      <div className="text-center max-w-xs space-y-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/30 border border-border/20 flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-muted-foreground/60" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-foreground">Ask about your data</h3>
                          <p className="text-sm text-muted-foreground">
                            I'll accumulate insights, metrics, and charts as we chat — building a live intelligence feed.
                          </p>
                        </div>
                        {analystState?.isEnriching && (
                          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Loading platform data...
                          </div>
                        )}
                        <div className="flex flex-wrap justify-center gap-2">
                          {['Show content performance', 'Campaign health overview', 'Keyword rankings analysis', 'Content pipeline status'].map((prompt, idx) => (
                            <button key={idx} onClick={() => onSendMessage?.(prompt)} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/20 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors">
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 9. SESSION SUMMARY COUNTER */}
                  {analystState && (analystState.accumulatedCharts.length > 0 || mergedInsightsFeed.length > 0 || analystState.webSearchResults.length > 0) && (
                    <div className="border-t border-border/10 pt-3">
                      <p className="text-[9px] text-center text-muted-foreground/40">
                        {[
                          analystState.accumulatedCharts.length > 0 && `${analystState.accumulatedCharts.length} chart${analystState.accumulatedCharts.length > 1 ? 's' : ''}`,
                          mergedInsightsFeed.length > 0 && `${mergedInsightsFeed.length} insight${mergedInsightsFeed.length > 1 ? 's' : ''}`,
                          analystState.webSearchResults.length > 0 && `${analystState.webSearchResults.length} web search${analystState.webSearchResults.length > 1 ? 'es' : ''}`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        </TooltipProvider>
      )}
    </AnimatePresence>
  );
};
