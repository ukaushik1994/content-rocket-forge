
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { SerpFeature } from './SerpFeature';

export interface SerpMetricsCardProps {
  title: string;
  metrics: {
    name: string;
    value: string | number | undefined;
    icon?: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'info';
  }[];
}

export function SerpMetricsCard({ title, metrics }: SerpMetricsCardProps) {
  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden p-4">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, index) => (
          <SerpFeature
            key={index}
            title={metric.name}
            value={metric.value}
            icon={metric.icon}
            variant={metric.variant}
            delay={index * 0.1}
          />
        ))}
      </div>
    </Card>
  );
}
