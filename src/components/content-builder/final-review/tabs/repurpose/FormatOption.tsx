
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { CheckIcon } from 'lucide-react';
import { ContentFormatDefinition } from '@/components/content-repurposing/formats';

interface FormatOptionProps {
  format: ContentFormatDefinition;
  isSelected: boolean;
  onToggle: () => void;
  templateInfo: string;
}

export const FormatOption: React.FC<FormatOptionProps> = ({
  format,
  isSelected,
  onToggle,
  templateInfo,
}) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
            isSelected
              ? 'bg-primary text-primary-foreground' 
              : 'border border-muted-foreground'
          }`}>
            {isSelected && (
              <CheckIcon className="h-3 w-3" />
            )}
          </div>
          <span className="font-medium">{format.name}</span>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-xs">
              {templateInfo}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Custom prompt templates available in settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{format.description}</p>
    </div>
  );
};

export default FormatOption;
