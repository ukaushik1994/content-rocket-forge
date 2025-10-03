import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
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
  Edit
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

export const MultiChartModal: React.FC<MultiChartModalProps> = ({
  isOpen,
  onClose,
  allVisualData = [],
  currentChartConfig,
  title,
  description,
  actionableItems = [],
  deepDivePrompts = [],
  onDeepDiveClick,
  onActionClick
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('0');
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

  // Set default active tab to the chart shown inline
  React.useEffect(() => {
    if (currentChartConfig && charts.length > 1) {
      const index = charts.findIndex(c => c.type === currentChartConfig.type);
      if (index >= 0) {
        setActiveTab(index.toString());
      }
    }
  }, [currentChartConfig, charts]);

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
        // Phase 5: Click-to-drill-down
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

  // Generate contextual prompts based on chart data
  const generateContextualPrompts = (config: ChartConfiguration): string[] => {
    const prompts: string[] = [];
    
    if (config.type === 'pie') {
      const data = normalizePieChartData(config.data);
      const maxItem = data.reduce((max, item) => item.value > max.value ? item : max, data[0]);
      if (maxItem) {
        prompts.push(`Why is ${maxItem.name} the largest segment?`);
        prompts.push(`How can I improve other segments?`);
      }
    }
    
    if (config.type === 'line' || config.type === 'area') {
      prompts.push(`What caused the trends in this data?`);
      prompts.push(`How can I optimize growth?`);
    }
    
    if (config.type === 'bar') {
      prompts.push(`Which items need the most attention?`);
      prompts.push(`What are the top performers?`);
    }
    
    prompts.push(`Show me detailed analysis of this data`);
    
    return prompts;
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
                  <h2 className="text-2xl font-semibold">{title || 'Data Visualization'}</h2>
                  {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Phase 2: Tabbed Interface with Icon-Only Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full mb-6">
                {charts.map((chart, index) => {
                  const Icon = CHART_TYPE_ICONS[chart.type] || Activity;
                  const isActive = activeTab === index.toString();
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
                    {/* Chart Card */}
                    <div className="glass-panel bg-glass border border-white/10 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold">{chart.title || `Chart ${index + 1}`}</h4>
                          {chart.subtitle && <p className="text-sm text-muted-foreground">{chart.subtitle}</p>}
                        </div>
                        
                        {/* Phase 7: Chart Type Switcher & Filters */}
                        <div className="flex items-center gap-2">
                          {/* Chart Type Switcher */}
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

                          {/* Data Filter */}
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

                    {/* Phase 3: Enhanced Actionable Insights (only show for first chart) */}
                    {index === 0 && actionableItems.length > 0 && (
                      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4">
                        <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Actionable Insights
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {actionableItems.map((item) => {
                            const IconComponent = ICON_MAP[item.icon || 'Target'] || Target;
                            
                            return (
                              <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                className="bg-background/50 p-4 rounded-md cursor-pointer hover:bg-background/70 transition-all border border-white/5"
                                onClick={() => {
                                  onActionClick?.(item);
                                  if (item.actionType === 'navigate' || item.actionType === 'workflow') {
                                    onClose();
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <IconComponent className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-semibold text-sm">{item.title}</h4>
                                      <Badge 
                                        variant={item.priority === 'high' ? 'default' : 'outline'} 
                                        className="text-xs"
                                      >
                                        {item.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                  </div>
                                </div>
                                
                                {(item.estimatedImpact || item.timeRequired) && (
                                  <div className="space-y-1 mb-2">
                                    {item.estimatedImpact && (
                                      <div className="flex items-center gap-2 text-xs">
                                        <TrendingUp className="w-3 h-3 text-success" />
                                        <span className="text-success font-medium">{item.estimatedImpact}</span>
                                      </div>
                                    )}
                                    {item.timeRequired && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{item.timeRequired}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <Button size="sm" className="w-full" variant="outline">
                                  {item.actionType === 'navigate' ? 'Go There' :
                                   item.actionType === 'workflow' ? 'Start' :
                                   item.actionType === 'external' ? 'Open Link' : 'Learn More'}
                                  <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Phase 4: Contextual Explore Prompts */}
                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Explore Further
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(deepDivePrompts.length > 0 ? deepDivePrompts : generateContextualPrompts(chart)).map((prompt, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                              onDeepDiveClick?.(prompt);
                              onClose();
                            }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 border border-white/10 hover:border-primary/30 transition-all text-left"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm">{prompt}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
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
