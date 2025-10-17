
import React from 'react';
import { Button } from '@/components/ui/button';
import { contentFormats, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';

interface FormatSelectorProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  onSelectFormat: (formatId: string) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  generatedContents,
  activeFormat,
  onSelectFormat,
}) => {
  // Safety check: ensure generatedContents is an object
  if (!generatedContents || typeof generatedContents !== 'object' || Object.keys(generatedContents).length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {Array.isArray(contentFormats) && contentFormats
        .filter(format => generatedContents[format.id])
        .map(format => (
          <Button
            key={format.id}
            variant={activeFormat === format.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectFormat(format.id)}
            className={
              activeFormat === format.id 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0" 
                : "bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
            }
          >
            {format.name}
          </Button>
        ))}
    </div>
  );
};

export default FormatSelector;
