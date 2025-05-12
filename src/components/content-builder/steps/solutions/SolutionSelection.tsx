
import React, { useState, useEffect } from 'react';
import { SolutionSelectionCard } from './SolutionSelectionCard';
import { Solution } from '@/contexts/content-builder/types';
import { useSolutionsData } from '@/components/solutions/hooks/useSolutionsData';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SolutionSelectionProps {
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution | null) => void;
}

export const SolutionSelection: React.FC<SolutionSelectionProps> = ({ 
  selectedSolution, 
  onSolutionSelect 
}) => {
  const { solutions, isLoading, error, fetchSolutions } = useSolutionsData();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);
  
  // Filter solutions based on search query
  const filteredSolutions = searchQuery.trim() === '' 
    ? solutions 
    : solutions.filter(solution => 
        solution.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        solution.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        solution.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (solution.targetAudience && solution.targetAudience.some(audience => 
          audience.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
  
  // Handle selection toggle
  const handleSelectSolution = (solution: Solution) => {
    if (selectedSolution?.id === solution.id) {
      onSolutionSelect(null); // Deselect if already selected
    } else {
      onSolutionSelect(solution); // Select the new solution
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-full max-w-xs" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[180px] rounded-md" />
          ))}
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading solutions</AlertTitle>
        <AlertDescription>
          Unable to load available solutions. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show empty state
  if (solutions.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
        <h3 className="mt-4 text-lg font-medium">No solutions available</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There are no solutions configured in your system yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search solutions by name, category, or features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {filteredSolutions.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">No matching solutions</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSolutions.map((solution) => (
            <SolutionSelectionCard
              key={solution.id}
              solution={solution}
              selected={selectedSolution?.id === solution.id}
              onClick={() => handleSelectSolution(solution)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
