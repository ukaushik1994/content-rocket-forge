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
  colors = ['#8b5cf6', '#06b6d4', '#10b981'],
  valueFormatter = (value) => value.toString(),
  className = '',
  index = 'name'
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey={index} 
            stroke="rgba(255,255,255,0.6)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.6)"
            fontSize={12}
            tickFormatter={(value) => valueFormatter(value)}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: any, name: any) => [valueFormatter(value, name), name]}
          />
          {categories.map((category, categoryIndex) => (
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
  colors = ['#8b5cf6', '#06b6d4', '#10b981'],
  valueFormatter = (value) => value.toString(),
  className = '',
  index = 'name'
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey={index} 
            stroke="rgba(255,255,255,0.6)"
            fontSize={12}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.6)"
            fontSize={12}
            tickFormatter={(value) => valueFormatter(value)}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: any, name: any) => [valueFormatter(value, name), name]}
          />
          {categories.map((category, categoryIndex) => (
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