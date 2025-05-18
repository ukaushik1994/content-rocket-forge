
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
        variant="outline"
        size="sm"
        onClick={onClick}
        className="text-xs gap-1 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-white/10 hover:bg-gradient-to-r hover:from-neon-purple/20 hover:to-neon-blue/20 hover:border-neon-purple/30 group-hover:shadow-glow group-hover:shadow-neon-purple/20"
      >
        Select
        <motion.span
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
        >
          <ArrowRight className="h-3 w-3" />
        </motion.span>
      </Button>
    </motion.div>
  );
};

export default SelectButton;
