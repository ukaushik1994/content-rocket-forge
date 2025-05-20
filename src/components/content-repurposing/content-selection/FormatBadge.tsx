
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip';

interface FormatBadgeProps {
  isActive: boolean;
  tooltipText: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

const FormatBadge: React.FC<FormatBadgeProps> = memo(({
  isActive,
  tooltipText,
  onClick,
  children,
  isMobile = false
}) => {
  const badgeSize = isMobile ? "w-6 h-6" : "w-8 h-8";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`${badgeSize} flex items-center justify-center rounded-full 
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
        <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/90 border-white/10 text-xs">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

FormatBadge.displayName = 'FormatBadge';

export default FormatBadge;
