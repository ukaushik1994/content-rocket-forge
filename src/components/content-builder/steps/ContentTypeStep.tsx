import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  FileText, 
  LayoutDashboard, 
  ShoppingBag, 
  Newspaper, 
  Mail, 
  MessageCircle 
} from 'lucide-react';
import { ContentType, Solution } from '@/contexts/content-builder/types';

// Mock solutions until we integrate with backend
const mockSolutions: Solution[] = [
  {
    id: '1',
    name: 'SEO Pro',
    description: 'Advanced SEO tools and strategies',
    features: ['Keyword Analysis', 'Competitor Research', 'Content Optimization']
  },
  {
    id: '2',
    name: 'Content Master',
    description: 'Complete content marketing solution',
    features: ['Content Calendar', 'Blog Management', 'Distribution Strategy']
  },
  {
    id: '3',
    name: 'Social Engage',
    description: 'Social media engagement platform',
    features: ['Post Scheduling', 'Analytics Dashboard', 'Audience Insights']
  }
];

const contentTypes = [
  { value: 'blog', label: 'Blog Post', icon: FileText, description: 'Informative, educational content for your blog' },
  { value: 'landingPage', label: 'Landing Page', icon: LayoutDashboard, description: 'Conversion-focused page for a specific purpose' },
  { value: 'productDescription', label: 'Product Description', icon: ShoppingBag, description: 'Compelling content to showcase your products' },
  { value: 'article', label: 'Article', icon: Newspaper, description: 'In-depth piece on a specific topic' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Content for email marketing campaigns' },
  { value: 'social', label: 'Social Media', icon: MessageCircle, description: 'Engaging posts for social platforms' }
];

export const ContentTypeStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { contentType, selectedSolution } = state;
  
  useEffect(() => {
    if (contentType && selectedSolution) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, selectedSolution, dispatch]);
  
  const handleSelectContentType = (value: string) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: value as ContentType });
  };
  
  const handleSelectSolution = (solution: Solution) => {
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of content you want to create.
        </p>
        
        <RadioGroup 
          value={contentType || ''} 
          onValueChange={handleSelectContentType}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {contentTypes.map((type) => (
            <div key={type.value} className="relative">
              <RadioGroupItem
                value={type.value}
                id={`content-type-${type.value}`}
                className="sr-only peer"
              />
              <Label
                htmlFor={`content-type-${type.value}`}
                className={`flex flex-col items-center justify-center h-32 p-4 rounded-lg border-2 cursor-pointer
                transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50
                ${contentType === type.value ? 'border-primary bg-primary/5' : 'border-muted'}`}
              >
                <type.icon className="h-8 w-8 mb-2" />
                <div className="font-medium text-center">{type.label}</div>
                <div className="text-xs text-center text-muted-foreground mt-1">{type.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select a Solution</h3>
        <p className="text-sm text-muted-foreground">
          Choose which solution this content belongs to.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockSolutions.map((solution) => (
            <Card 
              key={solution.id} 
              className={`cursor-pointer transition-all hover:border-primary
                ${selectedSolution?.id === solution.id ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => handleSelectSolution(solution)}
            >
              <CardContent className="p-4">
                <h4 className="font-medium">{solution.name}</h4>
                <p className="text-sm text-muted-foreground">{solution.description}</p>
                
                {solution.features && (
                  <div className="mt-3">
                    <span className="text-xs font-medium">Features:</span>
                    <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                      {solution.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
