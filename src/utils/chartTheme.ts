import React from 'react';
// Premium Chart Theme System — Unified colors, gradients, axis config, tooltip styles

export const CHART_COLORS = {
  primary: ['#8B5CF6', '#7C3AED'],
  cyan: ['#06B6D4', '#0891B2'],
  amber: ['#F59E0B', '#D97706'],
  emerald: ['#10B981', '#059669'],
  rose: ['#F43F5E', '#E11D48'],
  indigo: ['#6366F1', '#4F46E5'],
  teal: ['#14B8A6', '#0D9488'],
  orange: ['#F97316', '#EA580C'],
};

export const CHART_PALETTE = [
  '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981',
  '#F43F5E', '#6366F1', '#14B8A6', '#F97316',
];

export const GRADIENT_PAIRS: [string, string][] = [
  ['#8B5CF6', '#6366F1'],
  ['#06B6D4', '#0891B2'],
  ['#F59E0B', '#F97316'],
  ['#10B981', '#14B8A6'],
  ['#F43F5E', '#EC4899'],
  ['#6366F1', '#8B5CF6'],
  ['#14B8A6', '#06B6D4'],
  ['#F97316', '#F59E0B'],
];

// Standardized axis config for all charts
export const AXIS_STYLE = {
  stroke: 'rgba(255,255,255,0.08)',
  tick: {
    fill: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
  },
  axisLine: false,
  tickLine: false,
};

export const GRID_STYLE = {
  stroke: 'rgba(255,255,255,0.04)',
  strokeDasharray: 'none' as const,
  vertical: false,
};

// Glassmorphism tooltip content style
export const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(10, 10, 18, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '10px 14px',
  color: 'rgba(255,255,255,0.9)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
  fontSize: '12px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
  letterSpacing: '-0.01em',
};

// Animation defaults
export const ANIMATION_CONFIG = {
  animationBegin: 0,
  animationDuration: 800,
  animationEasing: 'ease-out' as const,
};

// SVG gradient definition generator
export const generateGradientId = (prefix: string, index: number) =>
  `${prefix}-gradient-${index}`;

// Active dot style for line/area charts
export const ACTIVE_DOT_STYLE = (color: string) => ({
  r: 5,
  fill: color,
  stroke: color,
  strokeWidth: 2,
  filter: `drop-shadow(0 0 6px ${color}80)`,
});

// Dot style
export const DOT_STYLE = (color: string) => ({
  r: 3,
  fill: 'rgba(10,10,18,0.9)',
  stroke: color,
  strokeWidth: 1.5,
});

import React from 'react';
