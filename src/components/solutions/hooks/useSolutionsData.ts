
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/contexts/content-builder/types';
import { toast } from 'sonner';

export function useSolutionsData() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Transform the data from jsonb columns to the expected format
        const formattedSolutions: Solution[] = data.map(solution => ({
          id: solution.id,
          name: solution.name,
          features: Array.isArray(solution.features) 
            ? solution.features.map(f => String(f)) 
            : [],
          useCases: Array.isArray(solution.use_cases) 
            ? solution.use_cases.map(u => String(u)) 
            : [],
          painPoints: Array.isArray(solution.pain_points) 
            ? solution.pain_points.map(p => String(p)) 
            : [],
          targetAudience: Array.isArray(solution.target_audience) 
            ? solution.target_audience.map(a => String(a)) 
            : [],
          description: `${solution.name} - Business Solution` // Default description
        }));
        setSolutions(formattedSolutions);
        return formattedSolutions;
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
      toast.error("Failed to load solutions");
      // Fallback to some default data if there's an error
      setSolutions([{
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"]
      }]);
    } finally {
      setIsLoading(false);
    }
    return [];
  };

  const addSolution = async (solutionData: {
    name: string;
    features: string[];
    useCases: string[];
    painPoints: string[];
    targetAudience: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('solutions')
        .insert({
          name: solutionData.name,
          features: solutionData.features,
          use_cases: solutionData.useCases,
          pain_points: solutionData.painPoints,
          target_audience: solutionData.targetAudience,
          user_id: 'system' // Using a default user_id for demo purposes
        })
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const newSolution: Solution = {
          id: data[0].id,
          name: data[0].name,
          features: Array.isArray(data[0].features) 
            ? data[0].features.map(String) 
            : [],
          useCases: Array.isArray(data[0].use_cases) 
            ? data[0].use_cases.map(String) 
            : [],
          painPoints: Array.isArray(data[0].pain_points) 
            ? data[0].pain_points.map(String) 
            : [],
          targetAudience: Array.isArray(data[0].target_audience) 
            ? data[0].target_audience.map(String) 
            : [],
          description: `${data[0].name} - Business Solution`
        };
        
        setSolutions(prev => [...prev, newSolution]);
        return true;
      }
    } catch (error) {
      console.error("Error adding solution:", error);
      toast.error("Failed to add solution");
    }
    return false;
  };

  const updateSolution = async (id: string, solutionData: {
    name: string;
    features: string[];
    useCases: string[];
    painPoints: string[];
    targetAudience: string[];
  }) => {
    try {
      const { error } = await supabase
        .from('solutions')
        .update({
          name: solutionData.name,
          features: solutionData.features,
          use_cases: solutionData.useCases,
          pain_points: solutionData.painPoints,
          target_audience: solutionData.targetAudience
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSolutions(solutions.map(s => s.id === id ? {
        ...s,
        name: solutionData.name,
        features: solutionData.features,
        useCases: solutionData.useCases,
        painPoints: solutionData.painPoints,
        targetAudience: solutionData.targetAudience,
      } : s));
      
      return true;
    } catch (error) {
      console.error("Error updating solution:", error);
      toast.error("Failed to update solution");
      return false;
    }
  };

  const deleteSolution = async (id: string) => {
    try {
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSolutions(solutions.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting solution:", error);
      toast.error("Failed to delete solution");
      return false;
    }
  };

  return {
    solutions,
    isLoading,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  };
}
