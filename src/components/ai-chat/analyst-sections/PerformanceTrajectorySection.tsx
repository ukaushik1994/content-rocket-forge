import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
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

  const getHeadline = () => {
    if (changePercent > 20) return <>Performance is <span className="text-emerald-400">accelerating</span></>;
    if (changePercent > 0) return <>Reach is expanding <span className="text-blue-400">organically</span></>;
    if (changePercent === 0) return <>Trajectory is <span className="text-amber-400">flat</span></>;
    return <>Performance is <span className="text-red-400">contracting</span></>;
  };

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: 'none',
    borderRadius: '10px',
    fontSize: '11px',
    padding: '8px 12px',
  };

  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'];

  return (
    <AnalystSectionWrapper number="02" label="Performance Trajectory" headline={getHeadline()} delay={0.1}>
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[9px] text-muted-foreground/60">
            {chartData.length} data points
          </Badge>
          <Badge
            variant="outline"
            className={`text-[9px] ${isGrowing ? 'text-emerald-400 border-emerald-400/20' : 'text-red-400 border-red-400/20'}`}
          >
            {changePercent > 0 ? '+' : ''}{changePercent}%
          </Badge>
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <defs>
                {colors.map((color, idx) => (
                  <linearGradient key={idx} id={`perfGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} width={28} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              {dataKeys.slice(0, 3).map((key, idx) => (
                <Area key={key} type="natural" dataKey={key} stroke={colors[idx]} strokeWidth={2} fill={`url(#perfGrad${idx})`} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
        {isGrowing
          ? `Your primary metric has grown ${changePercent}% across ${chartData.length} data points — the trajectory suggests sustained momentum.`
          : `Performance has shifted ${Math.abs(changePercent)}% — consider reviewing your strategy to reverse the trend.`
        }
      </p>
    </AnalystSectionWrapper>
  );
};
