
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { CheckIcon } from 'lucide-react';
import { ContentFormat } from '@/components/content-repurposing/formats';

interface FormatOptionProps {
  format: ContentFormat;
  isSelected: boolean;
  onToggle: () => void;
  templateInfo: string;
  isSaved?: boolean; // Added prop to indicate if format is saved
}

export const FormatOption: React.FC<FormatOptionProps> = ({
  format,
  isSelected,
  onToggle,
  templateInfo,
  isSaved = false, // Default to false
}) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      } ${isSaved ? 'border-green-500/40' : ''}`} // Add green border if saved
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
          {isSaved && (
            <Badge variant="outline" className="ml-1 bg-green-500/20 text-green-400 border-green-500/40">
              Saved
            </Badge>
          )}
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
