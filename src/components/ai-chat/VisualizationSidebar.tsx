import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartConfiguration } from '@/types/enhancedChat';
import { DataTable } from './DataTable';
import { ChartTypeSwitcher } from './ChartTypeSwitcher';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  X, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  Table as TableIcon,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Database,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
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
}

export const VisualizationSidebar: React.FC<VisualizationSidebarProps> = ({
  isOpen,
  onClose,
  visualData,
  chartConfig,
  title,
  description,
  onSendMessage
}) => {
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area' | 'pie' | 'radar' | 'funnel' | 'scatter' | 'radial' | 'composed'>(
    (chartConfig?.type as any) || 'bar'
  );
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(true);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

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
      
      return numericKeys.slice(0, 4).map(key => {
        const total = chartData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
        const avg = total / chartData.length;
        return {
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: Math.round(avg),
          trend: Math.random() > 0.5 ? 'up' : 'down'
        };
      });
    }
    return [];
  }, [visualData, chartData]);

  // Extract insights
  const insights = useMemo(() => {
    return visualData?.insights || visualData?.actionableItems?.map((item: any) => ({
      type: 'insight',
      content: item.description || item.title
    })) || [];
  }, [visualData]);

  // Deep dive prompts
  const deepDivePrompts = useMemo(() => {
    return visualData?.deepDivePrompts || [];
  }, [visualData]);

  // Data source info
  const dataSource = useMemo(() => {
    return visualData?.dataSource || 'AI Analysis';
  }, [visualData]);

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
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      );
    }

    const commonProps = { data: chartData, width: '100%', height: 280 };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <defs>
                {colors.map((color, idx) => (
                  <linearGradient key={idx} id={`sidebarArea${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Area key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} fill={`url(#sidebarArea${idx})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
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
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
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
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              {dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const handleExport = () => {
    if (!chartData?.length) return;
    const csv = [
      Object.keys(chartData[0]).join(','),
      ...chartData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visualization-${Date.now()}.csv`;
    a.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[70] md:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 right-0 h-full z-[75]",
              "w-full md:w-[420px] lg:w-[480px]",
              "bg-background/95 backdrop-blur-xl",
              "border-l border-border/40",
              "shadow-2xl shadow-background/50",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-lg font-semibold text-foreground truncate">
                    {title || visualData?.title || 'Data Visualization'}
                  </h2>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">{description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Data Source Badge */}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  {dataSource}
                </Badge>
                {chartData.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {chartData.length} data points
                  </Badge>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Metric Cards */}
                {metricCards.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {metricCards.slice(0, 4).map((metric: any, idx: number) => (
                        <Card key={idx} className="p-4 bg-card border-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{metric.label}</span>
                            {metric.trend && (
                              <TrendingUp className={cn(
                                "w-3 h-3",
                                metric.trend === 'up' ? 'text-success' : 'text-destructive rotate-180'
                              )} />
                            )}
                          </div>
                          <p className="text-xl font-bold text-foreground mt-1">
                            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Chart Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={activeView === 'chart' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveView('chart')}
                        className="h-8"
                      >
                        <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                        Chart
                      </Button>
                      <Button
                        variant={activeView === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveView('table')}
                        className="h-8"
                      >
                        <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                        Table
                      </Button>
                    </div>
                    
                    {activeView === 'chart' && (
                      <ChartTypeSwitcher 
                        value={chartType} 
                        onChange={setChartType} 
                      />
                    )}
                  </div>

                  <Card className="p-4 bg-card border-border/50 overflow-hidden">
                    <AnimatePresence mode="wait">
                      {activeView === 'chart' ? (
                        <motion.div
                          key="chart"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderChart()}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="table"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
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
                  </Card>
                </motion.div>

                {/* AI Insights */}
                {insights.length > 0 && (
                  <Collapsible open={isInsightsExpanded} onOpenChange={setIsInsightsExpanded}>
                    <CollapsibleTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-warning" />
                          <h3 className="text-sm font-medium text-muted-foreground">AI Insights</h3>
                          <Badge variant="outline" className="text-xs">{insights.length}</Badge>
                        </div>
                        {isInsightsExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        )}
                      </motion.div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 space-y-2">
                        {insights.map((insight: any, idx: number) => (
                          <Card key={idx} className="p-3 bg-warning/5 border-warning/20">
                            <p className="text-sm text-foreground">
                              {insight.content || insight.description || insight}
                            </p>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Deep Dive Prompts */}
                {deepDivePrompts.length > 0 && onSendMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Explore Further
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {deepDivePrompts.slice(0, 4).map((prompt: string, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSendMessage(prompt);
                            onClose();
                          }}
                          className="text-xs h-8 hover:bg-primary/10 hover:border-primary/30"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-border/30 bg-background/50">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
