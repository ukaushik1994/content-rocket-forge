import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { ChartConfiguration } from '@/types/enhancedChat';

interface InteractiveChartProps {
  chartConfig: ChartConfiguration;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ chartConfig }) => {
  const { type, data, categories, series, colors, height = 300 } = chartConfig;

  const defaultColors = colors || [
    'hsl(var(--primary))', 
    'hsl(var(--secondary))', 
    'hsl(var(--accent))',
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))'
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
        return (
          <PieChart>
            <Pie 
              data={data} 
              dataKey={series?.[0]?.dataKey || 'value'} 
              nameKey={categories[0] || 'name'} 
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
