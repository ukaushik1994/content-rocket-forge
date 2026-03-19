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
import { PremiumChartTooltip } from '@/components/ui/PremiumChartTooltip';
import {
  CHART_PALETTE, GRADIENT_PAIRS, AXIS_STYLE, GRID_STYLE,
  ANIMATION_CONFIG, ACTIVE_DOT_STYLE, DOT_STYLE, generateGradientId
} from '@/utils/chartTheme';

interface ChartProps {
  data: any[];
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number, name?: any) => string;
  className?: string;
  index?: string;
}

export const LineChart: React.FC<ChartProps> = ({
  data,
  categories,
  colors = CHART_PALETTE,
  valueFormatter = (value) => value.toString(),
  className = '',
  index = 'name'
}) => {
  const processedData = Array.isArray(data) ? data : [];
  const dataKeys = categories?.length ? categories : Object.keys(processedData[0] || {}).filter(key => key !== index);
  
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
          <defs>
            {dataKeys.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return (
                <linearGradient key={`lg-${i}`} id={generateGradientId('chart-line', i)} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={c1} />
                  <stop offset="100%" stopColor={c2} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey={index} {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} dy={8} />
          <YAxis {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} width={40}
            tickFormatter={(value) => valueFormatter(value)} />
          <Tooltip content={<PremiumChartTooltip valueFormatter={valueFormatter} />} 
            cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
          {dataKeys.map((category, i) => {
            const color = colors[i % colors.length];
            return (
              <Line key={category} type="monotone" dataKey={category}
                stroke={color} strokeWidth={2}
                dot={DOT_STYLE(color)}
                activeDot={ACTIVE_DOT_STYLE(color)}
                {...ANIMATION_CONFIG} />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  categories,
  colors = CHART_PALETTE,
  valueFormatter = (value) => value.toString(),
  className = '',
  index = 'name'
}) => {
  const processedData = Array.isArray(data) ? data : [];
  const dataKeys = categories?.length ? categories : Object.keys(processedData[0] || {}).filter(key => key !== index);
  
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
        <RechartsBarChart data={processedData} barCategoryGap="20%">
          <defs>
            {dataKeys.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return (
                <linearGradient key={`bg-${i}`} id={generateGradientId('chart-bar', i)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c1} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={c2} stopOpacity={0.08} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid {...GRID_STYLE} />
          <XAxis dataKey={index} {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} dy={8} />
          <YAxis {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} width={40}
            tickFormatter={(value) => valueFormatter(value)} />
          <Tooltip content={<PremiumChartTooltip valueFormatter={valueFormatter} />}
            cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          {dataKeys.map((category, i) => (
            <Bar key={category} dataKey={category}
              fill={`url(#${generateGradientId('chart-bar', i)})`}
              stroke={colors[i % colors.length]}
              strokeWidth={0}
              radius={[6, 6, 0, 0]}
              {...ANIMATION_CONFIG} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChartComponent: React.FC<ChartProps> = ({
  data,
  colors = CHART_PALETTE,
  className = ''
}) => {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%"
            innerRadius={50} outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            stroke="rgba(0,0,0,0.3)" strokeWidth={1}
            {...ANIMATION_CONFIG}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]}
                style={{ filter: `drop-shadow(0 0 4px ${colors[index % colors.length]}40)` }} />
            ))}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
            <tspan x="50%" dy="-6" fill="rgba(255,255,255,0.9)" fontSize="18" fontWeight="700">
              {data.reduce((s, d) => s + (d.value || 0), 0).toLocaleString()}
            </tspan>
            <tspan x="50%" dy="18" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500">
              Total
            </tspan>
          </text>
          <Tooltip content={<PremiumChartTooltip />}
            cursor={false} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
