
import { useState, useCallback } from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { toast } from 'sonner';

/**
 * Custom hook to manage solutions data
 */
export function useSolutionsData() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch solutions from API or use mock data
   */
  const fetchSolutions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Replace with actual API call when ready
      // For now, use mock data with a small delay to simulate API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = [
        {
          id: '1',
          name: 'Content Marketing Platform',
          description: 'All-in-one solution for content creation and distribution',
          features: ['AI content generation', 'SEO optimization', 'Content calendar'],
          useCases: ['Marketing teams', 'Content creators'],
          painPoints: ['Time-consuming content creation', 'Poor SEO performance'],
          targetAudience: ['Marketing managers', 'Content strategists'],
          category: 'Marketing', // Added required category
          logoUrl: '',
          externalUrl: '',
          resources: [
            { title: 'Getting Started', url: '#' },
            { title: 'Case Study', url: '#' }
          ]
        },
        {
          id: '2',
          name: 'SEO Analytics Suite',
          description: 'Comprehensive SEO tracking and optimization tools',
          features: ['Keyword tracking', 'Competitor analysis', 'Backlink monitoring'],
          useCases: ['SEO agencies', 'Marketing departments'],
          painPoints: ['Lack of visibility into SEO performance', 'Manual reporting'],
          targetAudience: ['SEO specialists', 'Digital marketers'],
          category: 'Analytics', // Added required category
          logoUrl: '',
          externalUrl: '',
          resources: []
        }
      ];
      
      setSolutions(mockData);
    } catch (err) {
      console.error('Error fetching solutions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch solutions'));
      toast.error('Failed to load solutions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new solution
   */
  const addSolution = useCallback(async (solution: Omit<Solution, 'id'>) => {
    try {
      // Create new solution with ID
      const newSolution: Solution = {
        ...solution,
        id: `sol_${Date.now()}`,
        // Ensure category has a value even if not provided
        category: solution.category || 'Other',
        resources: solution.resources || []
      };
      
      setSolutions(prev => [...prev, newSolution]);
      toast.success('Solution added successfully');
      return newSolution.id;
    } catch (err) {
      console.error('Error adding solution:', err);
      toast.error('Failed to add solution');
      throw err;
    }
  }, []);

  /**
   * Update an existing solution
   */
  const updateSolution = useCallback(async (id: string, solution: Partial<Solution>) => {
    try {
      setSolutions(prev => 
        prev.map(sol => 
          sol.id === id 
            ? { 
                ...sol, 
                ...solution,
                // Ensure category has a value even if not provided
                category: solution.category || sol.category || 'Other'
              } 
            : sol
        )
      );
      toast.success('Solution updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating solution:', err);
      toast.error('Failed to update solution');
      return false;
    }
  }, []);

  /**
   * Delete a solution by id
   */
  const deleteSolution = useCallback(async (id: string) => {
    try {
      setSolutions(prev => prev.filter(sol => sol.id !== id));
      toast.success('Solution deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting solution:', err);
      toast.error('Failed to delete solution');
      return false;
    }
  }, []);

  return {
    solutions,
    isLoading,
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  };
}
