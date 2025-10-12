import React, { useState, useCallback, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { ChartConfiguration } from '@/types/enhancedChat';
import { AlertTriangle } from 'lucide-react';
import { useChartTypeValidator } from '@/hooks/useChartTypeValidator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface InteractiveChartProps {
  chartConfig: ChartConfiguration;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ chartConfig }) => {
  const { type, data, categories, series, colors, height = 300 } = chartConfig;
  const { validateChartType } = useChartTypeValidator();
  const [currentType, setCurrentType] = useState(type);

  // Validate data before rendering
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ InteractiveChart: No valid data provided', { type, dataLength: data?.length });
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data available for this chart</p>
        </div>
      </div>
    );
  }

  console.log('🎯 InteractiveChart: Rendering chart', {
    type,
    dataLength: data?.length,
    hasCategories: categories?.length > 0,
    hasSeries: series?.length > 0
  });

  const defaultColors = colors || [
    '#8B5CF6',  // Vibrant Purple
    '#06B6D4',  // Cyan Blue
    '#F59E0B',  // Amber Orange
    '#10B981',  // Emerald Green
    '#EC4899',  // Hot Pink
    '#6366F1',  // Indigo
    '#14B8A6',  // Teal
    '#F97316',  // Bright Orange
  ];

  const renderChart = () => {
    // Chart type validation
    const validation = validateChartType({ ...chartConfig, type: currentType }, 0);
    
    // Show error if chart cannot be rendered
    if (!validation.canProceed) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <AlertTriangle className="w-12 h-12 mb-3 text-warning" />
          <p className="font-semibold text-foreground">Chart Data Issue</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">{validation.reason}</p>
          {validation.suggestedType && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCurrentType(validation.suggestedType!)}
            >
              Switch to {validation.suggestedType} chart
            </Button>
          )}
        </div>
      );
    }
    
    // Show warning in console if suboptimal
    if (!validation.isOptimal && validation.suggestedType) {
      console.warn(`⚠️ Chart type suboptimal: ${validation.reason}`);
    }
    
    switch (currentType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={categories[0] || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series?.map((s, i) => (
              <Line 
                key={s.dataKey} 
                type="monotone" 
                dataKey={s.dataKey} 
                stroke={defaultColors[i % defaultColors.length]} 
                name={s.name} 
                strokeWidth={2} 
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={categories[0] || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series?.map((s, i) => (
              <Bar 
                key={s.dataKey} 
                dataKey={s.dataKey} 
                fill={defaultColors[i % defaultColors.length]} 
                name={s.name} 
              />
            ))}
          </BarChart>
        );

      case 'pie':
        // Validate pie chart data format
        const nameKey = categories[0] || 'name';
        const valueKey = series?.[0]?.dataKey || 'value';
        
        const isValidPieData = data.every(item => 
          item.hasOwnProperty(nameKey) && 
          item.hasOwnProperty(valueKey) &&
          typeof item[valueKey] === 'number'
        );
        
        if (!isValidPieData) {
          console.error('❌ Invalid pie chart data format:', { 
            data, 
            expectedNameKey: nameKey, 
            expectedValueKey: valueKey,
            sample: data[0]
          });
          return (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive opacity-50" />
                <p className="text-sm font-medium">Data format not compatible</p>
                <p className="text-xs mt-2 max-w-[250px]">
                  Expected format: <code className="bg-muted px-1 py-0.5 rounded">[{`{ ${nameKey}: 'Category', ${valueKey}: 123 }`}]</code>
                </p>
              </div>
            </div>
          );
        }
        
        return (
          <PieChart>
            <Pie 
              data={data} 
              dataKey={valueKey} 
              nameKey={nameKey} 
              cx="50%" 
              cy="50%" 
              outerRadius={80} 
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={categories[0] || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series?.map((s, i) => (
              <Area 
                key={s.dataKey} 
                type="monotone" 
                dataKey={s.dataKey} 
                stroke={defaultColors[i % defaultColors.length]} 
                fill={defaultColors[i % defaultColors.length]} 
                fillOpacity={0.3} 
                name={s.name} 
              />
            ))}
          </AreaChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const validation = validateChartType({ ...chartConfig, type: currentType }, 0);

  return (
    <div className="relative w-full h-full">
      {!validation.isOptimal && validation.suggestedType && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="text-xs bg-background/95 backdrop-blur">
            💡 Consider {validation.suggestedType} chart
          </Badge>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
