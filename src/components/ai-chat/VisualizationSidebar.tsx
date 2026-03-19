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
import { AnalystNarrativeTimeline } from './analyst-sections/AnalystNarrativeTimeline';
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

  // Merge analyst insights feed with current response insights
  const mergedInsightsFeed = useMemo(() => {
    const allInsights = [...(analystState?.insightsFeed || [])];
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
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">Topics Discussed</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analystState.topics.map((topic) => (
                        <span key={topic.name} className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-muted-foreground/70">
                          {topic.name}
                          {topic.mentionCount > 1 && <span className="ml-1 text-amber-300/70">×{topic.mentionCount}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data context badges + timeframe */}
                {hasCurrentResponseData && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">Data Source</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm text-muted-foreground/70">
                        <Database className="w-3 h-3 mr-1 text-amber-300/50" />
                        {dataInfo.source}
                      </span>
                      {dataInfo.points > 0 && (
                        <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-muted-foreground/60">{dataInfo.points} pts</span>
                      )}
                      <Select value={selectedTimeframe} onValueChange={(val) => setSelectedTimeframe(val as TimeframeOption)}>
                        <SelectTrigger className="h-6 text-[10px] border-white/[0.06] bg-white/[0.04] rounded-full w-auto gap-1 px-2.5">
                          <Clock className="w-3 h-3 text-amber-300/50" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border z-50">
                          <SelectItem value="7d" className="text-xs">Last 7 days</SelectItem>
                          <SelectItem value="30d" className="text-xs">Last 30 days</SelectItem>
                          <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className={cn(
                        "inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm",
                        qualityConfig.label === 'High' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400/80' :
                        qualityConfig.label === 'Medium' ? 'bg-amber-300/10 border-amber-300/20 text-amber-300/80' :
                        'bg-rose-300/10 border-rose-300/20 text-rose-300/80'
                      )}>{qualityConfig.label}</span>
                      {isTrendLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground/40" />}
                    </div>
                  </div>
                )}

                {/* Goal Progress */}
                {analystState?.goalProgress && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 glass-card p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300/70">Goal Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground/80">{analystState.goalProgress.goalName}</span>
                      <span className="text-[11px] font-bold text-amber-300/80">{analystState.goalProgress.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300/60 to-amber-400/40 transition-all"
                        style={{ width: `${Math.min(analystState.goalProgress.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                        analystState.goalProgress.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400/80' :
                        analystState.goalProgress.status === 'nearly_done' ? 'bg-emerald-400/10 text-emerald-400/70' :
                        analystState.goalProgress.status === 'in_progress' ? 'bg-amber-300/10 text-amber-300/70' :
                        'bg-white/[0.04] text-muted-foreground/60'
                      )}>
                        {analystState.goalProgress.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50">Next: {analystState.goalProgress.nextStep}</span>
                    </div>
                  </motion.div>
                )}

                {/* Divider between header metadata and narrative content */}
                <div className="mt-4 border-b border-white/[0.04]" />
              </div>

              {/* ─── Scrollable Content — Narrative Timeline ─────────── */}
              <ScrollArea className="flex-1">
                <div className="p-6 pb-28">
                  <AnalystNarrativeTimeline
                    analystState={analystState || null}
                    chartData={chartData}
                    dataKeys={dataKeys}
                    deepDivePrompts={deepDivePrompts.map(p => p.text)}
                    onSendMessage={onSendMessage || (() => {})}
                  />
                </div>
              </ScrollArea>
            </motion.div>
          </>
        </TooltipProvider>
      )}
    </AnimatePresence>
  );
};
