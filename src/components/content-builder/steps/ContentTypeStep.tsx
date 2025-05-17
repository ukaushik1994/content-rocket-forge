
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentType, ContentFormat } from '@/contexts/content-builder/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  BookText,
  BarChart3,
  CheckCircle,
  FileStack,
  FileQuestion,
  ListChecks,
  Mail
} from 'lucide-react';

// Import the Solution type from the correct location
import { Solution } from '@/contexts/content-builder/types/solution-types';

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

// Mock solutions for demonstration
const mockSolutions: Solution[] = [
  {
    id: '1',
    name: 'Content Optimizer Pro',
    description: '',
    features: ['AI content generation', 'Keyword optimization', 'Readability analysis'],
    painPoints: ['Poor content quality', 'Time-consuming content creation', 'Low search rankings'],
    useCases: [],
    targetAudience: [],
    category: 'seo',
    logoUrl: null,
    externalUrl: null,
    resources: []
  },
  {
    id: '2',
    name: 'SEO Wizard',
    description: '',
    features: ['Keyword research', 'Competitor analysis', 'Backlink tracking'],
    painPoints: ['Low organic traffic', 'Poor keyword targeting', 'Limited SEO knowledge'],
    useCases: [],
    targetAudience: [],
    category: 'seo',
    logoUrl: null,
    externalUrl: null,
    resources: []
  }
];

export const ContentTypeStep = () => {
  const { state, setContentType, setContentFormat, setSelectedSolution } = useContentBuilder();
  const { contentType, contentFormat } = state;
  
  const [selectedSolution, setLocalSelectedSolution] = useState<Solution | null>(null);
  
  // Mark step as completed when contentType is selected
  useEffect(() => {
    if (contentType) {
      console.log("ContentType selected:", contentType);
    }
  }, [contentType]);
  
  // Handle content type selection
  const handleContentTypeSelect = (value: string) => {
    // Cast the string value to ContentType
    setContentType(value as ContentType);
  };
  
  // Handle content format selection
  const handleFormatSelect = (value: string) => {
    // Cast the string value to ContentFormat
    setContentFormat(value as ContentFormat);
  };
  
  // Handle solution selection
  const handleSolutionSelect = (solution: Solution) => {
    setLocalSelectedSolution(solution);
    setSelectedSolution(solution);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Content Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of content you want to create
        </p>
      </div>
      
      {/* Content Type Selection */}
      <div>
        <Label className="mb-3 block">What type of content are you creating?</Label>
        
        <RadioGroup 
          value={contentType || ''} 
          onValueChange={handleContentTypeSelect}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {contentTypeOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={option.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
                ${contentType === option.value 
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
      
      {/* Content Format Selection */}
      {contentType && (
        <div className="space-y-3 pt-4 animate-fade-in">
          <Label>Select content format:</Label>
          
          <RadioGroup 
            value={contentFormat || ''} 
            onValueChange={handleFormatSelect}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {contentFormatOptions.map((format) => (
              <Label
                key={format.value}
                htmlFor={`format-${format.value}`}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-colors aspect-square
                  ${contentFormat === format.value 
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
      )}
      
      {/* Solution Selection */}
      {contentType && contentFormat && (
        <div className="space-y-3 pt-4 animate-fade-in">
          <Label>Select solution to integrate (optional):</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockSolutions.map((solution) => (
              <Card 
                key={solution.id}
                className={`cursor-pointer transition-all hover:shadow
                  ${selectedSolution?.id === solution.id 
                    ? 'border-primary ring-1 ring-primary' 
                    : 'hover:border-primary/40'}`}
                onClick={() => handleSolutionSelect(solution)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{solution.name}</h4>
                    {selectedSolution?.id === solution.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>Key features:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {solution.features.slice(0, 2).map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setLocalSelectedSolution(null);
                setSelectedSolution(null);
              }}
              size="sm"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
