import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystState } from '@/hooks/useAnalystEngine';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface Props {
  analystState: AnalystState;
  chartData: any[];
  dataKeys: string[];
  onSendMessage: (message: string) => void;
}

export const PerformanceTrajectorySection: React.FC<Props> = ({ analystState, chartData, dataKeys, onSendMessage }) => {
  if (!chartData.length) return null;

  const firstVal = chartData.length > 1 ? (chartData[0][dataKeys[0]] || 0) : 0;
  const lastVal = chartData.length > 1 ? (chartData[chartData.length - 1][dataKeys[0]] || 0) : 0;
  const isGrowing = lastVal > firstVal;
  const changePercent = firstVal > 0 ? Math.round(((lastVal - firstVal) / firstVal) * 100) : 0;
  const delta = lastVal - firstVal;

  const getHeadline = () => {
    if (changePercent > 20) return <>Performance is <span className="text-primary/80">accelerating</span></>;
    if (changePercent > 0) return <>Reach is expanding <span className="text-primary/80">organically</span></>;
    if (changePercent === 0) return <>Trajectory is <span className="text-primary/80">flat</span></>;
    return <>Performance is <span className="text-primary/50">contracting</span></>;
  };

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: 'none',
    borderRadius: '10px',
    fontSize: '11px',
    padding: '8px 12px',
  };

  return (
    <AnalystSectionWrapper number="02" label="Performance Trajectory" headline={getHeadline()} delay={0.1}>
      <div className="glass-card p-5">
        <div className="mb-4">
          <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1">{dataKeys[0]?.replace(/_/g, ' ').toUpperCase() || 'PERFORMANCE METRIC'}</p>
          <div className="flex items-end justify-between">
            <p className="text-lg font-bold text-foreground">
              {delta > 0 ? '+' : ''}{typeof delta === 'number' ? delta.toLocaleString() : delta} <span className="text-sm font-normal text-muted-foreground/40">Delta</span>
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 ${isGrowing ? 'text-primary/80 border-primary/15 bg-primary/5' : 'text-primary/50 border-primary/15 bg-primary/5'}`}
            >
              {changePercent > 0 ? '+' : ''}{changePercent}%
            </Badge>
          </div>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="perfGradCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="perfGradPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="perfGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} opacity={0.4} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} width={28} opacity={0.4} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.slice(0, 3).map((key, idx) => {
                const colors = ['#06b6d4', '#a855f7', '#22c55e'];
                const gradients = ['url(#perfGradCyan)', 'url(#perfGradPurple)', 'url(#perfGradGreen)'];
                return (
                  <Area key={key} type="natural" dataKey={key} stroke={colors[idx]} strokeWidth={2} fill={gradients[idx]} dot={false} />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/40 leading-relaxed">
        {isGrowing
          ? `Primary metric grew ${changePercent}% across ${chartData.length} data points — trajectory suggests sustained momentum.`
          : `Performance shifted ${Math.abs(changePercent)}% — consider reviewing strategy to reverse the trend.`
        }
      </p>
    </AnalystSectionWrapper>
  );
};
