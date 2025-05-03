
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  gradient?: string;
  progressValue?: number;
}

export function SerpMetricsCard({ 
  title, 
  value, 
  icon = <TrendingUp />, 
  gradient = "from-purple-400 to-purple-600", 
  progressValue 
}: MetricsCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 border border-white/10 rounded-md p-4 backdrop-blur-md"
    >
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="flex justify-between items-center">
        <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
          {value}
        </div>
        <div className="flex items-center">
          {progressValue !== undefined && (
            <div className="w-16 mr-2">
              <div className="relative w-full h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>
          )}
          <div className={`text-${gradient.split('-')[1]}-400`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
