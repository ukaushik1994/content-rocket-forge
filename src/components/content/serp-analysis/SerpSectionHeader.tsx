
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  variant?: 'default' | 'purple' | 'blue' | 'green';
}

export function SerpSectionHeader({ 
  title, 
  expanded, 
  onToggle,
  count = 0,
  variant = 'default'
}: SerpSectionHeaderProps) {
  // Get gradient based on variant
  const getGradient = () => {
    switch(variant) {
      case 'purple':
        return 'from-purple-500/20 to-purple-800/5';
      case 'blue':
        return 'from-blue-500/20 to-blue-800/5';
      case 'green':
        return 'from-green-500/20 to-green-800/5';
      default:
        return 'from-primary/20 to-primary/5';
    }
  };
  
  return (
    <motion.div 
      className={`flex items-center justify-between py-3 px-4 rounded-lg backdrop-blur-md cursor-pointer mb-4
        bg-gradient-to-br ${getGradient()} border border-white/10 hover:shadow-lg transition-all duration-300`}
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </motion.div>
        <h3 className="text-lg font-medium">{title}</h3>
        {count > 0 && (
          <Badge className="ml-2 bg-white/10 hover:bg-white/20">{count}</Badge>
        )}
      </div>
      <motion.div
        animate={{ rotateZ: expanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </motion.div>
  );
}
