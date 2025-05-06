
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ContentTypeSelectorProps {
  formats: string[];
  selectedFormat: string;
  onFormatSelect: (format: string) => void;
}

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({ 
  formats,
  selectedFormat,
  onFormatSelect
}) => {
  return (
    <RadioGroup 
      value={selectedFormat}
      onValueChange={onFormatSelect}
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      {formats.map((format) => (
        <div 
          key={format}
          className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-all ${
            selectedFormat === format
              ? 'border-primary/50 bg-primary/5'
              : 'border-white/10 hover:bg-white/5'
          }`}
          onClick={() => onFormatSelect(format)}
        >
          <RadioGroupItem value={format} id={`format-${format}`} />
          <Label 
            htmlFor={`format-${format}`}
            className="cursor-pointer w-full font-normal"
          >
            {format}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
