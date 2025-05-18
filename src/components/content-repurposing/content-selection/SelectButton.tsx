
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SelectButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-purple hover:text-neon-blue hover:bg-white/10 border border-white/10"
        onClick={onClick}
      >
        Select for Repurposing →
      </Button>
    </motion.div>
  );
};

export default SelectButton;
