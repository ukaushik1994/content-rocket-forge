import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Share2, 
  X, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Table as TableIcon,
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
  Clock,
  Filter,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { VisualData, ChartConfiguration, ActionableItem } from '@/types/enhancedChat';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MultiChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVisualData?: VisualData[];
  currentChartConfig?: ChartConfiguration;
  title?: string;
  description?: string;
  actionableItems?: ActionableItem[];
  deepDivePrompts?: string[];
  insights?: string[];
  context?: any;
  onDeepDiveClick?: (prompt: string) => void;
  onActionClick?: (action: any) => void;
}

// Icon mapping for dynamic icon loading
const ICON_MAP: Record<string, any> = {
  TrendingUp, TrendingDown, ArrowRight, ExternalLink, Zap, Target, Sparkles, Activity, Clock,
  PieIcon, BarChart3, LineIcon, TableIcon
};

// Chart type to icon mapping
const CHART_TYPE_ICONS: Record<string, any> = {
  'pie': PieIcon,
  'bar': BarChart3,
  'line': LineIcon,
  'area': Activity,
  'table': TableIcon
};

// Key Metrics Panel Component
const KeyMetricsPanel: React.FC<{ context: any }> = ({ context }) => {
  const analytics = context?.analytics || {};
  
  const metrics = [
    {
      label: 'Total Content',
      value: analytics.totalContent || 0,
      icon: TableIcon,
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Avg SEO Score',
      value: analytics.avgSeoScore || 0,
      icon: TrendingUp,
      suffix: '/100'
    },
    {
      label: 'Needs Attention',
      value: analytics.lowPerformers || 0,
      icon: AlertTriangle,
      color: 'warning'
    },
    {
      label: 'Top Performer',
      value: analytics.topContent?.title || 'N/A',
      icon: Target,
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="p-4 glass-panel bg-glass border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <metric.icon className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">{metric.label}</span>
          </div>
          <div className="text-2xl font-bold">
            {metric.isText ? metric.value : `${metric.value}${metric.suffix || ''}`}
          </div>
          {metric.trend && (
            <div className={`text-xs mt-1 ${metric.trendUp ? 'text-success' : 'text-destructive'}`}>
              {metric.trend}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

// AI Insights Panel Component
const AIInsightsPanel: React.FC<{ insights: string[]; onDeepDiveClick?: (insight: string) => void }> = ({ insights, onDeepDiveClick }) => {
  if (!insights || insights.length === 0) return null;
  
  return (
    <Card className="p-4 glass-panel bg-glass border border-white/10 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Insights</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-2 rounded hover:bg-white/5"
            onClick={() => onDeepDiveClick?.(insight)}
          >
            <span className="text-primary mt-0.5">•</span>
            <span>{insight}</span>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
};

// Action Buttons Panel Component
const ActionButtonsPanel: React.FC<{
  actionableItems: ActionableItem[];
  deepDivePrompts: string[];
  onActionClick?: (action: any) => void;
  onClose: () => void;
}> = ({ actionableItems, deepDivePrompts, onActionClick, onClose }) => {
  const navigate = useNavigate();

  const handleAction = (action: ActionableItem) => {
    onClose(); // Close modal
    
    if (action.action?.includes('navigate') && action.targetUrl) {
      navigate(action.targetUrl);
    } else if (action.action === 'send_message') {
      onActionClick?.(action);
    }
  };

  return (
    <div className="space-y-4">
      {actionableItems && actionableItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            {actionableItems.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleAction(action)}
              >
                <ArrowRight className="w-4 h-4" />
                {action.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {deepDivePrompts && deepDivePrompts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Deep Dive Questions</h4>
          <div className="space-y-2">
            {deepDivePrompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => {
                  onActionClick?.({ action: 'send_message', data: { message: prompt } });
                  onClose();
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const MultiChartModal: React.FC<MultiChartModalProps> = ({
  isOpen,
  onClose,
  allVisualData = [],
  currentChartConfig,
  title,
  description,
  actionableItems = [],
  deepDivePrompts = [],
  insights = [],
  context = {},
  onDeepDiveClick,
  onActionClick
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeChartTab, setActiveChartTab] = useState<string>('0');
  const [selectedChartType, setSelectedChartType] = useState<Record<number, string>>({});
  const [selectedFilter, setSelectedFilter] = useState<Record<number, string>>({});

  // Extract all charts
  const charts = useMemo(() => {
    const chartConfigs: ChartConfiguration[] = [];
    
    if (currentChartConfig) {
      chartConfigs.push(currentChartConfig);
    }
    
    allVisualData.forEach(vd => {
      if (vd.chartConfig) {
        chartConfigs.push(vd.chartConfig);
      }
    });
    
    // Deduplicate by type
    const seen = new Set();
    return chartConfigs.filter(config => {
      if (seen.has(config.type)) return false;
      seen.add(config.type);
      return true;
    }).slice(0, 4);
  }, [allVisualData, currentChartConfig]);

  // Normalize pie chart data
  const normalizePieChartData = (data: any[]): any[] => {
    if (!data || data.length === 0) return [];
    if (data[0].name && data[0].value !== undefined) return data;
    
    const stringKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'string');
    const numberKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    
    const namePriority = ['name', 'label', 'solution', 'category', 'title', 'key'];
    const valuePriority = ['value', 'impressions', 'clicks', 'count', 'total', 'amount'];
    
    const nameKey = namePriority.find(key => stringKeys.includes(key)) || stringKeys[0] || 'name';
    const valueKey = valuePriority.find(key => numberKeys.includes(key)) || numberKeys[0] || 'value';
    
    return data.map(item => ({
      name: item[nameKey] || item.name || 'Unknown',
      value: Number(item[valueKey] || item.value || 0)
    }));
  };

  // Render individual chart
  const renderChart = (config: ChartConfiguration, index: number) => {
    const currentType = selectedChartType[index] || config.type;
    let data = config.data;
    
    // Apply filter if selected
    const filter = selectedFilter[index];
    if (filter && filter !== 'all') {
      data = data.filter(item => item.category === filter || item.type === filter || item.status === filter);
    }
    
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available
        </div>
      );
    }

    const colors = config.colors || [
      'hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 
      'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))'
    ];

    let dataKeys: string[] = [];
    if (config.series?.length) {
      dataKeys = config.series.map(s => s.dataKey);
    } else if (config.categories?.length) {
      dataKeys = config.categories.filter(cat => cat !== 'name' && cat !== 'label');
    } else {
      dataKeys = Object.keys(data[0] || {}).filter(
        key => key !== 'name' && key !== 'label' && key !== 'category' && key !== 'type'
      );
    }

    const commonProps = {
      data: data,
      onClick: (data: any) => {
        console.log('Chart clicked:', data);
        if (onDeepDiveClick && data.activeLabel) {
          onDeepDiveClick(`Tell me more about ${data.activeLabel}`);
          onClose();
        }
      }
    };

    switch (currentType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[idx % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[idx % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <defs>
                {colors.map((color, idx) => (
                  <linearGradient key={idx} id={`colorArea${index}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {dataKeys.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  fillOpacity={1}
                  fill={`url(#colorArea${index}-${idx})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const normalizedPieData = normalizePieChartData(data);
        if (normalizedPieData.length === 0 || normalizedPieData.every(item => item.value === 0)) {
          return (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <PieIcon className="w-12 h-12 mb-2 opacity-50" />
              <p>Unable to display pie chart</p>
            </div>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={normalizedPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(entry) => {
                  if (onDeepDiveClick) {
                    onDeepDiveClick(`Tell me more about ${entry.name}`);
                    onClose();
                  }
                }}
              >
                {normalizedPieData.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={colors[idx % colors.length]}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Get available categories for filtering
  const getAvailableCategories = (config: ChartConfiguration): string[] => {
    const categories = new Set<string>();
    config.data.forEach(item => {
      if (item.category) categories.add(item.category);
      if (item.type) categories.add(item.type);
      if (item.status) categories.add(item.status);
    });
    return Array.from(categories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-white/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{title || 'Insights Hub'}</h2>
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content with 3-Tab Structure */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview">
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="overview">
                  <Target className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="charts">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Charts ({charts.length})
                </TabsTrigger>
                <TabsTrigger value="actions">
                  <Zap className="w-4 h-4 mr-2" />
                  Actions
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <KeyMetricsPanel context={context} />
                  <AIInsightsPanel insights={insights} onDeepDiveClick={onDeepDiveClick} />
                </motion.div>
              </TabsContent>

              {/* Charts Tab */}
              <TabsContent value="charts" className="mt-0">
                {charts.length > 0 ? (
                  <Tabs value={activeChartTab} onValueChange={setActiveChartTab}>
                    <TabsList className="grid grid-cols-4 w-full mb-6">
                      {charts.map((chart, index) => {
                        const Icon = CHART_TYPE_ICONS[chart.type] || Activity;
                        const isActive = activeChartTab === index.toString();
                        return (
                          <TabsTrigger 
                            key={index} 
                            value={index.toString()}
                            className={cn(
                              "flex items-center justify-center gap-2 transition-all",
                              isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {charts.map((chart, index) => (
                      <TabsContent key={index} value={index.toString()} className="mt-0">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-6"
                        >
                          <div className="glass-panel bg-glass border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold">{chart.title || `Chart ${index + 1}`}</h4>
                                {chart.subtitle && <p className="text-sm text-muted-foreground">{chart.subtitle}</p>}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Select value={selectedChartType[index] || chart.type} onValueChange={(value) => setSelectedChartType(prev => ({ ...prev, [index]: value }))}>
                                  <SelectTrigger className="w-32">
                                    <Edit className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="line">Line</SelectItem>
                                    <SelectItem value="bar">Bar</SelectItem>
                                    <SelectItem value="area">Area</SelectItem>
                                    <SelectItem value="pie">Pie</SelectItem>
                                  </SelectContent>
                                </Select>

                                {getAvailableCategories(chart).length > 0 && (
                                  <Select value={selectedFilter[index] || 'all'} onValueChange={(value) => setSelectedFilter(prev => ({ ...prev, [index]: value }))}>
                                    <SelectTrigger className="w-32">
                                      <Filter className="w-4 h-4 mr-2" />
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                      {getAvailableCategories(chart).map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>
                            
                            {renderChart(chart, index)}
                          </div>
                        </motion.div>
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No charts available
                  </div>
                )}
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ActionButtonsPanel
                    actionableItems={actionableItems}
                    deepDivePrompts={deepDivePrompts}
                    onActionClick={onActionClick}
                    onClose={onClose}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4 bg-background/50">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  toast({ title: "Export", description: "Export functionality coming soon!" });
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  toast({ title: "Share", description: "Share functionality coming soon!" });
                }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                {charts.length} Chart{charts.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
