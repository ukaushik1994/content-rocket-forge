import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';

export function useSolutionsData() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { dispatch } = useContentBuilder();

  // Mock solutions data
  const mockSolutions = [
    {
      id: '1',
      name: 'ContentPro AI',
      description: 'AI-powered content optimization platform that helps marketers create high-performing content.',
      features: [
        'AI content generation',
        'SEO optimization',
        'Performance analytics',
        'Content calendaring',
        'Automated publishing'
      ],
      useCases: [
        'Blog post creation',
        'Product descriptions',
        'Social media content',
        'Email newsletters'
      ],
      painPoints: [
        'Time-consuming content creation',
        'SEO optimization challenges',
        'Maintaining consistent quality',
        "Writer's block" // Fixed straight single quote
      ],
      targetAudience: [
        'Content marketers',
        'SEO specialists',
        'Small business owners',
        'Marketing teams'
      ],
      benefits: [
        '60% faster content creation',
        'Improved search rankings',
        'Higher engagement rates',
        'Consistent brand voice'
      ],
      category: 'Content Marketing',
      type: 'Software',
      isConnected: true,
      logoUrl: '/images/solutions/contentpro.png',
      externalUrl: 'https://example.com/contentpro',
      resources: []
    },
    // ... other mock solutions
  ];

  // Simulated API operations
  const fetchSolutions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSolutions(mockSolutions);
      
      // Update available solutions in context
      dispatch({ 
        type: 'SET_AVAILABLE_SOLUTIONS',
        payload: mockSolutions
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load solutions');
      setLoading(false);
    }
  };

  // Create a solution
  const addSolution = async (solutionData: Omit<Solution, 'id'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a fake ID
      const newSolution = {
        id: `solution-${Date.now()}`,
        ...solutionData
      };
      
      setSolutions(prev => [...prev, newSolution]);
      
      // Update available solutions in context
      dispatch({ 
        type: 'SET_AVAILABLE_SOLUTIONS',
        payload: [...solutions, newSolution]
      });
      
      return { success: true, id: newSolution.id };
    } catch (err) {
      return { success: false, error: 'Failed to create solution' };
    }
  };

  // Update a solution
  const updateSolution = async (id: string, updates: Partial<Solution>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSolutions(prev => 
        prev.map(solution => 
          solution.id === id ? { ...solution, ...updates } : solution
        )
      );
      
      // Update available solutions in context
      dispatch({ 
        type: 'SET_AVAILABLE_SOLUTIONS',
        payload: solutions.map(solution => 
          solution.id === id ? { ...solution, ...updates } : solution
        )
      });
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to update solution' };
    }
  };

  // Delete a solution
  const deleteSolution = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setSolutions(prev => prev.filter(solution => solution.id !== id));
      
      // Update available solutions in context
      dispatch({ 
        type: 'SET_AVAILABLE_SOLUTIONS',
        payload: solutions.filter(solution => solution.id !== id)
      });
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete solution' };
    }
  };

  // Get solution by ID
  const getSolutionById = (id: string) => {
    return solutions.find(solution => solution.id === id) || null;
  };

  // Load solutions on mount
  useEffect(() => {
    fetchSolutions();
  }, []);

  return {
    solutions,
    loading,
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution,
    getSolutionById
  };
}
