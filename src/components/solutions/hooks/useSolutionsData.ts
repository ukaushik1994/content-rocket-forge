
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/contexts/content-builder/types';
import { v4 as uuidv4 } from 'uuid';

export const useSolutionsData = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all solutions
  const fetchSolutions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('solutions')
        .select('*');

      if (fetchError) throw fetchError;

      if (data) {
        const formattedSolutions: Solution[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          features: item.features || [],
          useCases: item.use_cases || [],
          painPoints: item.pain_points || [],
          targetAudience: item.target_audience || [],
          category: item.category || 'Other', // Ensure category has a default
          logoUrl: item.logo_url,
          externalUrl: item.external_url,
          resources: item.resources || []
        }));
        
        setSolutions(formattedSolutions);
      }
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch solutions'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Add a new solution
  const addSolution = async (solution: Omit<Solution, 'id'>, logoUrl?: string): Promise<string> => {
    try {
      const newId = uuidv4();
      
      const { error: insertError } = await supabase
        .from('solutions')
        .insert({
          id: newId,
          name: solution.name,
          description: solution.description,
          features: solution.features,
          use_cases: solution.useCases, 
          pain_points: solution.painPoints,
          target_audience: solution.targetAudience,
          category: solution.category,
          logo_url: logoUrl || solution.logoUrl,
          external_url: solution.externalUrl,
          resources: solution.resources
        });

      if (insertError) throw insertError;
      
      // Refresh the list
      await fetchSolutions();
      
      return newId;
    } catch (err) {
      console.error('Error adding solution:', err);
      throw err instanceof Error ? err : new Error('Failed to add solution');
    }
  };
  
  // Update a solution
  const updateSolution = async (id: string, solution: Partial<Solution>, logoUrl?: string): Promise<void> => {
    try {
      const { error: updateError } = await supabase
        .from('solutions')
        .update({
          name: solution.name,
          description: solution.description,
          features: solution.features,
          use_cases: solution.useCases, 
          pain_points: solution.painPoints,
          target_audience: solution.targetAudience,
          category: solution.category,
          logo_url: logoUrl || solution.logoUrl,
          external_url: solution.externalUrl,
          resources: solution.resources
        })
        .eq('id', id);

      if (updateError) throw updateError;
      
      // Refresh the list
      await fetchSolutions();
    } catch (err) {
      console.error('Error updating solution:', err);
      throw err instanceof Error ? err : new Error('Failed to update solution');
    }
  };
  
  // Delete a solution
  const deleteSolution = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('solutions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Update local state instead of refetching
      setSolutions(solutions.filter(solution => solution.id !== id));
    } catch (err) {
      console.error('Error deleting solution:', err);
      throw err instanceof Error ? err : new Error('Failed to delete solution');
    }
  };

  return {
    solutions,
    isLoading,
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  };
};
