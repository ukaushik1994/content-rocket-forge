
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, FileEdit, ArrowRight } from 'lucide-react';

interface SelectButtonProps {
  onClick: (e: React.MouseEvent) => void;
  viewType?: 'new' | 'repurposed';
  isRepurposed?: boolean;
  isSelected?: boolean;
}

const SelectButton: React.FC<SelectButtonProps> = ({ 
  onClick,
  viewType = 'new',
  isRepurposed = false,
  isSelected = false
}) => {
  const buttonText = viewType === 'new' 
    ? "Repurpose Content" 
    : isRepurposed 
      ? "Create More Formats" 
      : "Repurpose Content";

  const icon = viewType === 'new' ? <FileEdit className="h-4 w-4" /> : <Plus className="h-4 w-4" />;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button 
        variant="ghost" 
        size="sm" 
        className={`
          text-xs border transition-all duration-300 overflow-hidden
          ${viewType === 'repurposed' 
            ? 'border-neon-purple/30 text-neon-purple hover:text-neon-blue' 
            : 'border-white/20 text-white'}
          ${isSelected ? 'bg-gradient-to-r from-neon-purple/30 to-neon-blue/20' : 'bg-black/40 hover:bg-black/60'}
        `}
        onClick={onClick}
      >
        {icon}
        {buttonText}
        <ArrowRight className="h-3 w-3 ml-0.5" />
      </Button>
      
      {isSelected && (
        <motion.div 
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-purple to-neon-blue"
          layoutId="selectedButtonIndicator"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.div>
  );
};

export default SelectButton;
