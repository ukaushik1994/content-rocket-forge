
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';
import { useSolutionsData } from '../hooks/useSolutionsData';
import { SolutionFormDialog } from './SolutionFormDialog';
import { DeleteSolutionDialog } from './DeleteSolutionDialog';
import { useSolutionForm } from './hooks/useSolutionForm';
import { useDeleteSolution } from './hooks/useDeleteSolution';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingState } from './LoadingState';
import { EnhancedSolutionGrid } from '../EnhancedSolutionGrid';
import { HeroSection } from '../HeroSection';
import { motion } from 'framer-motion';

interface SolutionManagerProps {
  searchTerm: string;
}

export const SolutionManager: React.FC<SolutionManagerProps> = ({ searchTerm }) => {
  // Added for content builder integration
  const navigate = useNavigate();
  const { dispatch } = useContentBuilder();
  const [filterTerm, setFilterTerm] = useState(searchTerm);
  
  const { 
    solutions, 
    loading, 
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  } = useSolutionsData();
  
  const solutionForm = useSolutionForm({
    addSolution: async (data: any, logoUrl?: string) => {
      const result = await addSolution(data, logoUrl);
      return result;
    },
    updateSolution: async (id: string, data: any, logoUrl?: string) => {
      const result = await updateSolution(id, data, logoUrl);
      return result;
    }
  });

  const deleteHandler = useDeleteSolution({
    deleteSolution: async (id: string) => {
      const result = await deleteSolution(id);
      return result;
    }
  });

  // Update local filter when search term changes
  useEffect(() => {
    setFilterTerm(searchTerm);
  }, [searchTerm]);
  
  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // Filter solutions based on search term
  const filteredSolutions = solutions.filter(solution => {
    if (!filterTerm) return true;
    
    const searchLower = filterTerm.toLowerCase();
    
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

  const handleSearchChange = (term: string) => {
    setFilterTerm(term);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchSolutions} />;
  }
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero section with search and stats */}
      <HeroSection 
        solutionCount={solutions.length} 
        searchTerm={filterTerm}
        onSearchChange={handleSearchChange}
      />
      
      {/* Main content area */}
      {filteredSolutions.length === 0 ? (
        <EmptyState searchTerm={filterTerm} onAddNew={solutionForm.handleAddNew} />
      ) : (
        <EnhancedSolutionGrid 
          solutions={filteredSolutions}
          onEdit={solutionForm.handleEdit}
          onDelete={deleteHandler.handleDelete}
          onUseInContent={handleUseInContent}
          onAddNew={solutionForm.handleAddNew}
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
    </motion.div>
  );
};
