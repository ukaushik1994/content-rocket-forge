import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, Area, AreaChart, ResponsiveContainer } from 'recharts';
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
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#8b5cf6';
    }
  }, [color, trend]);

  const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  if (!data?.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex-shrink-0", className)}
      style={{ height, width }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={showGradient ? `url(#${gradientId})` : 'none'}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
