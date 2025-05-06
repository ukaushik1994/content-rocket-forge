
import React from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface SolutionSelectorProps {
  solutions: Solution[];
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution | null) => void;
  isLoading: boolean;
}

export const SolutionSelector: React.FC<SolutionSelectorProps> = ({
  solutions,
  selectedSolution,
  onSolutionSelect,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>
    );
  }

  return (
    <RadioGroup value={selectedSolution?.id || ''} className="space-y-3">
      {solutions.map((solution) => (
        <Card
          key={solution.id}
          className={`cursor-pointer transition-all ${
            selectedSolution?.id === solution.id
              ? 'border-primary/50 bg-primary/5'
              : 'border-white/10 hover:bg-white/5'
          }`}
          onClick={() => onSolutionSelect(solution)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <RadioGroupItem 
              value={solution.id} 
              id={`solution-${solution.id}`}
              checked={selectedSolution?.id === solution.id}
            />
            
            <div className="flex-1">
              <Label 
                htmlFor={`solution-${solution.id}`}
                className="text-base font-medium cursor-pointer"
              >
                {solution.name}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {solution.description}
              </p>
              {solution.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {solution.features.slice(0, 3).map((feature, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-0.5 bg-white/5 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {solution.category && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {solution.category}
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </RadioGroup>
  );
};
