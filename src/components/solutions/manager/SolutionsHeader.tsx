
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SolutionsHeaderProps {
  solutionCount: number;
  searchTerm?: string;
  onAddNew: () => void;
}

export const SolutionsHeader: React.FC<SolutionsHeaderProps> = ({ 
  solutionCount, 
  searchTerm, 
  onAddNew 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">
        Business Solutions ({solutionCount})
        {searchTerm && <span className="text-base ml-2 font-normal text-muted-foreground">filtered by "{searchTerm}"</span>}
      </h2>
      <Button 
        onClick={onAddNew}
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Solution
      </Button>
    </div>
  );
};
