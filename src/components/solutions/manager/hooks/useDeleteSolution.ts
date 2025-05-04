
import { useState } from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { toast } from 'sonner';

interface UseDeleteSolutionOptions {
  deleteSolution: (id: string) => Promise<boolean>;
}

export function useDeleteSolution({ deleteSolution }: UseDeleteSolutionOptions) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedSolution,
    isSubmitting,
    handleDelete,
    confirmDelete
  };
}
