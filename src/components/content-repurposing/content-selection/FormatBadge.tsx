
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check } from 'lucide-react';

interface FormatBadgeProps {
  isActive: boolean;
  tooltipText: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  isMobile?: boolean;
  isSaved?: boolean;
}

const FormatBadge: React.FC<FormatBadgeProps> = memo(({
  isActive,
  tooltipText,
  onClick,
  children,
  isMobile = false,
  isSaved = false
}) => {
  const badgeSize = isMobile ? "w-6 h-6" : "w-8 h-8";
  
  return (
    <Tooltip delayDuration={isMobile ? 100 : 300}>
      <TooltipTrigger asChild>
        <motion.div
          className={`${badgeSize} flex items-center justify-center rounded-full relative
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
          {isSaved && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </div>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/90 border-white/10 text-xs">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
});

FormatBadge.displayName = 'FormatBadge';

export default FormatBadge;
