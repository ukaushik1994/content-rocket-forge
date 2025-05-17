
import React from 'react';
import { ContentType } from '@/contexts/content-builder/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  BookText,
  BarChart3,
  Calculator,
  CheckCircle
} from 'lucide-react';

// Content type options
const contentTypeOptions: { value: ContentType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'blog',
    label: 'Blog Post',
    icon: <BookText className="h-6 w-6" />,
    description: 'Educational content to attract and engage readers'
  },
  {
    value: 'product',
    label: 'Product Page',
    icon: <Calculator className="h-6 w-6" />,
    description: 'Showcase features and benefits of your product'
  },
  {
    value: 'landing',
    label: 'Landing Page',
    icon: <BarChart3 className="h-6 w-6" />,
    description: 'Conversion-focused page for campaigns or offers'
  },
  {
    value: 'case-study',
    label: 'Case Study',
    icon: <CheckCircle className="h-6 w-6" />,
    description: 'Showcase customer success stories and results'
  }
];

interface ContentTypeOptionsProps {
  selectedContentType: ContentType | undefined;
  onContentTypeSelect: (value: string) => void;
}

export const ContentTypeOptions: React.FC<ContentTypeOptionsProps> = ({ 
  selectedContentType, 
  onContentTypeSelect 
}) => {
  return (
    <div>
      <Label className="mb-3 block">What type of content are you creating?</Label>
      
      <RadioGroup 
        value={selectedContentType || ''} 
        onValueChange={onContentTypeSelect}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {contentTypeOptions.map((option) => (
          <Label
            key={option.value}
            htmlFor={option.value}
            className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${selectedContentType === option.value 
                ? 'border-primary bg-primary/10' 
                : 'hover:bg-accent'}`}
          >
            <RadioGroupItem id={option.value} value={option.value} className="sr-only" />
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
              {option.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
};
