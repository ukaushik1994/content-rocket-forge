
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';

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
    <RadioGroup value={selectedFormat} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {formats.map((format) => (
        <div
          key={format}
          onClick={() => onFormatSelect(format)}
          className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
            selectedFormat === format
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card/50 hover:bg-card/80'
          }`}
        >
          <RadioGroupItem value={format} id={format} className="hidden" />
          {selectedFormat === format ? (
            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full border border-muted-foreground"></div>
          )}
          <label htmlFor={format} className="text-sm font-medium cursor-pointer flex-1">
            {format}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
};
