
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Solution } from '@/contexts/content-builder/types';

export function useSolutionsData() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setAvailableSolutions } = useContentBuilder();

  useEffect(() => {
    const fetchSolutions = async () => {
      setLoading(true);
      try {
        // This would typically be an API call
        // For demo purposes, we'll use static data
        const mockSolutions: Solution[] = [
          {
            id: '1',
            name: 'ContentAI Pro',
            features: [
              'AI-powered content creation',
              'SEO optimization tools',
              'Plagiarism checker',
              'Readability analysis'
            ],
            useCases: [
              'Blog writing',
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
              'Bloggers',
              'E-commerce businesses',
              'Digital agencies'
            ],
            benefits: [
              'Save 70% of content creation time',
              'Increase SEO rankings',
              'Improve content engagement',
              'Scale content production'
            ],
            description: 'An AI-powered content creation and optimization platform.',
            category: 'Content Creation',
            type: 'software',
            isConnected: true,
            logoUrl: 'https://via.placeholder.com/150',
            externalUrl: 'https://example.com/contentai',
            resources: [
              {
                title: 'Getting Started Guide',
                url: 'https://example.com/guide',
                type: 'documentation'
              },
              {
                title: 'Feature Overview',
                url: 'https://example.com/features',
                type: 'documentation'
              }
            ]
          },
          {
            id: '2',
            name: 'SEO Analyzer',
            features: [
              'Keyword research',
              'Competitor analysis',
              'Backlink monitoring',
              'Rank tracking'
            ],
            useCases: [
              'SEO strategy development',
              'Content optimization',
              'Competitive intelligence',
              'Performance reporting'
            ],
            painPoints: [
              'Low search rankings',
              'Difficulty identifying keywords',
              'Lack of SEO insights',
              'Time-consuming manual analysis'
            ],
            targetAudience: [
              'SEO specialists',
              'Digital marketers',
              'Content strategists',
              'Business owners'
            ],
            benefits: [
              'Improve search rankings',
              'Discover high-value keywords',
              'Track SEO performance',
              'Outrank competitors'
            ],
            description: 'A comprehensive SEO analysis and optimization platform.',
            category: 'SEO Tools',
            type: 'software',
            isConnected: true,
            logoUrl: 'https://via.placeholder.com/150',
            externalUrl: 'https://example.com/seoanalyzer',
            resources: [
              {
                title: 'SEO Guide',
                url: 'https://example.com/seo-guide',
                type: 'documentation'
              }
            ]
          },
          {
            id: '3',
            name: 'MarketingHub',
            features: [
              'Campaign management',
              'Email marketing',
              'Social media scheduling',
              'Analytics dashboard'
            ],
            useCases: [
              'Multi-channel marketing',
              'Lead generation',
              'Customer engagement',
              'Performance tracking'
            ],
            painPoints: [
              'Disjointed marketing tools',
              'Inconsistent messaging',
              'Poor campaign visibility',
              'Manual reporting'
            ],
            targetAudience: [
              'Marketing teams',
              'Campaign managers',
              'Small businesses',
              'Marketing agencies'
            ],
            benefits: [
              'Centralize marketing operations',
              'Improve campaign coordination',
              'Increase marketing ROI',
              'Save time with automation'
            ],
            description: 'All-in-one marketing platform for teams and businesses.',
            category: 'Marketing',
            type: 'platform',
            isConnected: false,
            logoUrl: 'https://via.placeholder.com/150',
            externalUrl: 'https://example.com/marketinghub',
            resources: [
              {
                title: 'Platform Overview',
                url: 'https://example.com/platform-overview',
                type: 'documentation'
              },
              {
                title: 'Case Studies',
                url: 'https://example.com/case-studies',
                type: 'case-study'
              }
            ]
          }
        ];

        setSolutions(mockSolutions);
        setAvailableSolutions(mockSolutions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load solutions');
        setLoading(false);
      }
    };

    fetchSolutions();
  }, [setAvailableSolutions]);

  const createSolution = async (solutionData: Omit<Solution, 'id'>) => {
    try {
      // In a real application, this would be an API call
      const newSolution: Solution = {
        ...solutionData,
        id: Date.now().toString(),
        type: solutionData.type || 'software',
        isConnected: solutionData.isConnected || false,
        resources: (solutionData.resources || []).map(resource => ({
          ...resource,
          type: resource.type || 'documentation'
        }))
      };

      setSolutions(prev => [...prev, newSolution]);
      setAvailableSolutions([...solutions, newSolution]);
      return { success: true, id: newSolution.id };
    } catch (error) {
      return { success: false, error: 'Failed to create solution' };
    }
  };

  const updateSolution = async (id: string, updates: Partial<Solution>) => {
    try {
      // In a real application, this would be an API call
      const updatedSolutions = solutions.map(solution =>
        solution.id === id ? { ...solution, ...updates } : solution
      );

      setSolutions(updatedSolutions);
      setAvailableSolutions(updatedSolutions);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update solution' };
    }
  };

  const deleteSolution = async (id: string) => {
    try {
      // In a real application, this would be an API call
      const filteredSolutions = solutions.filter(solution => solution.id !== id);
      
      setSolutions(filteredSolutions);
      setAvailableSolutions(filteredSolutions);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete solution' };
    }
  };

  const getSolutionById = (id: string) => {
    return solutions.find(solution => solution.id === id) || null;
  };

  return {
    solutions,
    loading,
    error,
    createSolution,
    updateSolution,
    deleteSolution,
    getSolutionById
  };
}
