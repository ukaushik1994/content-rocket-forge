
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
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={`w-7 h-7 flex items-center justify-center rounded-full 
            ${isActive
              ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg cursor-pointer' 
              : 'bg-gray-800/40 text-gray-500'}`}
          initial={false}
          animate={isActive ? {
            scale: [1, 1.15, 1],
            boxShadow: ['0 0 0px rgba(155, 135, 245, 0.5)', '0 0 15px rgba(155, 135, 245, 0.8)', '0 0 5px rgba(155, 135, 245, 0.5)']
          } : {}}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            repeat: isActive ? Infinity : 0,
            repeatDelay: 4
          }}
          onClick={isActive ? onClick : undefined}
        >
          {children}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default FormatBadge;
