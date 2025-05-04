
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';
import { useSolutionsData } from '../hooks/useSolutionsData';
import { SolutionGrid } from './SolutionGrid';
import { SolutionFormDialog } from './SolutionFormDialog';
import { DeleteSolutionDialog } from './DeleteSolutionDialog';
import { useSolutionForm } from './hooks/useSolutionForm';
import { useDeleteSolution } from './hooks/useDeleteSolution';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingState } from './LoadingState';
import { SolutionsHeader } from './SolutionsHeader';

interface SolutionManagerProps {
  searchTerm: string;
}

export const SolutionManager: React.FC<SolutionManagerProps> = ({ searchTerm }) => {
  // Added for content builder integration
  const navigate = useNavigate();
  const { dispatch } = useContentBuilder();
  
  const { 
    solutions, 
    isLoading, 
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  } = useSolutionsData();
  
  const solutionForm = useSolutionForm({
    addSolution,
    updateSolution
  });

  const deleteHandler = useDeleteSolution({
    deleteSolution
  });
  
  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // Filter solutions based on search term
  const filteredSolutions = solutions.filter(solution => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in name
    if (solution.name.toLowerCase().includes(searchLower)) return true;
    
    // Search in features
    if (solution.features.some(feature => 
      feature.toLowerCase().includes(searchLower))) return true;
    
    // Search in use cases
    if (solution.useCases.some(useCase => 
      useCase.toLowerCase().includes(searchLower))) return true;
    
    // Search in pain points
    if (solution.painPoints.some(painPoint => 
      painPoint.toLowerCase().includes(searchLower))) return true;
    
    // Search in target audience
    if (solution.targetAudience.some(audience => 
      audience.toLowerCase().includes(searchLower))) return true;
    
    return false;
  });

  // Function to handle using a solution in content
  const handleUseInContent = (solution: Solution) => {
    // Store the solution in the content builder context
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
    
    // Navigate to the content builder page
    toast.success(`${solution.name} selected for content creation`);
    navigate('/content');
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchSolutions} />;
  }
  
  return (
    <>
      <SolutionsHeader 
        solutionCount={filteredSolutions.length}
        searchTerm={searchTerm}
        onAddNew={solutionForm.handleAddNew}
      />
      
      {filteredSolutions.length === 0 ? (
        <EmptyState searchTerm={searchTerm} onAddNew={solutionForm.handleAddNew} />
      ) : (
        <SolutionGrid 
          solutions={filteredSolutions}
          onEdit={solutionForm.handleEdit}
          onDelete={deleteHandler.handleDelete}
          onUseInContent={handleUseInContent}
        />
      )}
      
      {/* Add/Edit Dialog */}
      <SolutionFormDialog
        open={solutionForm.isDialogOpen}
        onOpenChange={solutionForm.setIsDialogOpen}
        onSubmit={solutionForm.handleSubmitForm}
        solution={solutionForm.selectedSolution}
        isSubmitting={solutionForm.isSubmitting}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteSolutionDialog
        open={deleteHandler.isDeleteDialogOpen}
        onOpenChange={deleteHandler.setIsDeleteDialogOpen}
        onConfirmDelete={deleteHandler.confirmDelete}
        solution={deleteHandler.selectedSolution}
        isSubmitting={deleteHandler.isSubmitting}
      />
    </>
  );
};
