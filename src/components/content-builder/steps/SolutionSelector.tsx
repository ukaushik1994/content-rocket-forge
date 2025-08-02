import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';

export function SolutionSelector() {
  const { state, dispatch } = useContentBuilder();
  const { selectedSolution } = state;

  const solutions = [
    {
      id: '1',
      name: 'Content Management System',
      description: 'Manage and organize your content efficiently',
      features: ['Content Organization', 'Version Control', 'Collaboration Tools'],
      category: 'productivity'
    },
    {
      id: '2',
      name: 'SEO Optimization Tool',
      description: 'Improve your search engine rankings',
      features: ['Keyword Analysis', 'Content Optimization', 'Performance Tracking'],
      category: 'seo'
    },
    {
      id: '3',
      name: 'Analytics Dashboard',
      description: 'Track and analyze your content performance',
      features: ['Real-time Analytics', 'Custom Reports', 'Data Visualization'],
      category: 'analytics'
    }
  ];

  const handleSelectSolution = (solution: any) => {
    dispatch({ type: 'SET_SELECTED_SOLUTION', payload: solution });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Select a Solution</h3>
        <p className="text-muted-foreground">
          Choose a solution to integrate into your content strategy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {solutions.map((solution) => (
          <Card 
            key={solution.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSolution?.id === solution.id 
                ? 'ring-2 ring-primary border-primary' 
                : 'border-border'
            }`}
            onClick={() => handleSelectSolution(solution)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{solution.name}</CardTitle>
                {selectedSolution?.id === solution.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <Badge variant="secondary" className="w-fit">
                {solution.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {solution.description}
              </p>
              <div className="space-y-1">
                <p className="text-xs font-medium">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {solution.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSolution && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="font-medium">Selected Solution</span>
            </div>
            <p className="text-sm">
              <strong>{selectedSolution.name}</strong> will be integrated into your content strategy.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Solution
        </Button>
      </div>
    </div>
  );
}
