
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface FormatButtonProps {
  formatId: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export const FormatButton: React.FC<FormatButtonProps> = memo(({ 
  formatId, 
  name, 
  isActive, 
  onClick, 
  className 
}) => {
  const IconComponent = getFormatIconComponent(formatId);
  const format = getFormatByIdOrDefault(formatId);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={isActive ? "default" : "outline"}
            onClick={onClick}
            className={className || (isActive 
              ? "bg-gradient-to-r from-neon-purple to-neon-blue border-none shadow-[0_0_10px_rgba(155,135,245,0.4)]" 
              : "bg-transparent hover:bg-white/5 border-white/10"
            )}
          >
            <IconComponent className="h-4 w-4 mr-1" />
            <span className="max-w-[80px] truncate">{name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{format.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

FormatButton.displayName = 'FormatButton';

export default FormatButton;
