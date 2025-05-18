
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SelectButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isMobile?: boolean;
}

const SelectButton: React.FC<SelectButtonProps> = ({ onClick, isMobile = false }) => {
  return (
    <Button
      variant="outline"
      size={isMobile ? "sm" : "default"}
      onClick={onClick}
      className="w-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border-indigo-500/30 text-white"
    >
      <span>{isMobile ? "Select" : "Select for Repurposing"}</span>
      <ArrowRight className="h-4 w-4 ml-1" />
    </Button>
  );
};

export default SelectButton;
