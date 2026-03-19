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
import { BarChart3, RefreshCw } from 'lucide-react';
import { normalizeChartConfig, isValidPieData, convertToPieFormat } from '@/utils/chartDataNormalizer';
import { Button } from '@/components/ui/button';
import { PremiumChartTooltip } from '@/components/ui/PremiumChartTooltip';
import {
  CHART_PALETTE, GRADIENT_PAIRS, AXIS_STYLE, GRID_STYLE,
  ANIMATION_CONFIG, ACTIVE_DOT_STYLE, DOT_STYLE, generateGradientId
} from '@/utils/chartTheme';

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

// Reusable SVG gradient definitions
const GradientDefs: React.FC<{ id: string; color1: string; color2: string; vertical?: boolean }> = 
  ({ id, color1, color2, vertical = true }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? "0" : "1"} y2={vertical ? "1" : "0"}>
      <stop offset="0%" stopColor={color1} stopOpacity={0.4} />
      <stop offset="100%" stopColor={color2} stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={color1} stopOpacity={1} />
      <stop offset="100%" stopColor={color2} stopOpacity={1} />
    </linearGradient>
  </defs>
);

// Glow filter for active elements
const GlowFilter: React.FC<{ id: string; color: string }> = ({ id, color }) => (
  <defs>
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      <feColorMatrix values={`0 0 0 0 ${parseInt(color.slice(1,3),16)/255} 0 0 0 0 ${parseInt(color.slice(3,5),16)/255} 0 0 0 0 ${parseInt(color.slice(5,7),16)/255} 0 0 0 0.6 0`} />
    </filter>
  </defs>
);

// Premium axis props
const xAxisProps = (dataKey: string) => ({
  dataKey,
  ...AXIS_STYLE,
  tick: { ...AXIS_STYLE.tick },
  dy: 8,
});

const yAxisProps = () => ({
  ...AXIS_STYLE,
  tick: { ...AXIS_STYLE.tick },
  dx: -4,
  width: 40,
});

// Center label for donut charts
const DonutCenterLabel: React.FC<{ data: any[]; valueKey: string }> = ({ data, valueKey }) => {
  const total = data.reduce((sum, d) => sum + (Number(d[valueKey]) || 0), 0);
  const formatted = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toLocaleString();
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
      <tspan x="50%" dy="-6" fill="rgba(255,255,255,0.9)" fontSize="20" fontWeight="700" 
        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' } as any}>
        {formatted}
      </tspan>
      <tspan x="50%" dy="18" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500"
        style={{ letterSpacing: '0.04em', textTransform: 'uppercase' } as any}>
        Total
      </tspan>
    </text>
  );
};

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
  
  const normalizedConfig = useMemo(() => {
    try {
      const normalized = normalizeChartConfig(chartConfig);
      return normalized;
    } catch (error) {
      console.error('Failed to normalize chart config:', error);
      return null;
    }
  }, [chartConfig]);

  const effectiveConfig = normalizedConfig || chartConfig;
  const { type: originalType, data, categories, series, colors, height = 300, valueFormatter } = effectiveConfig as ChartConfiguration;
  const type = chartType || originalType;

  const palette = colors || CHART_PALETTE;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] border border-dashed border-muted-foreground/20 rounded-2xl bg-white/[0.02]">
        <div className="text-center text-muted-foreground p-4">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs mt-1 opacity-60">The chart data could not be loaded</p>
          {onSendMessage && (
            <Button variant="ghost" size="sm" className="mt-3 text-xs"
              onClick={() => onSendMessage('Please regenerate the chart data')}>
              <RefreshCw className="w-3 h-3 mr-1" /> Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const renderPremiumTooltip = (
    <Tooltip content={<PremiumChartTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
  );

  const renderChart = () => {
    const catKey = categories?.[0] || 'name';

    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {series?.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return <GradientDefs key={`g-${i}`} id={generateGradientId('line', i)} color1={c1} color2={c2} />;
            })}
            <CartesianGrid {...GRID_STYLE} />
            <XAxis {...xAxisProps(catKey)} />
            <YAxis {...yAxisProps()} />
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            {series?.map((s, i) => {
              const color = palette[i % palette.length];
              return (
                <Line 
                  key={s.dataKey} type="monotone" dataKey={s.dataKey} 
                  stroke={color} name={s.name} strokeWidth={2}
                  dot={DOT_STYLE(color)}
                  activeDot={ACTIVE_DOT_STYLE(color)}
                  {...ANIMATION_CONFIG}
                />
              );
            })}
          </LineChart>
        );

      case 'bar':
      case 'stacked-bar':
        return (
          <BarChart data={data} barCategoryGap="20%">
            {series?.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return <GradientDefs key={`g-${i}`} id={generateGradientId('bar', i)} color1={c1} color2={c2} vertical />;
            })}
            <CartesianGrid {...GRID_STYLE} />
            <XAxis {...xAxisProps(catKey)} />
            <YAxis {...yAxisProps()} />
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            {series?.map((s, i) => (
              <Bar 
                key={s.dataKey} dataKey={s.dataKey} name={s.name}
                fill={`url(#${generateGradientId('bar', i)})`}
                stroke={palette[i % palette.length]}
                strokeWidth={0}
                radius={[6, 6, 0, 0]}
                stackId={type === 'stacked-bar' ? 'stack' : undefined}
                {...ANIMATION_CONFIG}
              />
            ))}
          </BarChart>
        );

      case 'horizontal-bar':
        return (
          <BarChart data={data} layout="vertical" barCategoryGap="20%">
            {series?.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return <GradientDefs key={`g-${i}`} id={generateGradientId('hbar', i)} color1={c1} color2={c2} vertical={false} />;
            })}
            <CartesianGrid {...GRID_STYLE} horizontal />
            <XAxis type="number" {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} />
            <YAxis type="category" dataKey={catKey} {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} width={80} />
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            {series?.map((s, i) => (
              <Bar 
                key={s.dataKey} dataKey={s.dataKey} name={s.name}
                fill={`url(#${generateGradientId('hbar', i)})`}
                stroke={palette[i % palette.length]}
                strokeWidth={0}
                radius={[0, 6, 6, 0]}
                {...ANIMATION_CONFIG}
              />
            ))}
          </BarChart>
        );

      case 'pie':
      case 'donut': {
        const nameKey = catKey;
        const valueKey = series?.[0]?.dataKey || 'value';
        const isDonut = type === 'donut';
        const validForPie = isValidPieData(data);
        const pieData = validForPie ? data : convertToPieFormat(data);
        const actualNameKey = validForPie ? nameKey : 'name';
        const actualValueKey = validForPie ? valueKey : 'value';

        if (!pieData.length || pieData.every(d => (d[actualValueKey] || 0) === 0)) {
          // fallback to bar
          return (
            <BarChart data={data}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis {...xAxisProps(nameKey)} />
              <YAxis {...yAxisProps()} />
              {renderPremiumTooltip}
              <Bar dataKey={valueKey} fill={palette[0]} radius={[6,6,0,0]} {...ANIMATION_CONFIG} />
            </BarChart>
          );
        }

        return (
          <PieChart>
            <Pie 
              data={pieData} dataKey={actualValueKey} nameKey={actualNameKey}
              cx="50%" cy="50%" 
              innerRadius={isDonut ? 55 : 0}
              outerRadius={85}
              paddingAngle={isDonut ? 3 : 1}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              label={!isDonut ? ({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
              {...ANIMATION_CONFIG}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} 
                  style={{ filter: `drop-shadow(0 0 4px ${palette[index % palette.length]}40)` }} />
              ))}
            </Pie>
            {isDonut && <DonutCenterLabel data={pieData} valueKey={actualValueKey} />}
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
          </PieChart>
        );
      }

      case 'area':
        return (
          <AreaChart data={data}>
            {series?.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return <GradientDefs key={`g-${i}`} id={generateGradientId('area', i)} color1={c1} color2={c2} />;
            })}
            <CartesianGrid {...GRID_STYLE} />
            <XAxis {...xAxisProps(catKey)} />
            <YAxis {...yAxisProps()} />
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            {series?.map((s, i) => {
              const color = palette[i % palette.length];
              return (
                <Area 
                  key={s.dataKey} type="monotone" dataKey={s.dataKey}
                  stroke={color} strokeWidth={2}
                  fill={`url(#${generateGradientId('area', i)})`}
                  name={s.name}
                  dot={false}
                  activeDot={ACTIVE_DOT_STYLE(color)}
                  {...ANIMATION_CONFIG}
                />
              );
            })}
          </AreaChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis dataKey={catKey} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} />
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            {series?.map((s, i) => {
              const color = palette[i % palette.length];
              return (
                <Radar key={s.dataKey} dataKey={s.dataKey} stroke={color}
                  fill={color} fillOpacity={0.15} name={s.name}
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  {...ANIMATION_CONFIG}
                />
              );
            })}
          </RadarChart>
        );

      case 'funnel': {
        const funnelData = data.map((item, index) => ({
          ...item,
          fill: palette[index % palette.length]
        }));
        return (
          <FunnelChart>
            {renderPremiumTooltip}
            <Funnel dataKey={series?.[0]?.dataKey || 'value'} data={funnelData}
              isAnimationActive {...ANIMATION_CONFIG}>
              <LabelList position="right" fill="rgba(255,255,255,0.7)" stroke="none" 
                dataKey={catKey} fontSize={11} />
            </Funnel>
          </FunnelChart>
        );
      }

      case 'scatter': {
        const xKey = series?.[0]?.dataKey || 'x';
        const yKey = series?.[1]?.dataKey || 'y';
        const zKey = series?.[2]?.dataKey;
        return (
          <ScatterChart>
            <GlowFilter id="scatter-glow" color={palette[0]} />
            <CartesianGrid {...GRID_STYLE} />
            <XAxis type="number" dataKey={xKey} name={series?.[0]?.name || 'X'} {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} />
            <YAxis type="number" dataKey={yKey} name={series?.[1]?.name || 'Y'} {...AXIS_STYLE} tick={{ ...AXIS_STYLE.tick }} />
            {zKey && <ZAxis type="number" dataKey={zKey} range={[60, 400]} name={series?.[2]?.name || 'Size'} />}
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            <Scatter name={effectiveConfig.title || 'Data Points'} data={data} fill={palette[0]}
              {...ANIMATION_CONFIG} />
          </ScatterChart>
        );
      }

      case 'radial': {
        const radialData = data.map((item, index) => ({
          ...item, fill: palette[index % palette.length]
        }));
        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="85%" barSize={16} data={radialData}>
            <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }}
              dataKey={series?.[0]?.dataKey || 'value'} cornerRadius={8}
              {...ANIMATION_CONFIG} />
            <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right"
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            {renderPremiumTooltip}
          </RadialBarChart>
        );
      }

      case 'composed':
        return (
          <ComposedChart data={data}>
            {series?.map((_, i) => {
              const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
              return <GradientDefs key={`g-${i}`} id={generateGradientId('comp', i)} color1={c1} color2={c2} />;
            })}
            <CartesianGrid {...GRID_STYLE} />
            <XAxis {...xAxisProps(catKey)} />
            <YAxis {...yAxisProps()} />
            {renderPremiumTooltip}
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 12 }} />
            {series?.map((s, i) => {
              const color = palette[i % palette.length];
              if (i % 2 === 0) {
                return (
                  <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name}
                    fill={`url(#${generateGradientId('comp', i)})`}
                    stroke={color} strokeWidth={0}
                    radius={[6, 6, 0, 0]} {...ANIMATION_CONFIG} />
                );
              }
              return (
                <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name}
                  stroke={color} strokeWidth={2}
                  dot={DOT_STYLE(color)} activeDot={ACTIVE_DOT_STYLE(color)}
                  {...ANIMATION_CONFIG} />
              );
            })}
          </ComposedChart>
        );

      default:
        console.warn(`⚠️ Unsupported chart type: ${type}, falling back to bar chart`);
        return (
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid {...GRID_STYLE} />
            <XAxis {...xAxisProps(catKey)} />
            <YAxis {...yAxisProps()} />
            {renderPremiumTooltip}
            {series?.map((s, i) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} fill={palette[i % palette.length]}
                name={s.name} radius={[6,6,0,0]} {...ANIMATION_CONFIG} />
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
