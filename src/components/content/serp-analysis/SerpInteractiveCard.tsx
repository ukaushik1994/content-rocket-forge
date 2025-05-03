
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SerpFeedbackButton } from './SerpFeedbackButton';
import { Badge } from '@/components/ui/badge';

interface SerpInteractiveCardProps {
  title: string;
  content: string;
  type: string;
  badge?: string;
  onAdd: () => void;
  variant?: 'purple' | 'blue' | 'green' | 'amber';
}

export function SerpInteractiveCard({
  title,
  content,
  type,
  badge,
  onAdd,
  variant = 'blue'
}: SerpInteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const getGradient = () => {
    switch(variant) {
      case 'purple':
        return 'from-purple-600/30 to-purple-900/20';
      case 'blue':
        return 'from-blue-600/30 to-blue-900/20';
      case 'green':
        return 'from-green-600/30 to-green-900/20';
      case 'amber':
        return 'from-amber-600/30 to-amber-900/20';
      default:
        return 'from-blue-600/30 to-blue-900/20';
    }
  };
  
  const getBorderColor = () => {
    switch(variant) {
      case 'purple':
        return 'group-hover:border-purple-500/50';
      case 'blue':
        return 'group-hover:border-blue-500/50';
      case 'green':
        return 'group-hover:border-green-500/50';
      case 'amber':
        return 'group-hover:border-amber-500/50';
      default:
        return 'group-hover:border-blue-500/50';
    }
  };
  
  const getTextColor = () => {
    switch(variant) {
      case 'purple':
        return 'text-purple-300';
      case 'blue':
        return 'text-blue-300';
      case 'green':
        return 'text-green-300';
      case 'amber':
        return 'text-amber-300';
      default:
        return 'text-blue-300';
    }
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onAdd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer rounded-xl p-4 backdrop-blur-md bg-gradient-to-br ${getGradient()} 
        border border-white/10 ${getBorderColor()} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
    >
      {/* Particle Sparks Effect on Hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute h-1 w-1 rounded-full bg-white"
            initial={{ x: '50%', y: '100%', opacity: 0.7 }}
            animate={{ 
              x: [null, '70%', '30%', '50%'], 
              y: [null, '30%', '10%', '0%'], 
              opacity: [null, 0.8, 0.4, 0] 
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute h-1 w-1 rounded-full bg-white"
            initial={{ x: '30%', y: '100%', opacity: 0.7 }}
            animate={{ 
              x: [null, '10%', '50%', '30%'], 
              y: [null, '40%', '20%', '0%'], 
              opacity: [null, 0.8, 0.4, 0] 
            }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute h-1 w-1 rounded-full bg-white"
            initial={{ x: '70%', y: '100%', opacity: 0.7 }}
            animate={{ 
              x: [null, '90%', '60%', '70%'], 
              y: [null, '50%', '30%', '0%'], 
              opacity: [null, 0.8, 0.4, 0] 
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>
      )}
      
      {/* Card Content */}
      <div className="flex justify-between">
        <h4 className={`font-medium mb-2 ${getTextColor()}`}>{title}</h4>
        {badge && (
          <Badge variant="outline" className="bg-white/10 border-0">
            {badge}
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{content}</p>
      
      <div className="flex items-center justify-between mt-2">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge 
            variant="outline"
            className="border-0 bg-white/10 text-xs"
          >
            Click to add
          </Badge>
        </div>
        <SerpFeedbackButton 
          itemType={type}
          itemContent={content}
        />
      </div>
    </motion.div>
  );
}
