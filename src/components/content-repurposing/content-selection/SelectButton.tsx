
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, FileEdit } from 'lucide-react';

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
    ? "Repurpose Content →" 
    : isRepurposed 
      ? "Create More Formats →" 
      : "Repurpose Content →";

  const icon = viewType === 'new' ? <FileEdit className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        className={`text-xs border hover:bg-white/10 
          ${viewType === 'repurposed' 
            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-purple hover:text-neon-blue border-neon-purple/30' 
            : 'bg-white/10 text-white border-white/20 hover:text-white'}
          ${isSelected ? 'ring-1 ring-neon-purple ring-opacity-50' : ''}`}
        onClick={onClick}
      >
        {icon}
        {buttonText}
      </Button>
    </motion.div>
  );
};

export default SelectButton;
