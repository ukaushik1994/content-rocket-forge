
import { useState } from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { toast } from 'sonner';

interface UseSolutionFormOptions {
  addSolution: (data: any) => Promise<boolean>;
  updateSolution: (id: string, data: any) => Promise<boolean>;
}

export function useSolutionForm({ addSolution, updateSolution }: UseSolutionFormOptions) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNew = () => {
    setSelectedSolution(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsDialogOpen(true);
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

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedSolution,
    setSelectedSolution,
    isSubmitting,
    setIsSubmitting,
    handleAddNew,
    handleEdit,
    handleSubmitForm
  };
}
