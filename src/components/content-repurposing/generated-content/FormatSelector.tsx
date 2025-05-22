
import React, { memo } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import { Check } from 'lucide-react';

interface FormatSelectorProps {
  generatedFormats: string[];
  activeFormat: string | null;
  setActiveFormat: React.Dispatch<React.SetStateAction<string | null>>;
  savedFormats?: string[];
}

const FormatSelector: React.FC<FormatSelectorProps> = memo(({
  generatedFormats,
  activeFormat,
  setActiveFormat,
  savedFormats = []
}) => {
  if (generatedFormats.length === 0) {
    return null;
  }

  // If no active format is selected, but we have formats, select the first one
  if (!activeFormat && generatedFormats.length > 0) {
    setActiveFormat(generatedFormats[0]);
  }
  
  return (
    <Select
      value={activeFormat || ''}
      onValueChange={(value) => setActiveFormat(value)}
    >
      <SelectTrigger className="w-[180px] bg-black border-white/10 text-white">
        <SelectValue placeholder="Select a format" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-white/10 text-white">
        {generatedFormats.map((formatId) => {
          if (!formatId) return null; // Skip empty formatIds
          
          const format = getFormatByIdOrDefault(formatId);
          const IconComponent = getFormatIconComponent(formatId);
          const isSaved = savedFormats.includes(formatId);
          
          return (
            <SelectItem 
              key={formatId} 
              value={formatId}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="h-4 w-4" />
                <span>{format.name}</span>
                {isSaved && <Check className="h-3 w-3 text-green-400" />}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
});

FormatSelector.displayName = 'FormatSelector';

export default FormatSelector;
