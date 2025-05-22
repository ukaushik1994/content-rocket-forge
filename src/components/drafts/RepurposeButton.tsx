
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface RepurposeButtonProps {
  contentId: string;
}

export const RepurposeButton: React.FC<RepurposeButtonProps> = ({ contentId }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/content-repurposing?id=${contentId}`);
  };
  
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button 
        size="sm" 
        variant="ghost"
        onClick={handleClick}
        className="text-white/70 hover:text-neon-purple relative group"
      >
        <span className="absolute -inset-px bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="h-4 w-4 mr-1 group-hover:text-neon-purple transition-colors" />
        Repurpose
      </Button>
    </motion.div>
  );
};
