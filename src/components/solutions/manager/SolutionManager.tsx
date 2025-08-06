import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';
import { useSolutionsData } from '../hooks/useSolutionsData';
import { EnhancedSolutionFormDialog } from './EnhancedSolutionFormDialog';
import { DeleteSolutionDialog } from './DeleteSolutionDialog';
import { useDeleteSolution } from './hooks/useDeleteSolution';
import { solutionService } from '@/services/solutionService';
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
    isLoading, 
    error,
    fetchSolutions,
    deleteSolution
  } = useSolutionsData();

  // Enhanced form state management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deleteHandler = useDeleteSolution({
    deleteSolution
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

  // Enhanced form handlers
  const handleAddNew = () => {
    setSelectedSolution(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsDialogOpen(true);
  };

  const handleSubmitForm = async (solutionData: any, logoFile?: File) => {
    console.log('HandleSubmitForm called with:', { solutionData, logoFile });
    
    try {
      setIsSubmitting(true);
      
      if (selectedSolution?.id) {
        console.log('Updating solution with ID:', selectedSolution.id);
        const result = await solutionService.updateSolution(selectedSolution.id, solutionData, logoFile);
        console.log('Update result:', result);
        
        if (result) {
          // Refresh the solutions list
          await fetchSolutions();
          toast.success('Solution updated successfully');
          setIsDialogOpen(false);
          setSelectedSolution(null);
        } else {
          throw new Error('Failed to update solution');
        }
      } else {
        console.log('Creating new solution');
        const result = await solutionService.createSolution(solutionData, logoFile);
        console.log('Create result:', result);
        
        if (result) {
          // Refresh the solutions list
          await fetchSolutions();
          toast.success('Solution created successfully');
          setIsDialogOpen(false);
          setSelectedSolution(null);
        } else {
          throw new Error('Failed to create solution');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmitForm:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Save failed: ${errorMessage}`);
      // Keep dialog open on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
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
        <EmptyState searchTerm={filterTerm} onAddNew={handleAddNew} />
      ) : (
        <EnhancedSolutionGrid 
          solutions={filteredSolutions}
          onEdit={handleEdit}
          onDelete={deleteHandler.handleDelete}
          onUseInContent={handleUseInContent}
          onAddNew={handleAddNew}
        />
      )}
      
      {/* Add/Edit Dialog */}
      <EnhancedSolutionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitForm}
        solution={selectedSolution}
        isSubmitting={isSubmitting}
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

export default SolutionManager;
