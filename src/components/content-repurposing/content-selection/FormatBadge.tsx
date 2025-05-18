
import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface FormatBadgeProps {
  isActive: boolean;
  tooltipText: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const FormatBadge: React.FC<FormatBadgeProps> = ({
  isActive,
  tooltipText,
  onClick,
  children
}) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <motion.div
          className={`w-8 h-8 flex items-center justify-center rounded-full 
            ${isActive
              ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg cursor-pointer' 
              : 'bg-gray-800/40 text-gray-500'}`}
          whileHover={{ 
            scale: 1.1,
            boxShadow: '0 0 10px rgba(155, 135, 245, 0.6)' 
          }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
        >
          {children}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-black/90 border-white/10 text-xs">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default FormatBadge;
