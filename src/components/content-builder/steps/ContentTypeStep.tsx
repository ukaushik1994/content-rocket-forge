import React, { useEffect, useState } from 'react';
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
  MessageCircle,
  Loader2
} from 'lucide-react';
import { ContentType, Solution } from '@/contexts/content-builder/types';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const contentTypes: Array<{value: ContentType; label: string; icon: React.FC; description: string}> = [
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
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (contentType && selectedSolution) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    }
  }, [contentType, selectedSolution, dispatch]);
  
  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Transform the data from jsonb columns to the expected format
        const formattedSolutions: Solution[] = data.map(solution => ({
          id: solution.id,
          name: solution.name,
          features: Array.isArray(solution.features) 
            ? solution.features.map(f => String(f)) 
            : [],
          useCases: Array.isArray(solution.use_cases) 
            ? solution.use_cases.map(u => String(u)) 
            : [],
          painPoints: Array.isArray(solution.pain_points) 
            ? solution.pain_points.map(p => String(p)) 
            : [],
          targetAudience: Array.isArray(solution.target_audience) 
            ? solution.target_audience.map(t => String(t)) 
            : [],
          description: `${solution.name} - Business Solution` // Default description
        }));
        setSolutions(formattedSolutions);
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
      // Fallback to some default data if there's an error or no solutions
      setSolutions([{
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"]
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectContentType = (value: string) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: value as ContentType });
  };
  
  const handleSelectSolution = (solution: Solution) => {
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
    toast.success(`Selected solution: ${solution.name}`);
  };

  const handleNavigateToSolutions = () => {
    navigate('/solutions');
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Select a Solution</h3>
          <Button
            variant="outline"
            onClick={handleNavigateToSolutions}
            className="text-xs"
          >
            Manage Solutions
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose which business solution this content should promote or reference.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solutions.map((solution) => (
              <Card 
                key={solution.id} 
                className={`cursor-pointer transition-all hover:border-primary
                  ${selectedSolution?.id === solution.id ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleSelectSolution(solution)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{solution.name}</h4>
                  {solution.description && (
                    <p className="text-sm text-muted-foreground">{solution.description}</p>
                  )}
                  
                  {solution.features && solution.features.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium">Features:</span>
                      <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                        {solution.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                        {solution.features.length > 3 && (
                          <li className="text-xs text-primary">+{solution.features.length - 3} more features</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {solution.useCases && solution.useCases.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium">Use Cases:</span>
                      <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                        {solution.useCases.slice(0, 2).map((useCase, idx) => (
                          <li key={idx}>{useCase}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
