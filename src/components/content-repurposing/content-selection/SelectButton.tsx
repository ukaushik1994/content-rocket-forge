
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SelectButtonProps {
  onSelect: (e: React.MouseEvent) => void;
  isMobile?: boolean;
}

const SelectButton: React.FC<SelectButtonProps> = memo(({ onSelect, isMobile = false }) => {
  return (
    <Button
      variant="outline"
      size={isMobile ? "sm" : "default"}
      onClick={onSelect}
      className="w-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border-indigo-500/30 text-white"
    >
      <span>{isMobile ? "Select" : "Select for Repurposing"}</span>
      <ArrowRight className="h-4 w-4 ml-1" />
    </Button>
  );
});

SelectButton.displayName = 'SelectButton';

export default SelectButton;
