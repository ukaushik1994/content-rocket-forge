
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  getFormatIconComponent, 
  getFormatByIdOrDefault, 
  FormatCategory,
  getCategoryColor
} from '../formats';

interface FormatButtonProps {
  formatId: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
  category: FormatCategory;
}

export const FormatButton: React.FC<FormatButtonProps> = ({ 
  formatId, 
  name, 
  isActive, 
  onClick,
  category
}) => {
  const IconComponent = getFormatIconComponent(formatId);
  const colorGradient = getCategoryColor(category);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        size="sm"
        variant={isActive ? "default" : "outline"}
        onClick={onClick}
        className={`
          relative overflow-hidden transition-all duration-300 
          ${isActive 
            ? 'border-none text-white' 
            : 'border-white/10 bg-black/20 hover:bg-black/40'}
        `}
      >
        {isActive && (
          <motion.div
            layoutId={`activeButton-${category}`}
            className={`absolute inset-0 bg-gradient-to-r ${colorGradient} -z-10`}
            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
          />
        )}
        <IconComponent className={`h-4 w-4 mr-1.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
        {name}
      </Button>
    </motion.div>
  );
};

export default FormatButton;
