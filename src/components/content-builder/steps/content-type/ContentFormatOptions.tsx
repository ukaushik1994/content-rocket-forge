
import React from 'react';
import { ContentFormat } from '@/contexts/content-builder/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FileStack,
  ListChecks,
  FileQuestion,
  Mail
} from 'lucide-react';

// Content format options
const contentFormatOptions: { value: ContentFormat; label: string; icon: React.ReactNode }[] = [
  {
    value: 'article',
    label: 'Article',
    icon: <FileStack className="h-5 w-5" />
  },
  {
    value: 'how-to',
    label: 'How-to Guide',
    icon: <ListChecks className="h-5 w-5" />
  },
  {
    value: 'faq',
    label: 'FAQ',
    icon: <FileQuestion className="h-5 w-5" />
  },
  {
    value: 'newsletter',
    label: 'Newsletter',
    icon: <Mail className="h-5 w-5" />
  }
];

interface ContentFormatOptionsProps {
  selectedContentFormat: ContentFormat | undefined;
  onFormatSelect: (value: string) => void;
}

export const ContentFormatOptions: React.FC<ContentFormatOptionsProps> = ({ 
  selectedContentFormat, 
  onFormatSelect 
}) => {
  return (
    <div className="space-y-3 pt-4 animate-fade-in">
      <Label>Select content format:</Label>
      
      <RadioGroup 
        value={selectedContentFormat || ''} 
        onValueChange={onFormatSelect}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {contentFormatOptions.map((format) => (
          <Label
            key={format.value}
            htmlFor={`format-${format.value}`}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors aspect-square
              ${selectedContentFormat === format.value 
                ? 'border-primary bg-primary/10' 
                : 'hover:bg-accent'}`}
          >
            <RadioGroupItem id={`format-${format.value}`} value={format.value} className="sr-only" />
            <div className="h-8 w-8 flex items-center justify-center">
              {format.icon}
            </div>
            <div className="text-sm text-center">{format.label}</div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};
