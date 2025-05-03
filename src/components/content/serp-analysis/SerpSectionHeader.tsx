
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SerpSectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  variant?: 'default' | 'purple' | 'blue' | 'green' | 'amber';
  description?: string;
}

export function SerpSectionHeader({ 
  title, 
  expanded, 
  onToggle,
  count = 0,
  variant = 'default',
  description
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
      case 'amber':
        return 'from-amber-500/20 to-amber-800/5';
      default:
        return 'from-primary/20 to-primary/5';
    }
  };
  
  const getBorderColor = () => {
    switch(variant) {
      case 'purple':
        return 'hover:border-purple-500/30';
      case 'blue':
        return 'hover:border-blue-500/30';
      case 'green':
        return 'hover:border-green-500/30';
      case 'amber':
        return 'hover:border-amber-500/30';
      default:
        return 'hover:border-primary/30';
    }
  };
  
  const iconVariants = {
    collapsed: { rotate: -90 },
    expanded: { rotate: 0 }
  };
  
  return (
    <motion.div 
      className={`relative flex flex-col py-3 px-4 rounded-lg backdrop-blur-md cursor-pointer mb-4
        bg-gradient-to-br ${getGradient()} border border-white/10 ${getBorderColor()} hover:shadow-lg transition-all duration-300
        overflow-hidden`}
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 opacity-20"></div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
      
      {/* Header Content */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            variants={iconVariants}
            animate={expanded ? 'expanded' : 'collapsed'}
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
      </div>
      
      {/* Optional Description */}
      {description && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: expanded ? 'auto' : 0, 
            opacity: expanded ? 1 : 0,
            marginTop: expanded ? 8 : 0
          }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted-foreground overflow-hidden"
        >
          {description}
        </motion.div>
      )}
    </motion.div>
  );
}
