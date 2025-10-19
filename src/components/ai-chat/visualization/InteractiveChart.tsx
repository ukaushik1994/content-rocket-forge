import React, { useState, useCallback, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { ChartConfiguration } from '@/types/enhancedChat';
import { AlertTriangle } from 'lucide-react';

interface InteractiveChartProps {
  chartConfig: ChartConfiguration;
  onSendMessage?: (message: string) => void;
  originalQuery?: string;
  skipAutoRecovery?: boolean;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ 
  chartConfig, 
  onSendMessage,
  originalQuery,
  skipAutoRecovery = false
}) => {
  const { type, data, categories, series, colors, height = 300 } = chartConfig;

  // Validate data before rendering - show loading state instead of error
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ InteractiveChart: No valid data provided', { type, dataLength: data?.length });
    
    // If we have onSendMessage, this will be handled by parent recovery hook
    // Just show a minimal loading state
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="text-center text-muted-foreground">
          <div className="w-8 h-8 mx-auto mb-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Fetching data...</p>
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
    switch (type) {
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};
