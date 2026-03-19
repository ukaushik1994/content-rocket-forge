import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
  showGradient?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color,
  height = 28,
  width = 56,
  className,
  showGradient = true,
  trend = 'neutral'
}) => {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({ value, index }));
  }, [data]);

  const strokeColor = useMemo(() => {
    if (color) return color;
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#8b5cf6';
    }
  }, [color, trend]);

  const gradientId = useMemo(() => `sparkline-${Math.random().toString(36).substr(2, 9)}`, []);

  if (!data?.length) return null;

  const lastPoint = chartData[chartData.length - 1];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex-shrink-0 relative", className)}
      style={{ height, width }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 4, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.2}
            fill={showGradient ? `url(#${gradientId})` : 'none'}
            dot={false}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      {/* Pulsing dot at last data point */}
      <span
        className="absolute rounded-full animate-pulse"
        style={{
          width: 4,
          height: 4,
          backgroundColor: strokeColor,
          boxShadow: `0 0 6px ${strokeColor}80`,
          right: 2,
          top: `${Math.max(10, Math.min(80, 100 - ((lastPoint?.value || 0) / Math.max(...data, 1)) * 80))}%`,
        }}
      />
    </motion.div>
  );
};
