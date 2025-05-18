
import React from 'react';
import { Button } from '@/components/ui/button';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';

interface FormatButtonProps {
  formatId: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
  className?: string; // Added className prop
}

export const FormatButton: React.FC<FormatButtonProps> = ({ formatId, name, isActive, onClick, className }) => {
  const IconComponent = getFormatIconComponent(formatId);

  return (
    <Button
      size="sm"
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      className={className || (isActive 
        ? "bg-gradient-to-r from-neon-purple to-neon-blue border-none" 
        : "border-white/10"
      )}
    >
      <IconComponent className="h-4 w-4 mr-1" />
      {name}
    </Button>
  );
};

export default FormatButton;
