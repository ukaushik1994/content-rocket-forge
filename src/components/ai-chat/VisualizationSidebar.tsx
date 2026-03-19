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
  Globe,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  
  // Warning indicators
  if (/failed|error|issue|risk|problem|critical|urgent|alert|warning|down|decrease|declining|dropped/.test(lower)) {
    return 'warning';
  }
  
  // Opportunity indicators  
  if (/opportunity|potential|improve|recommend|action|ready|suggest|could|boost|increase|growth|rising|trending up/.test(lower)) {
    return 'opportunity';
  }
  
  // Default to trend for data observations
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
  onInteract?: () => void; // Track user interaction for smart persistence
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
  const [secondaryChartType, setSecondaryChartType] = useState<ChartType>('pie');
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('30d');
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // Get user for trend data fetching
  const { user } = useAuth();

  // Smart secondary chart type selection based on primary
  const getComplementaryChartType = useCallback((primary: ChartType): ChartType => {
    switch (primary) {
      case 'bar':
      case 'line':
      case 'area':
        return 'pie';
      case 'pie':
        return 'bar';
      case 'radar':
        return 'bar';
      case 'radial':
        return 'pie';
      default:
        return 'pie';
    }
  }, []);

  // Update secondary chart type when primary changes
  useEffect(() => {
    setSecondaryChartType(getComplementaryChartType(chartType));
  }, [chartType, getComplementaryChartType]);

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

  // Issue #2 Fix: Extract data with fallback chain
  const chartData = useMemo(() => {
    // Primary source: chartConfig.data
    if (chartConfig?.data && chartConfig.data.length > 0) {
      return chartConfig.data;
    }
    
    // Fallback 1: visualData.data
    if (visualData?.data && Array.isArray(visualData.data) && visualData.data.length > 0) {
      console.log('📊 Chart data fallback 1: using visualData.data');
      return visualData.data;
    }
    
    // Fallback 2: visualData.tableData (convert to chart format)
    if (visualData?.tableData?.rows && visualData.tableData.rows.length > 0) {
      console.log('📊 Chart data fallback 2: converting tableData to chart format');
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
    
    // Fallback 3: Comparison chart data (E5)
    if (visualData?.type === 'comparison_chart' && visualData?.metrics) {
      console.log('📊 Chart data fallback 3: converting comparison_chart data');
      return visualData.metrics.map((metric: string, idx: number) => ({
        name: metric,
        [visualData.labels?.[0] || 'Current']: visualData.current?.[idx] || 0,
        [visualData.labels?.[1] || 'Previous']: visualData.previous?.[idx] || 0
      }));
    }

    // Fallback 4: Generate from metricCards if available
    if (visualData?.summaryInsights?.metricCards && visualData.summaryInsights.metricCards.length > 0) {
      console.log('📊 Chart data fallback 4: generating from metricCards');
      return visualData.summaryInsights.metricCards.map((card: any) => ({
        name: card.label || card.title || 'Metric',
        value: typeof card.value === 'number' ? card.value : parseFloat(card.value) || 0
      }));
    }
    
    return [];
  }, [chartConfig, visualData]);

  // Determine if we should show secondary chart
  const hasSecondaryData = useMemo(() => {
    // Show secondary if we have enough data points for meaningful comparison
    return chartData.length >= 2;
  }, [chartData]);

  // Get data source for trend hook
  const dataSource = useMemo(() => visualData?.dataSource || 'AI Analysis', [visualData]);
  
  // Fetch real trend data using smart auto-detect
  const { trendData, isLoading: isTrendLoading, timeframeLabel } = useSidebarTrendData({
    userId: user?.id || null,
    dataSource,
    timeframe: selectedTimeframe,
    chartData
  });

  // Extract metric cards from visualData with REAL trend calculations
  const metricCards = useMemo(() => {
    if (visualData?.summaryInsights?.metricCards) {
      // If AI provided metrics, enrich with real trend data if available
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
    
    // Generate metrics from chart data with REAL trend calculations
    if (chartData.length > 0) {
      const firstItem = chartData[0];
      const numericKeys = Object.keys(firstItem).filter(
        key => typeof firstItem[key] === 'number' && !['id', 'index', 'dataSource'].includes(key)
      );
      
      return numericKeys.slice(0, 4).map((key) => {
        const values = chartData.map(item => Number(item[key]) || 0);
        const total = values.reduce((sum, val) => sum + val, 0);
        const avg = total / chartData.length;
        
        // Use trend data from hook if available, otherwise calculate from chart data
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
        
        // Fallback: Calculate from first-half vs second-half of chart data
        const midpoint = Math.floor(values.length / 2);
        const firstHalfAvg = midpoint > 0 ? values.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint : 0;
        const secondHalfAvg = midpoint > 0 ? values.slice(midpoint).reduce((a, b) => a + b, 0) / (values.length - midpoint) : avg;
        
        const changePercent = firstHalfAvg > 0 
          ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) 
          : 0;
        
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

  // Extract insights with AI-DRIVEN type classification (not random)
  const insights = useMemo(() => {
    const rawInsights = visualData?.insights || visualData?.actionableItems?.map((item: any) => ({
      type: 'insight',
      content: item.description || item.title
    })) || [];

    // Use keyword-based classification instead of arbitrary cycling
    return rawInsights.map((insight: any) => {
      const content = insight.content || insight.description || insight;
      return {
        ...insight,
        content,
        insightType: insight.insightType || classifyInsightType(content)
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

  // Data source info with COMBINED quality assessment
  const dataInfo = useMemo(() => {
    const source = visualData?.dataSource || 'AI Analysis';
    const points = chartData.length;
    const timeframe = selectedTimeframe === '7d' ? 'Last 7 days' : 
                      selectedTimeframe === '30d' ? 'Last 30 days' : 'Custom';
    
    // Combined quality assessment based on completeness + volume + variation
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

  // ChartBlock component for consistent chart rendering
  const ChartBlock: React.FC<{
    title?: string;
    children: React.ReactNode;
    compact?: boolean;
    controls?: React.ReactNode;
  }> = ({ title, children, compact = false, controls }) => (
    <div className={cn(
      "rounded-xl bg-transparent border border-border/20",
      compact ? "p-4" : "p-5"
    )}>
      {(title || controls) && (
        <div className="flex items-center justify-between mb-3">
          {title && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
          )}
          {controls}
        </div>
      )}
      <div className={compact ? "h-[200px]" : "h-[260px]"}>
        {children}
      </div>
    </div>
  );

  // Loading skeleton for chart transitions
  const ChartLoadingSkeleton = () => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      <p className="text-xs text-muted-foreground">Loading chart...</p>
    </div>
  );

  const renderChart = (type: ChartType = chartType, height: number = 260) => {
    // Show loading skeleton while trend data is being fetched
    if (isChartLoading) {
      return <ChartLoadingSkeleton />;
    }
    
    // Issue #2 Fix: Actionable empty state with prompt suggestion
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSendMessage("Show me a chart of my content performance")}
                className="text-xs"
              >
                <BarChart3 className="w-3 h-3 mr-1.5" />
                Request a chart
              </Button>
            )}
          </div>
        </div>
      );
    }

    const commonProps = { data: chartData, width: '100%', height };
    
    // Modern premium tooltip styling
    const tooltipStyle = { 
      backgroundColor: 'hsl(var(--popover))', 
      border: 'none', 
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      fontSize: '11px',
      padding: '8px 12px'
    };

    // Modern color palette with gradients
    const modernColors = [
      '#6366f1', // indigo
      '#8b5cf6', // violet  
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ec4899', // pink
    ];

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`lineGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={32}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              />
              <RechartsTooltip 
                contentStyle={tooltipStyle} 
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              {dataKeys.map((key, idx) => (
                <React.Fragment key={key}>
                  <Area 
                    type="natural" 
                    dataKey={key} 
                    stroke={modernColors[idx % modernColors.length]} 
                    strokeWidth={2.5}
                    fill={`url(#lineGradient${idx})`}
                    dot={false}
                    activeDot={{ 
                      r: 5, 
                      strokeWidth: 2, 
                      stroke: 'hsl(var(--background))',
                      fill: modernColors[idx % modernColors.length]
                    }}
                  />
                </React.Fragment>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`areaGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={32}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              />
              <RechartsTooltip 
                contentStyle={tooltipStyle}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              {dataKeys.map((key, idx) => (
                <Area 
                  key={key} 
                  type="natural" 
                  dataKey={key} 
                  stroke={modernColors[idx % modernColors.length]} 
                  strokeWidth={2}
                  fill={`url(#areaGradient${idx})`}
                  dot={false}
                  activeDot={{ 
                    r: 4, 
                    strokeWidth: 2, 
                    stroke: 'hsl(var(--background))',
                    fill: modernColors[idx % modernColors.length]
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }} barCategoryGap="20%">
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`barGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={32}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              />
              <RechartsTooltip 
                contentStyle={tooltipStyle}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 4 }}
              />
              {dataKeys.map((key, idx) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={`url(#barGradient${idx})`}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
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
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
                strokeWidth={0}
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={`url(#pieGradient${idx})`} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Legend 
                verticalAlign="bottom" 
                height={48}
                wrapperStyle={{ paddingTop: '12px' }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
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
              <PolarAngleAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
              />
              {dataKeys.map((key, idx) => (
                <Radar 
                  key={key} 
                  dataKey={key} 
                  stroke={modernColors[idx % modernColors.length]} 
                  strokeWidth={2}
                  fill={`url(#radarGradient${idx})`}
                  dot={{ r: 3, fill: modernColors[idx % modernColors.length] }}
                />
              ))}
              <RechartsTooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'radial':
        return (
          <ResponsiveContainer {...commonProps}>
            <RadialBarChart 
              innerRadius="30%" 
              outerRadius="90%" 
              data={chartData} 
              startAngle={180} 
              endAngle={-180}
              cx="50%"
              cy="50%"
            >
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`radialGradient${idx}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <RadialBar 
                dataKey={dataKeys[0] || 'value'} 
                background={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                cornerRadius={8}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={`url(#radialGradient${idx})`} />
                ))}
              </RadialBar>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Legend 
                verticalAlign="bottom" 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <XAxis 
                dataKey={dataKeys[0] || 'x'} 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                dataKey={dataKeys[1] || 'y'}
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Scatter 
                data={chartData} 
                fill={modernColors[0]}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={modernColors[idx % modernColors.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer {...commonProps}>
            <FunnelChart>
              <RechartsTooltip contentStyle={tooltipStyle} />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={modernColors[idx % modernColors.length]} />
                ))}
                <LabelList 
                  position="right" 
                  fill="hsl(var(--foreground))" 
                  fontSize={10}
                  dataKey="name"
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="composedBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={modernColors[0]} stopOpacity={1} />
                  <stop offset="100%" stopColor={modernColors[0]} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {/* First data key as bars */}
              {dataKeys.slice(0, 1).map((key) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill="url(#composedBarGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ))}
              {/* Second data key as line overlay */}
              {dataKeys.slice(1, 2).map((key, idx) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={modernColors[idx + 1]} 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 8, left: 0 }} barCategoryGap="20%">
              <defs>
                {modernColors.map((color, idx) => (
                  <linearGradient key={idx} id={`defaultBarGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                width={32}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              />
              <RechartsTooltip 
                contentStyle={tooltipStyle}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 4 }}
              />
              {dataKeys.map((key, idx) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={`url(#defaultBarGradient${idx})`}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                />
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
      case 'high':
        return { color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', label: 'High Quality' };
      case 'medium':
        return { color: 'text-amber-500', bgColor: 'bg-amber-500/10', label: 'Medium' };
      default:
        return { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Low' };
    }
  };

  const qualityConfig = getQualityConfig(dataInfo.quality);

  const { isMobile, isTablet } = useResponsiveBreakpoint();

  // Content Wizard mode - render wizard instead of charts
  if (visualData?.type === 'content_wizard') {
    return (
      <ContentWizardSidebar
        isOpen={isOpen}
        onClose={onClose}
        keyword={visualData.keyword || ''}
        solutionId={visualData.solution_id}
        contentType={visualData.content_type}
        extractedContext={visualData.extractedContext}
      />
    );
  }

  // Proposal Browser mode
  if (visualData?.type === 'proposal_browser') {
    return (
      <ProposalBrowserSidebar
        isOpen={isOpen}
        onClose={onClose}
        keyword={visualData.keyword || ''}
      />
    );
  }

  // Panel modes — Only Repository & Approvals get sidebar panels
  if (visualData?.type === 'repository') {
    return <RepositoryPanel isOpen={isOpen} onClose={onClose} />;
  }
  if (visualData?.type === 'approvals') {
    return <ApprovalsPanel isOpen={isOpen} onClose={onClose} />;
  }
  if (visualData?.type === 'research_intelligence') {
    return <ResearchIntelligencePanel isOpen={isOpen} onClose={onClose} />;
  }
  if (visualData?.type === 'content_repurpose') {
    return <RepurposePanel isOpen={isOpen} onClose={onClose} contentId={visualData.contentId} />;
  }

  if (visualData?.type === 'analyst') {
    const hasAnalystData = analystState && (
      analystState.insightsFeed.length > 0 || 
      analystState.cumulativeMetrics.length > 0 || 
      analystState.accumulatedCharts.length > 0 ||
      analystState.platformData.length > 0
    );

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
                className={cn(
                  "fixed top-20 right-0 bottom-24 z-[35]",
                  "w-full sm:w-[400px] lg:w-[520px] xl:w-[600px]",
                  "bg-background/90 backdrop-blur-md",
                  "border-l border-border/10",
                  "flex flex-col overflow-hidden"
                )}
              >
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-5 border-b border-border/10">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <BarChart3 className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      {analystState?.isEnriching && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-medium text-foreground">Analyst</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {hasAnalystData 
                          ? `${analystState!.insightsFeed.length} insights · ${analystState!.topics.length} topics`
                          : 'Charts & insights companion'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="flex-shrink-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                   {/* Topic tags */}
                  {analystState && analystState.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {analystState.topics.map((topic) => (
                        <Badge 
                          key={topic.name} 
                          variant="outline" 
                          className="text-[10px] px-2 py-0.5 bg-muted/20 border-border/30 text-muted-foreground"
                        >
                          {topic.name}
                          {topic.mentionCount > 1 && (
                            <span className="ml-1 text-primary/70">×{topic.mentionCount}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Enhancement E: Goal Progress */}
                  {analystState?.goalProgress && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-2.5 rounded-lg bg-muted/15 border border-border/15 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          {analystState.goalProgress.goalName}
                        </span>
                        <span className="text-[10px] font-semibold text-primary">
                          {analystState.goalProgress.percentage}%
                        </span>
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
                        <span className="text-[9px] text-muted-foreground/60">
                          Next: {analystState.goalProgress.nextStep}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                   <div className="p-6 pb-28 space-y-5">
                    {/* Enhancement A: Health Score Ring */}
                    {analystState?.healthScore && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-3"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Workspace Health
                        </span>
                        <div className="flex items-center gap-4">
                          {/* SVG Score Ring */}
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" opacity={0.2} />
                              <circle
                                cx="18" cy="18" r="15.5" fill="none"
                                stroke={
                                  analystState.healthScore.total >= 70 ? 'hsl(142 71% 45%)' :
                                  analystState.healthScore.total >= 40 ? 'hsl(38 92% 50%)' :
                                  'hsl(0 84% 60%)'
                                }
                                strokeWidth="2.5"
                                strokeLinecap="round"
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
                              {analystState.healthScore.trend === 'improving' && (
                                <TrendIcon className="w-3 h-3 text-emerald-500" />
                              )}
                              {analystState.healthScore.trend === 'declining' && (
                                <TrendIcon className="w-3 h-3 text-red-500 rotate-180" />
                              )}
                              {analystState.healthScore.trend === 'stable' && (
                                <Activity className="w-3 h-3 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground capitalize">{analystState.healthScore.trend}</span>
                            </div>
                            {analystState.healthScore.topCritical && (
                              <p className="text-[10px] text-amber-500">
                                ⚡ {analystState.healthScore.topCritical} needs attention
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Expandable factors */}
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                            <ChevronDown className="w-3 h-3" />
                            Score breakdown
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-1.5">
                              {analystState.healthScore.factors.map((factor) => (
                                <div key={factor.name} className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-muted-foreground truncate">{factor.name}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full rounded-full transition-all",
                                          factor.status === 'good' ? 'bg-emerald-500' :
                                          factor.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                        )}
                                        style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-muted-foreground/60 w-7 text-right">
                                      {factor.score}/{factor.maxScore}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </motion.div>
                    )}

                    {/* Cumulative Metrics Strip */}
                    {analystState && analystState.cumulativeMetrics.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Key Metrics
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {analystState.cumulativeMetrics.slice(0, 4).map((metric, idx) => (
                            <PremiumMetricCard
                              key={metric.id || idx}
                              label={metric.title}
                              value={metric.value}
                              trend={metric.change?.type === 'increase' ? 'up' : metric.change?.type === 'decrease' ? 'down' : 'neutral'}
                              trendValue={metric.change ? `${metric.change.value > 0 ? '+' : ''}${metric.change.value}%` : undefined}
                              index={idx}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Platform Data Cards */}
                    {analystState && analystState.platformData.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="space-y-2"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Platform Stats
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {analystState.platformData.map((dp, idx) => (
                            <Card key={dp.label} className="p-3 bg-muted/10 border-border/20">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dp.label}</p>
                              <p className="text-lg font-semibold text-foreground mt-0.5">{dp.value.toLocaleString()}</p>
                            </Card>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Web Intelligence Cards */}
                    {analystState && analystState.webSearchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.07 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                            Web Intelligence
                          </span>
                        </div>
                        {analystState.webSearchResults.map((ws, wsIdx) => (
                          <div key={`ws-${wsIdx}`} className="space-y-1.5">
                            <p className="text-[10px] text-muted-foreground italic">"{ws.query}"</p>
                            {ws.results.slice(0, 4).map((result, rIdx) => (
                              <Card 
                                key={`wsr-${wsIdx}-${rIdx}`}
                                className="p-2.5 bg-cyan-500/5 border-border/15 border-l-2 border-l-cyan-500/30 hover:bg-cyan-500/10 transition-colors cursor-pointer group"
                                onClick={() => window.open(result.url, '_blank', 'noopener')}
                              >
                                <div className="flex items-start gap-2">
                                  <Search className="w-3 h-3 mt-0.5 flex-shrink-0 text-cyan-500/70" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground/90 line-clamp-1 group-hover:text-cyan-500 transition-colors">
                                      {result.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 line-clamp-2 mt-0.5">
                                      {result.snippet}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/30" />
                                      <span className="text-[9px] text-muted-foreground/30 truncate">
                                        {new URL(result.url).hostname}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Accumulated Charts Waterfall */}
                    {analystState && analystState.accumulatedCharts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-3"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Charts ({analystState.accumulatedCharts.length})
                        </span>
                        {analystState.accumulatedCharts.map((chart, idx) => (
                          <ChartBlock key={`analyst-chart-${idx}`} title={chart.title} compact>
                            {renderChart((chart.type as ChartType) || 'bar', 180)}
                          </ChartBlock>
                        ))}
                      </motion.div>
                    )}

                    {/* Live Insights Feed */}
                    {analystState && analystState.insightsFeed.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                            Insights Feed
                          </span>
                          <Badge variant="outline" className="text-[9px] text-muted-foreground/50 h-5">
                            {analystState.insightsFeed.length} items
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          {analystState.insightsFeed.slice(-12).reverse().map((insight) => {
                            const config = getInsightConfig(insight.type);
                            const InsightIcon = config.icon;
                            return (
                              <Card 
                                key={insight.id}
                                className={cn(
                                  "p-2.5 border bg-transparent border-border/15",
                                  "border-l-2",
                                  config.borderColor.replace('border-', 'border-l-')
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <InsightIcon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", config.textColor)} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-foreground/80 leading-relaxed">{insight.content}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] text-muted-foreground/40">
                                        {insight.source === 'platform' ? '📊 Platform' : insight.source === 'web' ? '🌐 Web' : '🤖 AI'}
                                      </span>
                                      {onSendMessage && (
                                        <button
                                          onClick={() => onSendMessage(`Tell me more about: ${insight.content}`)}
                                          className="text-[9px] text-primary/50 hover:text-primary transition-colors"
                                        >
                                          Explore →
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Phase 6c: Context-aware suggested prompts */}
                    {analystState && onSendMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Explore Next
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {/* Dynamic prompts based on topics + insights */}
                          {(() => {
                            const dynamicPrompts: { id: string; label: string; action: string }[] = [];
                            
                            // Generate prompts from detected topics
                            for (const topic of analystState.topics.slice(0, 2)) {
                              dynamicPrompts.push({
                                id: `topic-${topic.name}`,
                                label: `Deep dive: ${topic.name}`,
                                action: `Give me a detailed analysis of my ${topic.name.toLowerCase()} performance`,
                              });
                            }

                            // Generate prompts from warnings in insights
                            const warnings = analystState.insightsFeed.filter(i => i.type === 'warning').slice(0, 1);
                            for (const warning of warnings) {
                              dynamicPrompts.push({
                                id: `warn-${warning.id}`,
                                label: 'Address warning',
                                action: `How can I fix this: ${warning.content}`,
                              });
                            }

                            // Add from suggested actions
                            for (const action of analystState.suggestedActions.slice(0, 2)) {
                              dynamicPrompts.push({
                                id: action.id,
                                label: action.title,
                                action: action.action || action.title,
                              });
                            }

                            // Fallback static prompts if nothing dynamic
                            if (dynamicPrompts.length === 0) {
                              return ['Show content performance', 'Campaign health overview', 'Keyword rankings analysis'].map((prompt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => onSendMessage?.(prompt)}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/20 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                                >
                                  {prompt}
                                </button>
                              ));
                            }

                            return dynamicPrompts.slice(0, 4).map((prompt) => (
                              <button
                                key={prompt.id}
                                onClick={() => onSendMessage?.(prompt.action)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/20 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                              >
                                {prompt.label}
                              </button>
                            ));
                          })()}
                        </div>
                      </motion.div>
                    )}

                    {/* Empty state - only when truly nothing */}
                    {!hasAnalystData && (
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
                              <button
                                key={idx}
                                onClick={() => onSendMessage?.(prompt)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/40 border border-border/20 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
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
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <TooltipProvider delayDuration={300}>
          <>
            {/* Backdrop for mobile & tablet - overlays content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-16 bottom-24 left-0 right-0 bg-black/40 backdrop-blur-sm z-[35] lg:hidden"
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
                // Position: below navbar (top-20 = 80px), ends above input bar (bottom-24 = 96px)
                "fixed top-20 right-0 bottom-24 z-[35]",
                // Responsive widths: full on mobile, 400px on tablet, 520-600px on desktop
                "w-full sm:w-[400px] lg:w-[520px] xl:w-[600px]",
                "bg-background/90 backdrop-blur-md",
                "border-l border-border/10",
                "flex flex-col overflow-hidden"
              )}
            >
              {/* Clean Header */}
              <div className="flex-shrink-0">
                <div className="px-6 py-5 border-b border-border/10">
                  <div className="flex items-start gap-3">
                    {/* Simple icon container */}
                    <div className="flex-shrink-0">
                       <Activity className="w-5 h-5 text-muted-foreground" />
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
                  
                  {/* Data context badges with timeframe selector */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      {dataInfo.source}
                    </Badge>
                    {dataInfo.points > 0 && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {dataInfo.points} pts
                      </Badge>
                    )}
                    
                    {/* User-selectable timeframe dropdown */}
                    <Select 
                      value={selectedTimeframe} 
                      onValueChange={(val) => setSelectedTimeframe(val as TimeframeOption)}
                    >
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
                    
                    <Badge variant="outline" className={cn("text-xs", qualityConfig.color)}>
                      {qualityConfig.label}
                    </Badge>
                    
                    {isTrendLoading && (
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    )}
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
                    <div className="rounded-xl bg-transparent border border-border/20 p-5">
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

                  {/* 2. AI SUMMARY - with timeframe context and real feedback handler (Issue #3 fix) */}
                  {chartData.length > 0 && (
                    <AISummaryCard
                      chartData={chartData}
                      dataKeys={dataKeys}
                      title={title}
                      timeframe={dataInfo.timeframe}
                      dataSource={dataInfo.source}
                      onFeedback={(helpful) => {
                        // Real feedback handler - could persist to database
                        console.log('Visualization feedback:', { helpful, title, dataSource: dataInfo.source });
                        // Optional: Add toast notification or persist to ai_message_reactions
                      }}
                    />
                  )}

                  {/* 3. SECONDARY CHART - Different perspective */}
                  {hasSecondaryData && activeView === 'chart' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <ChartBlock
                        title={secondaryChartType === 'pie' ? 'Distribution' : 'Comparison'}
                        compact
                        controls={
                          <PremiumChartTypeSelect 
                            value={secondaryChartType} 
                            onChange={setSecondaryChartType}
                            className="flex-shrink-0"
                          />
                        }
                      >
                        {renderChart(secondaryChartType, 200)}
                      </ChartBlock>
                    </motion.div>
                  )}

                  {/* 4. KEY METRICS - Real trends with proper comparison */}
                  {metricCards.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                          Key Metrics
                        </span>
                        <Badge variant="outline" className="text-[9px] text-muted-foreground/50 h-5">
                          {dataInfo.timeframe}
                        </Badge>
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
                            comparisonValue={metric.previousValue}
                            comparisonPeriod={metric.comparisonPeriod || timeframeLabel}
                            target={metric.target}
                            targetLabel={metric.targetLabel}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 5. AI INSIGHTS (collapsed) */}
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
                                   "p-3 border transition-colors hover:bg-muted/20",
                                   "bg-transparent",
                                   "border-border/20",
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

                  {/* 6. QUICK ACTIONS - Contextual module actions */}
                  {onSendMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <SidebarActionPanel
                        dataSource={dataInfo.source}
                        onSendMessage={onSendMessage}
                        onClose={onClose}
                      />
                    </motion.div>
                  )}

                  {/* 7. Deep Dive Prompts */}
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

            </motion.div>
          </>
        </TooltipProvider>
      )}
    </AnimatePresence>
  );
};
