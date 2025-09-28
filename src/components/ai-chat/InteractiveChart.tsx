import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChartConfiguration } from '@/types/enhancedChat';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from './DataTable';
import { cn } from '@/lib/utils';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, TrendingUp, Download, Filter, Maximize2, Table as TableIcon } from 'lucide-react';

interface InteractiveChartProps {
  chartConfig: ChartConfiguration;
  title?: string;
  description?: string;
  allowTypeSwitch?: boolean;
  allowDataFilter?: boolean;
  onDataUpdate?: (data: any[]) => void;
  onExport?: () => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  chartConfig,
  title,
  description,
  allowTypeSwitch = false,
  allowDataFilter = false,
  onDataUpdate,
  onExport
}) => {
  console.log('🎯 InteractiveChart: Component mounted with config:', {
    type: chartConfig.type,
    dataLength: chartConfig.data?.length,
    categories: chartConfig.categories,
    series: chartConfig.series,
    fullConfig: chartConfig
  });

  const [currentType, setCurrentType] = useState(chartConfig.type);
  const [filteredData, setFilteredData] = useState(chartConfig.data);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: LineIcon },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieIcon }
  ];

  // Extract colors from series or use defaults
  const colors = (() => {
    if (chartConfig.series && chartConfig.series.length > 0) {
      return chartConfig.series.map(s => (s as any).color || 'hsl(var(--primary))');
    }
    return chartConfig.colors || [
      '#06b6d4', // cyan
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // orange
      '#8b5cf6', // purple
      '#06b6d4'  // blue
    ];
  })();

  console.log('InteractiveChart config:', {
    type: chartConfig.type,
    dataLength: chartConfig.data?.length,
    categories: chartConfig.categories,
    colors: colors
  });

  const handleDataFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredData(chartConfig.data);
    } else {
      const filtered = chartConfig.data.filter(item => 
        item.category === category || item.type === category
      );
      setFilteredData(filtered);
    }
    onDataUpdate?.(filteredData);
  }, [chartConfig.data, filteredData, onDataUpdate]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      const dataStr = JSON.stringify(filteredData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `chart-data-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [filteredData, onExport]);

  const renderChart = () => {
    console.log('🎯 InteractiveChart: renderChart called with:', {
      currentType,
      filteredDataLength: filteredData?.length,
      selectedCategory,
      filteredDataSample: filteredData?.[0]
    });

    const commonProps = {
      data: filteredData,
      width: '100%',
      height: chartConfig.height || 300
    };

    if (!filteredData || filteredData.length === 0) {
      console.log('❌ InteractiveChart: No data available');
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No data available to display
        </div>
      );
    }

    // Extract data keys for chart rendering
    let dataKeys: string[] = [];
    
    // First priority: use series from chartConfig if available
    if (chartConfig.series && chartConfig.series.length > 0) {
      dataKeys = chartConfig.series.map(s => s.dataKey);
      console.log('🎯 Using series dataKeys:', dataKeys);
    }
    // Second priority: use categories (but filter out name/label)
    else if (chartConfig.categories?.length) {
      dataKeys = chartConfig.categories.filter(cat => cat !== 'name' && cat !== 'label');
      console.log('🎯 Using filtered categories:', dataKeys);
    }
    // Last resort: extract from data object keys
    else {
      dataKeys = Object.keys(filteredData[0] || {}).filter(key => 
        key !== 'name' && key !== 'label' && key !== 'category' && key !== 'type'
      );
      console.log('🎯 Using extracted keys from data:', dataKeys);
    }

    console.log('🎯 InteractiveChart: Rendering chart details:', {
      type: currentType,
      dataKeys,
      filteredDataSample: filteredData[0],
      dataKeysLength: dataKeys.length
    });

    switch (currentType) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              {dataKeys.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={filteredData}>
              <defs>
                {colors.map((color, index) => (
                  <linearGradient key={index} id={`colorArea${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
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
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              {dataKeys.map((category, index) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={colors[index % colors.length]}
                  fillOpacity={1}
                  fill={`url(#colorArea${index})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              {dataKeys.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const availableCategories = [...new Set(chartConfig.data.map(item => item.category || item.type).filter(Boolean))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group",
        isFullscreen && "fixed inset-0 z-50 bg-background p-6"
      )}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
      
      <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-6 group-hover:shadow-neon transition-all duration-300">
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            
            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'chart' | 'table')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Chart
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4" />
                  Table
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2">
            {allowDataFilter && availableCategories.length > 0 && (
              <Select value={selectedCategory} onValueChange={handleDataFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {allowTypeSwitch && (
              <Select value={currentType} onValueChange={(value) => setCurrentType(value as 'line' | 'bar' | 'pie' | 'area')}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content area - Chart or Table */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px]"
        >
          {viewMode === 'chart' ? (
            renderChart()
          ) : (
            <DataTable
              data={filteredData}
              allowEdit={false}
              allowFilter={true}
              allowSort={true}
              onExport={(format) => {
                console.log(`Exporting data as ${format}`);
              }}
            />
          )}
        </motion.div>

        {/* Chart statistics */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Data points: {filteredData.length}</span>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {selectedCategory === 'all' ? 'All Data' : selectedCategory}
              </Badge>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                {chartTypes.find(t => t.value === currentType)?.label}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};