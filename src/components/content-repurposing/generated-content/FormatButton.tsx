
import React from 'react';
import { Button } from '@/components/ui/button';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import { motion } from 'framer-motion';

interface FormatButtonProps {
  formatId: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export const FormatButton: React.FC<FormatButtonProps> = ({ formatId, name, isActive, onClick }) => {
  const IconComponent = getFormatIconComponent(formatId);

  return (
    <Button
      size="sm"
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      className={isActive 
        ? "bg-gradient-to-r from-neon-purple to-neon-blue border-none shadow-md shadow-neon-purple/20" 
        : "border-white/10 hover:border-white/30 transition-all bg-black/20 backdrop-blur-sm text-white/80"
      }
    >
      {isActive ? (
        <motion.span 
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          <IconComponent className="h-4 w-4 mr-1" />
          {name}
        </motion.span>
      ) : (
        <span className="flex items-center">
          <IconComponent className="h-4 w-4 mr-1" />
          {name}
        </span>
      )}
    </Button>
  );
};

export default FormatButton;
