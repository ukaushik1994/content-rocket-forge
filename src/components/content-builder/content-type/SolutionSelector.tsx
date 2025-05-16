
import React from 'react';
import { Card } from '@/components/ui/card';
import { Solution } from '@/contexts/content-builder/types';
import { Check, LucideIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredSolutions = solutions.filter(solution => 
    solution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solution.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solution.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-full h-10 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-muted animate-pulse rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search solutions..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredSolutions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No solutions found. Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSolutions.map((solution) => (
            <Card
              key={solution.id}
              className={`p-4 cursor-pointer border transition-all overflow-hidden ${
                selectedSolution?.id === solution.id
                  ? 'border-primary shadow-sm'
                  : 'hover:border-primary/40'
              }`}
              onClick={() => onSolutionSelect(
                selectedSolution?.id === solution.id ? null : solution
              )}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{solution.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {solution.description}
                    </p>
                  </div>
                  {selectedSolution?.id === solution.id && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                {solution.category && (
                  <div className="mt-auto pt-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {solution.category}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {selectedSolution && (
        <div className="flex justify-end">
          <button
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={() => onSolutionSelect(null)}
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
};
