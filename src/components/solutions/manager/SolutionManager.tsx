
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';
import { SolutionGrid } from './SolutionGrid';
import { useSolutionsData } from '../hooks/useSolutionsData';
import { SolutionFormDialog } from './SolutionFormDialog';
import { DeleteSolutionDialog } from './DeleteSolutionDialog';

interface SolutionManagerProps {
  searchTerm: string;
}

export const SolutionManager: React.FC<SolutionManagerProps> = ({ searchTerm }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  
  // Added for content builder integration
  const navigate = useNavigate();
  const { dispatch } = useContentBuilder();
  
  const { 
    solutions, 
    isLoading, 
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  } = useSolutionsData();
  
  useEffect(() => {
    fetchSolutions();
  }, []);

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

  const handleAddNew = () => {
    setSelectedSolution(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedSolution) {
      const success = await deleteSolution(selectedSolution.id);
      if (success) {
        toast.success(`${selectedSolution.name} deleted successfully!`);
      }
      setIsDeleteDialogOpen(false);
      setSelectedSolution(null);
    }
  };
  
  const handleSubmitForm = async (formData: {
    name: string;
    features: string;
    useCases: string;
    painPoints: string;
    targetAudience: string;
  }) => {
    const splitStrings = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);
    
    const solutionData = {
      name: formData.name,
      features: splitStrings(formData.features),
      useCases: splitStrings(formData.useCases),
      painPoints: splitStrings(formData.painPoints),
      targetAudience: splitStrings(formData.targetAudience),
    };
    
    let success = false;
    
    if (selectedSolution) {
      // Update existing
      success = await updateSolution(selectedSolution.id, solutionData);
      if (success) {
        toast.success(`${formData.name} updated successfully!`);
      }
    } else {
      // Add new
      success = await addSolution(solutionData);
      if (success) {
        toast.success(`${formData.name} added successfully!`);
      }
    }
    
    if (success) {
      setIsDialogOpen(false);
    }
  };

  // Function to handle using a solution in content
  const handleUseInContent = (solution: Solution) => {
    // Store the solution in the content builder context
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
    
    // Navigate to the content builder page
    toast.success(`${solution.name} selected for content creation`);
    navigate('/content');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          Business Solutions ({filteredSolutions.length})
          {searchTerm && <span className="text-base ml-2 font-normal text-muted-foreground">filtered by "{searchTerm}"</span>}
        </h2>
        <Button 
          onClick={handleAddNew}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Solution
        </Button>
      </div>
      
      {filteredSolutions.length === 0 && searchTerm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg mb-2">No solutions found matching "{searchTerm}"</p>
          <p className="text-muted-foreground">Try a different search term or clear the search</p>
        </div>
      )}
      
      <SolutionGrid 
        solutions={filteredSolutions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUseInContent={handleUseInContent}
      />
      
      {/* Add/Edit Dialog */}
      <SolutionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitForm}
        solution={selectedSolution}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteSolutionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        solution={selectedSolution}
        isSubmitting={false}
      />
    </>
  );
};
