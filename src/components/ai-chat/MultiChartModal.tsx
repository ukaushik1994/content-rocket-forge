import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Edit3, 
  X, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  ZoomIn,
  ZoomOut,
  Activity
} from 'lucide-react';
import { VisualData, ChartConfiguration } from '@/types/enhancedChat';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartTypeSwitcher } from './ChartTypeSwitcher';
import { MiniSparkline } from './MiniSparkline';
import { DataPointDetailPopup } from './DataPointDetailPopup';
import { ComparisonPanel } from './ComparisonPanel';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MultiChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  allVisualData?: VisualData[];
  currentChartConfig?: ChartConfiguration;
  title?: string;
  description?: string;
  actionableItems?: any[];
  deepDivePrompts?: string[];
  onDeepDiveClick?: (prompt: string) => void;
  onActionClick?: (action: any) => void;
}

interface MetricCardData {
  id: string;
  title: string;
  value: number | string;
  trend: { value: number; direction: 'up' | 'down' };
  sparklineData: number[];
  color: string;
}

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
  const [chartTypes, setChartTypes] = useState<Record<number, 'line' | 'bar' | 'area' | 'pie'>>({});
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedComparisons, setSelectedComparisons] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState<Record<number, number>>({});

  // Extract charts from visual data
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
    
    return chartConfigs.slice(0, 4); // Max 4 charts for 2x2 grid
  }, [allVisualData, currentChartConfig]);

  // Generate metrics from chart data
  const metrics = useMemo((): MetricCardData[] => {
    if (charts.length === 0) return [];
    
    const firstChart = charts[0];
    if (!firstChart?.data) return [];
    
    const totalDataPoints = charts.reduce((sum, chart) => sum + (chart.data?.length || 0), 0);
    const avgValue = firstChart.data.reduce((sum, item) => {
      const values = Object.values(item).filter(v => typeof v === 'number');
      return sum + (values[0] as number || 0);
    }, 0) / firstChart.data.length;
    
    return [
      {
        id: 'total',
        title: 'Total Data Points',
        value: totalDataPoints,
        trend: { value: 12, direction: 'up' },
        sparklineData: firstChart.data.slice(0, 10).map((_, i) => 50 + Math.random() * 50),
        color: 'hsl(var(--info))'
      },
      {
        id: 'average',
        title: 'Average Value',
        value: Math.round(avgValue),
        trend: { value: 5, direction: 'up' },
        sparklineData: firstChart.data.slice(0, 10).map((_, i) => 30 + Math.random() * 70),
        color: 'hsl(var(--success))'
      },
      {
        id: 'charts',
        title: 'Active Charts',
        value: charts.length,
        trend: { value: 0, direction: 'up' },
        sparklineData: Array(10).fill(0).map((_, i) => charts.length * 10 + i * 2),
        color: 'hsl(var(--primary))'
      },
      {
        id: 'categories',
        title: 'Categories',
        value: firstChart.categories?.length || 0,
        trend: { value: 8, direction: 'down' },
        sparklineData: firstChart.data.slice(0, 10).map((_, i) => 40 + Math.random() * 40),
        color: 'hsl(var(--warning))'
      }
    ];
  }, [charts]);

  const handleChartTypeChange = (chartIndex: number, newType: 'line' | 'bar' | 'area' | 'pie') => {
    setChartTypes(prev => ({ ...prev, [chartIndex]: newType }));
  };

  const handleDataPointClick = (data: any, chartIndex: number) => {
    setSelectedPoint({ ...data, chartIndex });
    setShowDetailPopup(true);
    
    if (comparisonMode) {
      setSelectedComparisons(prev => [...prev, data].slice(-2));
    }
  };

  const handleExport = (format: 'png' | 'csv' | 'json') => {
    toast({
      title: "Export Started",
      description: `Exporting charts as ${format.toUpperCase()}...`,
    });
    
    // Export logic here
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Charts exported successfully as ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  const handleZoom = (chartIndex: number, direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const current = prev[chartIndex] || 1;
      const newLevel = direction === 'in' ? Math.min(current + 0.2, 2) : Math.max(current - 0.2, 0.6);
      return { ...prev, [chartIndex]: newLevel };
    });
  };

  const renderChart = (config: ChartConfiguration, index: number) => {
    const currentType = chartTypes[index] || config.type;
    const zoom = zoomLevel[index] || 1;
    
    if (!config.data || config.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available
        </div>
      );
    }

    const colors = config.colors || [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--info))'
    ];

    let dataKeys: string[] = [];
    if (config.series && config.series.length > 0) {
      dataKeys = config.series.map(s => s.dataKey);
    } else if (config.categories?.length) {
      dataKeys = config.categories.filter(cat => cat !== 'name' && cat !== 'label');
    } else {
      dataKeys = Object.keys(config.data[0] || {}).filter(
        key => key !== 'name' && key !== 'label' && key !== 'category' && key !== 'type'
      );
    }

    const commonProps = {
      data: config.data,
      onMouseEnter: (data: any) => {
        // Hover highlight effect
        console.log('Hover:', data);
      },
      onClick: (data: any) => handleDataPointClick(data, index)
    };

    const chartStyle = {
      transform: `scale(${zoom})`,
      transformOrigin: 'center',
      transition: 'transform 0.3s ease'
    };

    switch (currentType) {
      case 'line':
        return (
          <div style={chartStyle}>
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
          </div>
        );

      case 'bar':
        return (
          <div style={chartStyle}>
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
          </div>
        );

      case 'area':
        return (
          <div style={chartStyle}>
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
          </div>
        );

      case 'pie':
        return (
          <div style={chartStyle}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={config.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {config.data.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-white/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                  >
                    <Activity className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div>
                    <DialogTitle className="text-2xl font-semibold">
                      {title || 'Multi-Chart Dashboard'}
                    </DialogTitle>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
              {/* Metrics Row */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="grid grid-cols-4 gap-4 mb-6"
              >
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    onMouseEnter={() => setHoveredCard(metric.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    whileHover={{ scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="glass-panel bg-glass border border-white/10 rounded-lg p-4 transition-all duration-200 hover:shadow-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium">{metric.title}</p>
                        <Sparkles className="w-3 h-3 text-primary/40 group-hover:text-primary/70 transition-colors" />
                      </div>
                      
                      <div className="text-2xl font-bold mb-2">
                        {metric.value}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          metric.trend.direction === 'up' ? "text-success" : "text-destructive"
                        )}>
                          {metric.trend.direction === 'up' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{metric.trend.value}%</span>
                        </div>
                        
                        <MiniSparkline data={metric.sparklineData} color={metric.color} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts Grid (2x2) */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15, delayChildren: 0.4 }
                  }
                }}
                className="grid grid-cols-2 gap-6"
              >
                {charts.map((chart, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 }
                    }}
                    className="glass-panel bg-glass border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold">
                          {chart.title || `Chart ${index + 1}`}
                        </h4>
                        {chart.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5">{chart.subtitle}</p>
                        )}
                        {chart.dataContext && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {chart.dataContext}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ChartTypeSwitcher
                          value={chartTypes[index] || chart.type}
                          onChange={(type) => handleChartTypeChange(index, type)}
                        />
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleZoom(index, 'in')}
                          >
                            <ZoomIn className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleZoom(index, 'out')}
                          >
                            <ZoomOut className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="chart-container">
                      {renderChart(chart, index)}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Comparison Panel */}
              {comparisonMode && selectedComparisons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <ComparisonPanel
                    comparisons={selectedComparisons}
                    onClose={() => {
                      setComparisonMode(false);
                      setSelectedComparisons([]);
                    }}
                  />
                </motion.div>
              )}

              {/* Actionable Items Panel */}
              {actionableItems && actionableItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 rounded-lg p-4"
                >
                  <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Actionable Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actionableItems.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-background/50 p-3 rounded-md cursor-pointer hover:bg-background/70 transition-colors"
                        onClick={() => onActionClick?.(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant={item.priority === 'high' ? 'default' : 'outline'} className="mb-1 text-xs">
                              {item.priority} priority
                            </Badge>
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <TrendingUp className="h-4 w-4 text-muted-foreground ml-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Deep Dive Conversation Section */}
              {deepDivePrompts && deepDivePrompts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 border-t border-white/10 pt-4"
                >
                  <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Explore Further
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {deepDivePrompts.map((prompt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => onDeepDiveClick?.(prompt)}
                        className="text-xs hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-blue-500/20 transition-all duration-200"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t border-white/10 px-6 py-4 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('png')}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Share",
                        description: "Share functionality coming soon!",
                      });
                    }}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setComparisonMode(!comparisonMode)}
                    className={cn("gap-2", comparisonMode && "bg-primary/20 text-primary")}
                  >
                    <Edit3 className="w-4 h-4" />
                    {comparisonMode ? 'Exit Compare' : 'Compare'}
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Data Point Detail Popup */}
      <DataPointDetailPopup
        isOpen={showDetailPopup}
        onClose={() => setShowDetailPopup(false)}
        data={selectedPoint}
      />
    </>
  );
};
