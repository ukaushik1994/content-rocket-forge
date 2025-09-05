
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
        <div key={solution.id} className="relative group transition-all duration-500 hover:translate-y-[-8px] hover:scale-[1.02]">
          <div className="premium-card p-6 h-full">
            <SolutionCard 
              name={solution.name}
              features={solution.features || []}
              useCases={solution.useCases || []}
              painPoints={solution.painPoints || []}
              targetAudience={solution.targetAudience || []}
              onUseInContent={() => onUseInContent(solution)}
            />
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 rounded-xl bg-card/90 backdrop-blur-xl border-white/20 hover:bg-card/95 hover:border-primary/30 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(solution);
              }}
              aria-label={`Edit ${solution.name}`}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 px-3 rounded-xl bg-destructive/90 backdrop-blur-xl border-destructive/30 hover:bg-destructive/95 hover:border-destructive/50 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(solution);
              }}
              aria-label={`Delete ${solution.name}`}
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
