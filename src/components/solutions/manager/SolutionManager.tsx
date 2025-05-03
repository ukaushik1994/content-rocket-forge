
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, AlertCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';
import { SolutionGrid } from './SolutionGrid';
import { useSolutionsData } from '../hooks/useSolutionsData';
import { SolutionFormDialog } from './SolutionFormDialog';
import { DeleteSolutionDialog } from './DeleteSolutionDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SolutionManagerProps {
  searchTerm: string;
}

export const SolutionManager: React.FC<SolutionManagerProps> = ({ searchTerm }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      setIsSubmitting(true);
      try {
        const success = await deleteSolution(selectedSolution.id);
        if (success) {
          toast.success(`${selectedSolution.name} deleted successfully!`);
        }
      } catch (error) {
        console.error("Error during solution deletion:", error);
        toast.error("An unexpected error occurred while deleting the solution");
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedSolution(null);
        setIsSubmitting(false);
      }
    }
  };
  
  const handleSubmitForm = async (formData: {
    name: string;
    features: string;
    useCases: string;
    painPoints: string;
    targetAudience: string;
  }) => {
    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Solution name is required");
      return;
    }
    
    // Helper function to properly split and sanitize string inputs
    const splitStrings = (str: string) => 
      str.split(',')
         .map(s => s.trim())
         .filter(s => s);
    
    const solutionData = {
      name: formData.name.trim(),
      features: splitStrings(formData.features),
      useCases: splitStrings(formData.useCases),
      painPoints: splitStrings(formData.painPoints),
      targetAudience: splitStrings(formData.targetAudience),
    };
    
    setIsSubmitting(true);
    
    let success = false;
    
    try {
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
    } catch (error) {
      console.error("Error saving solution:", error);
      toast.error("An unexpected error occurred while saving the solution");
    } finally {
      setIsSubmitting(false);
      if (success) {
        setIsDialogOpen(false);
      }
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
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => fetchSolutions()}
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
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
      
      {filteredSolutions.length === 0 && !searchTerm && (
        <Card className="glass-panel">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Solutions Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first business solution to start generating content that showcases your products or services.
            </p>
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Solution
            </Button>
          </CardContent>
        </Card>
      )}
      
      {filteredSolutions.length > 0 && (
        <SolutionGrid 
          solutions={filteredSolutions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUseInContent={handleUseInContent}
        />
      )}
      
      {/* Add/Edit Dialog */}
      <SolutionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitForm}
        solution={selectedSolution}
        isSubmitting={isSubmitting}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteSolutionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
        solution={selectedSolution}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
