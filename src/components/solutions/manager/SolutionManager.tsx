
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

export const SolutionManager: React.FC = () => {
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
        <h2 className="text-xl font-bold">Business Solutions ({solutions.length})</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Solution
        </Button>
      </div>
      
      <SolutionGrid 
        solutions={solutions}
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
