
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Award } from 'lucide-react';

export interface SerpFeatureProps {
  title: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  delay?: number;
}

export function SerpFeature({ 
  title, 
  value, 
  icon, 
  variant = 'default',
  delay = 0 
}: SerpFeatureProps) {
  const getBgColor = () => {
    switch(variant) {
      case 'success': return 'from-green-500/20 to-green-500/5';
      case 'warning': return 'from-amber-500/20 to-amber-500/5';
      case 'info': return 'from-blue-500/20 to-blue-500/5';
      default: return 'from-purple-500/20 to-purple-500/5';
    }
  };
  
  const getTextColor = () => {
    switch(variant) {
      case 'success': return 'from-green-300 to-green-500';
      case 'warning': return 'from-amber-300 to-amber-500';
      case 'info': return 'from-blue-300 to-blue-500';
      default: return 'from-purple-300 to-purple-500';
    }
  };
  
  const getIcon = () => {
    if (icon) return icon;
    
    switch(variant) {
      case 'success': return <Award className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'info': return <TrendingUp className="h-4 w-4 text-blue-400" />;
      default: return <TrendingUp className="h-4 w-4 text-purple-400" />;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-gradient-to-br ${getBgColor()} border border-white/10 rounded-lg p-3 backdrop-blur-md`}
    >
      <div className="flex items-center gap-2 mb-1">
        {getIcon()}
        <h4 className="text-xs text-muted-foreground">{title}</h4>
      </div>
      <div className={`text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r ${getTextColor()}`}>
        {value !== undefined ? value : 'N/A'}
      </div>
    </motion.div>
  );
}
