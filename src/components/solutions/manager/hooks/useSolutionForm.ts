
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

  const handleSubmitForm = async (formData: {
    name: string;
    features: string;
    useCases: string;
    painPoints: string;
    targetAudience: string;
    externalUrl?: string;
    resources?: Array<{ title: string; url: string; }>;
  }, logoFile?: File) => {
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
          throw uploadError;
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('solution-logos')
          .getPublicUrl(filePath);
          
        logoUrl = publicUrl;
      }
      
      const solutionData = {
        name: formData.name.trim(),
        features: splitStrings(formData.features),
        useCases: splitStrings(formData.useCases),
        painPoints: splitStrings(formData.painPoints),
        targetAudience: splitStrings(formData.targetAudience),
        externalUrl: formData.externalUrl?.trim() || null,
        resources: formData.resources || [],
      };
      
      let success = false;
      
      if (selectedSolution) {
        // Update existing
        success = await updateSolution(selectedSolution.id, solutionData, logoUrl);
        if (success) {
          toast.success(`${formData.name} updated successfully!`);
        }
      } else {
        // Add new
        success = await addSolution(solutionData, logoUrl);
        if (success) {
          toast.success(`${formData.name} added successfully!`);
        }
      }
      
      if (success) {
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error saving solution:", error);
      toast.error("An unexpected error occurred while saving the solution");
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
