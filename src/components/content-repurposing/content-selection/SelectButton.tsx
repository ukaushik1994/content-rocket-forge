
import React from 'react';
import { Button } from '@/components/ui/button';

interface SelectButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const SelectButton: React.FC<SelectButtonProps> = ({ onClick }) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-xs text-neon-purple hover:text-neon-blue hover:bg-white/5"
      onClick={onClick}
    >
      Select for Repurposing →
    </Button>
  );
};

export default SelectButton;
