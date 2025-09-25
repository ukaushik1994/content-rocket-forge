import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, BarChart, PieChartComponent } from '@/components/ui/chart';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineIcon, 
  PieChart, 
  Activity,
  Maximize2,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChartConfiguration } from '@/types/enhancedChat';

interface InteractiveChartProps {
  chartConfig: ChartConfiguration;
  title?: string;
  description?: string;
  allowTypeSwitch?: boolean;
  allowDataFilter?: boolean;
  onDataUpdate?: (data: any[]) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  chartConfig,
  title = "Interactive Chart",
  description,
  allowTypeSwitch = true,
  allowDataFilter = true,
  onDataUpdate
}) => {
  const [chartType, setChartType] = useState<ChartConfiguration['type']>(chartConfig.type);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dataFilter, setDataFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chartTypes = [
    { type: 'line' as const, icon: LineIcon, label: 'Line Chart' },
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie Chart' },
    { type: 'area' as const, icon: Activity, label: 'Area Chart' }
  ];

  const filteredData = useMemo(() => {
    if (dataFilter === 'all') return chartConfig.data;
    
    // Apply basic filtering logic - can be enhanced based on data structure
    return chartConfig.data.filter((item, index) => {
      if (dataFilter === 'recent') return index < 10;
      if (dataFilter === 'top') return item.value > 0; // Assuming value field exists
      return true;
    });
  }, [chartConfig.data, dataFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (onDataUpdate) {
      onDataUpdate(chartConfig.data);
    }
    setIsRefreshing(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `chart-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const chartProps = {
    data: filteredData,
    categories: chartConfig.categories,
    colors: chartConfig.colors,
    valueFormatter: chartConfig.valueFormatter,
    className: isFullscreen ? 'h-[60vh]' : 'h-[300px]'
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <LineChart {...chartProps} />;
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'pie':
        return <PieChartComponent {...chartProps} />;
      case 'area':
        return <LineChart {...chartProps} />;
      default:
        return <LineChart {...chartProps} />;
    }
  };

  const CurrentIcon = chartTypes.find(ct => ct.type === chartType)?.icon || Activity;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
      >
        <Card className="overflow-hidden glass-panel bg-glass border border-white/10 group hover:shadow-neon transition-all duration-300">
          {/* Enhanced Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                  <CurrentIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Chart Type Switcher */}
                {allowTypeSwitch && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8">
                        <CurrentIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border-white/20">
                      {chartTypes.map(({ type, icon: Icon, label }) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => setChartType(type)}
                          className="flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Data Filter */}
                {allowDataFilter && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background/95 backdrop-blur-sm border-white/20">
                      <DropdownMenuItem onClick={() => setDataFilter('all')}>
                        All Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDataFilter('recent')}>
                        Recent Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDataFilter('top')}>
                        Top Performers
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Refresh Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>

                {/* Export Button */}
                <Button variant="ghost" size="sm" onClick={handleExport} className="h-8">
                  <Download className="w-4 h-4" />
                </Button>

                {/* Fullscreen Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Data Insights */}
            <div className="flex items-center gap-4 mt-3">
              <Badge variant="secondary" className="bg-info/20 text-info border-info/30">
                {filteredData.length} data points
              </Badge>
              
              {chartConfig.data.length !== filteredData.length && (
                <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                  Filtered from {chartConfig.data.length}
                </Badge>
              )}

              {/* Trend Indicator */}
              {filteredData.length >= 2 && (
                <div className="flex items-center gap-1 text-sm">
                  {(() => {
                    const firstValue = filteredData[0]?.value || 0;
                    const lastValue = filteredData[filteredData.length - 1]?.value || 0;
                    const trend = lastValue > firstValue ? 'up' : 'down';
                    const change = Math.abs(((lastValue - firstValue) / firstValue) * 100).toFixed(1);
                    
                    return (
                      <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="text-xs">{change}%</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Chart Container */}
          <div className="p-6">
            <div className="relative bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/5">
              {renderChart()}
            </div>
          </div>
        </Card>

        {/* Fullscreen Overlay */}
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsFullscreen(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};