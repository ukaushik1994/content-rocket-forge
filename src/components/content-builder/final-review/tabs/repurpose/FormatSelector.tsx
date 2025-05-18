
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
  if (Object.keys(generatedContents).length === 0) {
    return null;
  }

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {contentFormats
        .filter(format => generatedContents[format.id])
        .map(format => (
          <Button
            key={format.id}
            variant={activeFormat === format.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectFormat(format.id)}
          >
            {format.name}
          </Button>
        ))}
    </div>
  );
};

export default FormatSelector;
