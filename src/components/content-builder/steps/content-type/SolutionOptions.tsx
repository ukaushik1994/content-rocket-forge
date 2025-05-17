
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types/solution-types';

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

interface SolutionOptionsProps {
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution) => void;
  onClearSelection: () => void;
}

export const SolutionOptions: React.FC<SolutionOptionsProps> = ({
  selectedSolution,
  onSolutionSelect,
  onClearSelection
}) => {
  return (
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
            onClick={() => onSolutionSelect(solution)}
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
          onClick={onClearSelection}
          size="sm"
        >
          Clear Selection
        </Button>
      </div>
    </div>
  );
};

// Import the Label component to avoid errors
import { Label } from '@/components/ui/label';
