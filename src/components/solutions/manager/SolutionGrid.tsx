
import React from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { SolutionCard } from '../SolutionCard';

interface SolutionGridProps {
  solutions: Solution[];
  onEdit: (solution: Solution) => void;
  onDelete: (solution: Solution) => void;
  onUseInContent: (solution: Solution) => void;
}

export const SolutionGrid: React.FC<SolutionGridProps> = ({ 
  solutions,
  onEdit,
  onDelete,
  onUseInContent
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {solutions.map(solution => (
        <div key={solution.id} className="relative group">
          <SolutionCard 
            name={solution.name}
            features={solution.features}
            useCases={solution.useCases}
            painPoints={solution.painPoints}
            targetAudience={solution.targetAudience}
            onUseInContent={() => onUseInContent(solution)}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 bg-black/50 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(solution);
              }}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-7 bg-red-500/80 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(solution);
              }}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Import the required dependencies
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
