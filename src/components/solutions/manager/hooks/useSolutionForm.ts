
import { useState } from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UseSolutionFormOptions {
  addSolution: (data: any, logoUrl?: string) => Promise<boolean>;
  updateSolution: (id: string, data: any, logoUrl?: string) => Promise<boolean>;
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

  const handleSubmitForm = async (formData: any, logoFile?: File) => {
    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Solution name is required");
      throw new Error("Solution name is required");
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle logo upload if provided
      let logoUrl = selectedSolution?.logoUrl;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('solution-logos')
          .upload(filePath, logoFile);
          
        if (uploadError) {
          throw new Error(`Failed to upload logo: ${uploadError.message}`);
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('solution-logos')
          .getPublicUrl(filePath);
          
        logoUrl = publicUrl;
      }
      
      let success = false;
      
      if (selectedSolution) {
        // Update existing
        success = await updateSolution(selectedSolution.id, formData, logoUrl);
      } else {
        // Add new
        success = await addSolution(formData, logoUrl);
      }
      
      if (success) {
        setIsDialogOpen(false);
        // Success toasts are handled by the parent component
      } else {
        throw new Error("Save operation failed");
      }
    } catch (error: any) {
      console.error("Error saving solution:", error);
      const errorMessage = error?.message || "An unexpected error occurred while saving the solution";
      toast.error(errorMessage);
      throw error; // Re-throw to be caught by dialog handler
    } finally {
      setIsSubmitting(false);
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
