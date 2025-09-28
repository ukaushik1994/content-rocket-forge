import React from 'react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  data: any[];
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number, name?: any) => string;
  className?: string;
  index?: string; // for backward compatibility
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  categories,
  colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
  valueFormatter = (value) => value.toString(),
  className = '',
  index = 'name'
}) => {
  // Handle both old and new data formats
  const processedData = Array.isArray(data) ? data : [];
  const dataKeys = categories?.length ? categories : Object.keys(processedData[0] || {}).filter(key => key !== index);
  
  console.log('LineChart data:', { data: processedData, categories, dataKeys, index });
  
  if (!processedData.length) {
    return (
      <div className={`${className} flex items-center justify-center h-64 text-muted-foreground`}>
        No data available
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={index} 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => valueFormatter(value)}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: any, name: any) => [valueFormatter(value, name), name]}
          />
          {dataKeys.map((category, categoryIndex) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[categoryIndex % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[categoryIndex % colors.length], strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  categories,
  colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
  valueFormatter = (value) => value.toString(),
  className = '',
  index = 'name'
}) => {
  // Handle both old and new data formats
  const processedData = Array.isArray(data) ? data : [];
  const dataKeys = categories?.length ? categories : Object.keys(processedData[0] || {}).filter(key => key !== index);
  
  console.log('BarChart data:', { data: processedData, categories, dataKeys, index });
  
  if (!processedData.length) {
    return (
      <div className={`${className} flex items-center justify-center h-64 text-muted-foreground`}>
        No data available
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={index} 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => valueFormatter(value)}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: any, name: any) => [valueFormatter(value, name), name]}
          />
          {dataKeys.map((category, categoryIndex) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[categoryIndex % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChartComponent: React.FC<ChartProps> = ({
  data,
  colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={(entry) => entry.name}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};