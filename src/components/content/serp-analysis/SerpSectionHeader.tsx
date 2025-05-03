
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant?: 'blue' | 'purple' | 'green' | 'amber';
  description?: string;
  count?: number;
}

export function SerpSectionHeader({
  title,
  expanded,
  onToggle,
  variant = 'blue',
  description,
  count
}: SerpSectionHeaderProps) {
  const getIconColor = () => {
    switch (variant) {
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      case 'green': return 'text-green-400';
      case 'amber': return 'text-amber-400';
      default: return 'text-blue-400';
    }
  };
  
  const getBgColor = () => {
    switch (variant) {
      case 'blue': return 'from-blue-500/10 to-blue-900/5';
      case 'purple': return 'from-purple-500/10 to-purple-900/5';
      case 'green': return 'from-green-500/10 to-green-900/5';
      case 'amber': return 'from-amber-500/10 to-amber-900/5';
      default: return 'from-blue-500/10 to-blue-900/5';
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 cursor-pointer rounded-lg border border-white/5 backdrop-blur-sm bg-gradient-to-r ${getBgColor()} hover:bg-white/5 transition-colors group`}
      onClick={onToggle}
    >
      <div className="flex-1">
        <h3 className="font-medium flex items-center gap-2">
          {title}
          {count !== undefined && (
            <span className={`text-xs ${getIconColor()} bg-white/5 px-2 py-0.5 rounded-full`}>
              {count}
            </span>
          )}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <motion.div
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center ${getIconColor()} bg-white/5 group-hover:bg-white/10`}
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </motion.div>
    </div>
  );
}
