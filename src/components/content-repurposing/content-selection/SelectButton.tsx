
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SelectButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({ onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full"
    >
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-white/10 hover:bg-white/10 hover:border-neon-purple/50 transition-all duration-300"
        onClick={onClick}
      >
        Select for Repurposing
      </Button>
    </motion.div>
  );
};

export default SelectButton;
