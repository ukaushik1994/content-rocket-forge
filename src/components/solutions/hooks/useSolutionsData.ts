
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/contexts/content-builder/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Validation functions
const validateSolutionData = (data: any): boolean => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return false;
  }
  
  if (!Array.isArray(data.features) || 
      !Array.isArray(data.useCases) || 
      !Array.isArray(data.painPoints) || 
      !Array.isArray(data.targetAudience)) {
    return false;
  }
  
  return true;
};

export function useSolutionsData() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch solutions with improved error handling and retry mechanism
  const fetchSolutions = useCallback(async (retryCount = 0): Promise<Solution[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Transform the data from jsonb columns to the expected format with validation
        const formattedSolutions: Solution[] = data
          .filter(solution => solution && typeof solution === 'object')
          .map(solution => ({
            id: String(solution.id || ''),
            name: String(solution.name || ''),
            features: Array.isArray(solution.features) 
              ? solution.features.filter(f => f).map(f => String(f)) 
              : [],
            useCases: Array.isArray(solution.use_cases) 
              ? solution.use_cases.filter(u => u).map(u => String(u)) 
              : [],
            painPoints: Array.isArray(solution.pain_points) 
              ? solution.pain_points.filter(p => p).map(p => String(p)) 
              : [],
            targetAudience: Array.isArray(solution.target_audience) 
              ? solution.target_audience.filter(a => a).map(a => String(a)) 
              : [],
            description: `${solution.name || 'Unnamed Solution'} - Business Solution`, // Default description
            category: solution.category || "Business Solution", // Now using the DB column with fallback
            logoUrl: solution.logo_url,
            externalUrl: solution.external_url,
            benefits: [], // Empty benefits array
            tags: [],     // Empty tags array
            resources: Array.isArray(solution.resources) 
              ? solution.resources.map(resource => {
                  if (typeof resource === 'object' && resource !== null && 'title' in resource && 'url' in resource) {
                    return {
                      title: String(resource.title || ''),
                      url: String(resource.url || '')
                    };
                  }
                  return { title: '', url: '' };
                }).filter(r => r.title && r.url) 
              : []
          }));
          
        setSolutions(formattedSolutions);
        return formattedSolutions;
      }
    } catch (error: any) {
      console.error("Error fetching solutions:", error);
      setError(error.message || 'Failed to load solutions');
      
      // Implement retry mechanism for transient errors
      if (retryCount < 2) {
        toast.error(`Loading failed. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchSolutions(retryCount + 1), 1000 * Math.pow(2, retryCount));
        return [];
      }
      
      toast.error("Failed to load solutions. Please try again later.");
      
      // Fallback to some default data if there's an error
      const fallbackSolution = {
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"],
        category: "Business Solution", // Default category value
        logoUrl: null,
        externalUrl: null,
        benefits: [], // Empty benefits array
        tags: [],     // Empty tags array
        resources: []
      };
      
      setSolutions([fallbackSolution]);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, []);

  const addSolution = useCallback(async (solutionData: {
    name: string;
    features: string[];
    useCases: string[];
    painPoints: string[];
    targetAudience: string[];
    externalUrl?: string | null;
    resources?: Array<{ title: string; url: string; }>;
    category?: string; // Category parameter
  }, logoUrl?: string): Promise<boolean> => {
    // Input validation
    if (!solutionData.name || solutionData.name.trim() === '') {
      toast.error("Solution name is required");
      return false;
    }
    
    try {
      // Use the authenticated user ID if available
      if (!user) {
        toast.error("You must be logged in to add solutions");
        return false;
      }
      
      // Data sanitization
      const sanitizedData = {
        name: solutionData.name.trim(),
        features: solutionData.features.filter(f => f && f.trim() !== ''),
        use_cases: solutionData.useCases.filter(u => u && u.trim() !== ''),
        pain_points: solutionData.painPoints.filter(p => p && p.trim() !== ''),
        target_audience: solutionData.targetAudience.filter(a => a && a.trim() !== ''),
        external_url: solutionData.externalUrl || null,
        logo_url: logoUrl || null,
        resources: solutionData.resources || [],
        category: solutionData.category || "Business Solution", // Use provided category or default
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('solutions')
        .insert(sanitizedData)
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
          description: `${data[0].name} - Business Solution`,
          category: data[0].category || "Business Solution", // Using category from data
          logoUrl: data[0].logo_url,
          externalUrl: data[0].external_url,
          benefits: [], // Adding empty benefits array
          tags: [],     // Adding empty tags array
          resources: Array.isArray(data[0].resources) 
            ? data[0].resources.map((resource: any) => {
                if (typeof resource === 'object' && resource !== null && 'title' in resource && 'url' in resource) {
                  return {
                    title: String(resource.title || ''),
                    url: String(resource.url || '')
                  };
                }
                return { title: '', url: '' };
              }).filter((r: any) => r.title && r.url)
            : []
        };
        
        setSolutions(prev => [...prev, newSolution]);
        return true;
      }
    } catch (error: any) {
      console.error("Error adding solution:", error);
      toast.error(error.message || "Failed to add solution");
    }
    return false;
  }, [user]);

  const updateSolution = useCallback(async (id: string, solutionData: {
    name: string;
    features: string[];
    useCases: string[];
    painPoints: string[];
    targetAudience: string[];
    externalUrl?: string | null;
    resources?: Array<{ title: string; url: string; }>;
    category?: string; // Category parameter
  }, logoUrl?: string): Promise<boolean> => {
    // Input validation
    if (!solutionData.name || solutionData.name.trim() === '') {
      toast.error("Solution name is required");
      return false;
    }
    
    try {
      if (!user) {
        toast.error("You must be logged in to update solutions");
        return false;
      }
      
      // Data sanitization
      const sanitizedData = {
        name: solutionData.name.trim(),
        features: solutionData.features.filter(f => f && f.trim() !== ''),
        use_cases: solutionData.useCases.filter(u => u && u.trim() !== ''),
        pain_points: solutionData.painPoints.filter(p => p && p.trim() !== ''),
        target_audience: solutionData.targetAudience.filter(a => a && a.trim() !== ''),
        external_url: solutionData.externalUrl || null,
        resources: solutionData.resources || [],
        category: solutionData.category || "Business Solution" // Using category with default
      };
      
      // Only update logo_url if a new one is provided
      if (logoUrl !== undefined) {
        sanitizedData['logo_url'] = logoUrl;
      }
      
      const { error } = await supabase
        .from('solutions')
        .update(sanitizedData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setSolutions(solutions.map(s => s.id === id ? {
        ...s,
        name: solutionData.name,
        features: solutionData.features,
        useCases: solutionData.useCases,
        painPoints: solutionData.painPoints,
        targetAudience: solutionData.targetAudience,
        category: solutionData.category || s.category || "Business Solution", // Update category
        logoUrl: logoUrl !== undefined ? logoUrl : s.logoUrl,
        externalUrl: solutionData.externalUrl || null,
        benefits: s.benefits || [], // Preserve or init empty benefits array
        tags: s.tags || [],         // Preserve or init empty tags array
        resources: solutionData.resources || []
      } : s));
      
      return true;
    } catch (error: any) {
      console.error("Error updating solution:", error);
      toast.error(error.message || "Failed to update solution");
      return false;
    }
  }, [solutions, user]);

  const deleteSolution = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (!user) {
        toast.error("You must be logged in to delete solutions");
        return false;
      }
      
      // Get the solution to delete (to get the logo URL)
      const solutionToDelete = solutions.find(s => s.id === id);
      
      const { error } = await supabase
        .from('solutions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // If there's a logo, delete it from storage
      if (solutionToDelete?.logoUrl) {
        // Extract the filename from the URL
        const logoPath = solutionToDelete.logoUrl.split('/').pop();
        if (logoPath) {
          const { error: storageError } = await supabase.storage
            .from('solution-logos')
            .remove([logoPath]);
            
          if (storageError) {
            console.error("Error deleting logo:", storageError);
          }
        }
      }
      
      setSolutions(solutions.filter(s => s.id !== id));
      return true;
    } catch (error: any) {
      console.error("Error deleting solution:", error);
      toast.error(error.message || "Failed to delete solution");
      return false;
    }
  }, [solutions, user]);

  // Memoize solutions to prevent unnecessary re-renders
  const memoizedSolutions = useMemo(() => solutions, [solutions]);

  return {
    solutions: memoizedSolutions,
    isLoading,
    error,
    fetchSolutions,
    addSolution,
    updateSolution,
    deleteSolution
  };
}
