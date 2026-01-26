import React, { useState, useCallback, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList,
  ScatterChart, Scatter, ZAxis,
  RadialBarChart, RadialBar,
  ComposedChart
} from 'recharts';
import { ChartConfiguration } from '@/types/enhancedChat';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { normalizeChartConfig, isValidPieData, convertToPieFormat } from '@/utils/chartDataNormalizer';
import { Button } from '@/components/ui/button';

interface InteractiveChartProps {
  chartConfig: ChartConfiguration;
  onSendMessage?: (message: string) => void;
  originalQuery?: string;
  skipAutoRecovery?: boolean;
  title?: string;
  description?: string;
  allowTypeSwitch?: boolean;
  allowDataFilter?: boolean;
  showIntelligentSuggestions?: boolean;
  allVisualData?: any[];
  onDataUpdate?: (data: any) => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ 
  chartConfig, 
  onSendMessage,
  originalQuery,
  skipAutoRecovery = false,
  title,
  description,
  allowTypeSwitch = false,
  allowDataFilter = false,
  showIntelligentSuggestions = false,
  allVisualData,
  onDataUpdate
}) => {
  const [chartType, setChartType] = useState<string | null>(null);
  
  // Normalize the chart configuration to handle various AI output formats
  const normalizedConfig = useMemo(() => {
    try {
      const normalized = normalizeChartConfig(chartConfig);
      if (normalized.wasNormalized) {
        console.log('📊 Chart data normalized:', normalized.normalizations);
      }
      return normalized;
    } catch (error) {
      console.error('Failed to normalize chart config:', error);
      return null;
    }
  }, [chartConfig]);

  // Use normalized config or original
  const effectiveConfig = normalizedConfig || chartConfig;
  const { type: originalType, data, categories, series, colors, height = 300 } = effectiveConfig;
  const type = chartType || originalType;

  // Validate data before rendering - show loading state instead of error
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ InteractiveChart: No valid data provided', { type, dataLength: data?.length });
    
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] border border-dashed border-muted-foreground/30 rounded-lg">
        <div className="text-center text-muted-foreground p-4">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs mt-1 opacity-70">The chart data could not be loaded</p>
          {onSendMessage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => onSendMessage('Please regenerate the chart data')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  console.log('🎯 InteractiveChart: Rendering chart', {
    type,
    dataLength: data?.length,
    hasCategories: categories?.length > 0,
    hasSeries: series?.length > 0,
    wasNormalized: normalizedConfig?.wasNormalized
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
        // Use normalized data or convert to pie format
        const nameKey = categories?.[0] || 'name';
        const valueKey = series?.[0]?.dataKey || 'value';
        
        // Check if data is valid for pie chart
        const validForPie = isValidPieData(data);
        
        if (!validForPie) {
          // Auto-convert to pie format
          const pieData = convertToPieFormat(data);
          console.log('🔄 Auto-converted data to pie format:', pieData);
          
          if (pieData.length === 0 || pieData.every(d => d.value === 0)) {
            // If conversion failed, show as bar chart instead
            console.warn('⚠️ Pie chart conversion failed, falling back to bar chart');
            return (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey={nameKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={valueKey} fill={defaultColors[0]} name="Value" />
              </BarChart>
            );
          }
          
          return (
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
            </PieChart>
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
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={defaultColors[index % defaultColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => value.toLocaleString()} />
            <Legend />
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

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey={categories[0] || 'name'} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
            <Tooltip />
            <Legend />
            {series?.map((s, i) => (
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                stroke={defaultColors[i % defaultColors.length]}
                fill={defaultColors[i % defaultColors.length]}
                fillOpacity={0.3}
                name={s.name}
              />
            ))}
          </RadarChart>
        );

      case 'funnel':
        const funnelData = data.map((item, index) => ({
          ...item,
          fill: defaultColors[index % defaultColors.length]
        }));
        return (
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey={series?.[0]?.dataKey || 'value'}
              data={funnelData}
              isAnimationActive
            >
              <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey={categories[0] || 'name'} />
            </Funnel>
          </FunnelChart>
        );

      case 'scatter':
        const xKey = series?.[0]?.dataKey || 'x';
        const yKey = series?.[1]?.dataKey || 'y';
        const zKey = series?.[2]?.dataKey;
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis type="number" dataKey={xKey} name={series?.[0]?.name || 'X'} />
            <YAxis type="number" dataKey={yKey} name={series?.[1]?.name || 'Y'} />
            {zKey && <ZAxis type="number" dataKey={zKey} range={[60, 400]} name={series?.[2]?.name || 'Size'} />}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter 
              name={effectiveConfig.title || 'Data Points'} 
              data={data} 
              fill={defaultColors[0]}
            />
          </ScatterChart>
        );

      case 'radial':
        const radialData = data.map((item, index) => ({
          ...item,
          fill: defaultColors[index % defaultColors.length]
        }));
        return (
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="10%" 
            outerRadius="80%" 
            barSize={20} 
            data={radialData}
          >
            <RadialBar
              background
              dataKey={series?.[0]?.dataKey || 'value'}
              cornerRadius={10}
            />
            <Legend 
              iconSize={10} 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
            />
            <Tooltip />
          </RadialBarChart>
        );

      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={categories[0] || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {series?.map((s, i) => {
              // Alternate between bar and line for composed charts
              if (i % 2 === 0) {
                return (
                  <Bar 
                    key={s.dataKey} 
                    dataKey={s.dataKey} 
                    fill={defaultColors[i % defaultColors.length]} 
                    name={s.name} 
                  />
                );
              } else {
                return (
                  <Line 
                    key={s.dataKey} 
                    type="monotone" 
                    dataKey={s.dataKey} 
                    stroke={defaultColors[i % defaultColors.length]} 
                    name={s.name}
                    strokeWidth={2}
                  />
                );
              }
            })}
          </ComposedChart>
        );

      default:
        console.warn(`⚠️ Unsupported chart type: ${type}, falling back to bar chart`);
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
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};
