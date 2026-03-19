import React from 'react';
import { TOOLTIP_STYLE, CHART_PALETTE } from '@/utils/chartTheme';

interface PremiumTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueFormatter?: (value: number) => string;
}

export const PremiumChartTooltip: React.FC<PremiumTooltipProps> = ({
  active,
  payload,
  label,
  valueFormatter,
}) => {
  if (!active || !payload?.length) return null;

  const formatValue = (val: number) => {
    if (valueFormatter) return valueFormatter(val);
    if (typeof val !== 'number') return String(val);
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  return (
    <div style={TOOLTIP_STYLE}>
      {label && (
        <p style={{
          margin: '0 0 6px 0',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '2px 0',
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: entry.color || CHART_PALETTE[i % CHART_PALETTE.length],
            flexShrink: 0,
            boxShadow: `0 0 6px ${(entry.color || CHART_PALETTE[i % CHART_PALETTE.length])}60`,
          }} />
          <span style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
            flex: 1,
          }}>
            {entry.name}
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '12px',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
          }}>
            {formatValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};
