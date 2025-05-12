import { ContentBuilderState, ContentBuilderAction } from './types';
import { ContentType, ContentFormat, ContentIntent } from './types/content-types';
import { ContentCluster } from './types/cluster-types';
import { Solution, SolutionIntegrationMetrics } from './types/solution-types';
import { OutlineSection } from './types/outline-types';
import { generateContent } from '@/components/content-builder/steps/writing/ContentGenerationService';
import { AiProvider } from '@/services/aiService/types';

// Replace the import with inline function to avoid the missing module
const analyzeSolution = (
  content: string,
  solution: Solution
): { score: number; details: any } => {
  // This is a placeholder implementation
  // In a real implementation, this would use NLP to analyze how well the solution is integrated
  
  // Check if solution name is mentioned in content
  const nameMentioned = content.toLowerCase().includes(solution.name.toLowerCase());
  
  // Check if features are mentioned
  const featureMentions = solution.features.filter(feature => 
    content.toLowerCase().includes(feature.toLowerCase())
  );
  
  // Calculate a basic score
  const nameScore = nameMentioned ? 25 : 0;
  const featureScore = Math.min(75, featureMentions.length / solution.features.length * 75);
  const totalScore = nameScore + featureScore;
  
  return {
    score: Math.round(totalScore),
    details: {
      nameMentioned,
      featureMentions,
      featureCoverage: `${Math.round(featureMentions.length / solution.features.length * 100)}%`
    }
  };
};

export const createContentBuilderActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  
  // --- Navigation Actions ---
  const navigateToStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    dispatch({ type: 'MARK_STEP_VISITED', payload: step });
  };
  
  // --- Keyword Actions ---
  const setMainKeyword = (keyword: string) => {
    dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
    // Once we have a keyword, we can mark the first step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
  };
  
  const addKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_KEYWORD', payload: keyword });
  };
  
  const removeKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_KEYWORD', payload: keyword });
  };
  
  // --- SERP Actions ---
  const analyzeKeyword = async (keyword: string, regions: string[] = ['us']) => {
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // Add to searched keywords
      dispatch({ type: 'ADD_SEARCHED_KEYWORD', payload: keyword });
      
      // This would be an API call in a real app
      // For now, we'll just simulate a delay and return mock SERP data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSerpData = {
        keyword: keyword,
        searchVolume: Math.floor(Math.random() * 10000),
        competition: Math.random(),
        cpc: (Math.random() * 5).toFixed(2),
        results: [],
        entities: [],
        questions: [],
        relatedKeywords: [],
        snippets: []
      };
      
      dispatch({ type: 'SET_SERP_DATA', payload: mockSerpData });
      
      // Mark SERP analysis step as completed
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 2 });
      
      return mockSerpData;
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  const addContentFromSerp = (content: string, type: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  const generateOutlineFromSelections = () => {
    const { serpSelections } = state;
    
    // Filter selected items
    const selectedItems = serpSelections.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      console.warn('No items selected from SERP to generate outline');
      return;
    }
    
    // Create an outline based on selected items
    // This is a simplified version, in a real app this would be more sophisticated
    const outlineItems = selectedItems
      .filter(item => item.type === 'heading' || item.type === 'question')
      .map(item => item.content)
      .slice(0, 10);
    
    dispatch({ type: 'SET_OUTLINE', payload: outlineItems });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  // --- Content Type Actions ---
  const setContentType = (contentType: ContentType) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: contentType });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
  };
  
  const setContentFormat = (contentFormat: ContentFormat) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: contentFormat });
  };
  
  const setContentIntent = (contentIntent: ContentIntent) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: contentIntent });
  };
  
  // --- Solution Actions ---
  const selectSolution = (solution: Solution | null) => {
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
  };
  
  const setSolutionIntegrationMetrics = (metrics: SolutionIntegrationMetrics) => {
    dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: metrics });
  };
  
  // --- Outline Actions ---
  const setOutline = (outline: string[] | OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: outline });
    // Mark outline step as completed when we set an outline
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const setOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };
  
  // --- Content Generation Actions ---
  const generateContent = async (outline: OutlineSection[]) => {
    dispatch({ type: 'SET_IS_GENERATING', payload: true });
    
    try {
      // We would integrate with AI service here
      // For now, just create a placeholder content
      const outlineText = outline
        .map((section, idx) => `## ${section.title}\n\nContent for section ${idx + 1} would go here.\n\n`)
        .join('');
      
      const generatedContent = `# Article about ${state.mainKeyword}\n\n${outlineText}`;
      
      dispatch({ type: 'SET_CONTENT', payload: generatedContent });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
      
      return generatedContent;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };
  
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
  };
  
  const updateContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };
  
  // --- Cluster Actions ---
  const selectCluster = (cluster: ContentCluster | null) => {
    dispatch({ type: 'SELECT_CLUSTER', payload: cluster });
  };
  
  // --- Title Actions ---
  const setContentTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };
  
  // --- SEO Actions ---
  const analyzeSeo = async (content: string) => {
    dispatch({ type: 'SET_IS_GENERATING', payload: true });
    
    try {
      // In a real app, this would call an SEO analysis service
      // For now, we'll just simulate a delay and return mock SEO data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate a random SEO score
      const score = Math.floor(Math.random() * 30) + 70;
      dispatch({ type: 'SET_SEO_SCORE', payload: score });
      
      // Generate some mock SEO improvements
      const improvements = [
        {
          id: '1',
          title: 'Add more internal links',
          description: 'Your content could benefit from additional internal links to other relevant pages.',
          priority: 'medium',
          applied: false,
          suggestion: 'Add 2-3 internal links to related articles.',
          type: 'links',
          recommendation: 'Add more internal links',
          impact: 'medium' as const
        },
        {
          id: '2',
          title: 'Improve keyword density',
          description: `The main keyword "${state.mainKeyword}" appears too infrequently.`,
          priority: 'high',
          applied: false,
          suggestion: `Try to mention "${state.mainKeyword}" a few more times naturally throughout the content.`,
          type: 'keywords',
          recommendation: 'Improve keyword density',
          impact: 'high' as const
        },
        {
          id: '3',
          title: 'Add more headings',
          description: 'Break up your content with additional subheadings for better readability.',
          priority: 'low',
          applied: false,
          suggestion: 'Add H3 subheadings to break up longer sections.',
          type: 'structure',
          recommendation: 'Add more headings',
          impact: 'low' as const
        }
      ];
      
      dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: improvements });
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
      
      return { score, improvements };
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };
  
  const applySeoImprovement = (id: string) => {
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
  };
  
  const skipOptimizationStep = () => {
    dispatch({ type: 'SKIP_OPTIMIZATION_STEP' });
  };
  
  // --- Meta Actions ---
  const setMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };
  
  const setMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };
  
  // --- Region Actions ---
  const setSelectedRegions = (regions: string[]) => {
    dispatch({ type: 'SET_SELECTED_REGIONS', payload: regions });
  };
  
  // --- Instructions Actions ---
  const setAdditionalInstructions = (instructions: string) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
  };
  
  // --- Advanced Content Actions ---
  const saveContentToDraft = async (options: any) => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // This would be an API call in a real app
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const draftId = `draft_${Date.now()}`;
      
      return draftId;
    } catch (error) {
      console.error('Error saving content to draft:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  const saveContentToPublished = async (options: any) => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // This would be an API call in a real app
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const contentId = `content_${Date.now()}`;
      
      return contentId;
    } catch (error) {
      console.error('Error publishing content:', error);
      return null;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  // Return all actions
  return {
    // Navigation
    navigateToStep,
    
    // Keywords
    setMainKeyword,
    addKeyword,
    removeKeyword,
    
    // SERP
    analyzeKeyword,
    addContentFromSerp,
    generateOutlineFromSelections,
    
    // Content Type
    setContentType,
    setContentFormat,
    setContentIntent,
    
    // Solution
    selectSolution,
    setSolutionIntegrationMetrics,
    
    // Outline
    setOutline,
    setOutlineSections,
    
    // Content
    generateContent,
    setContent,
    updateContent,
    
    // Cluster
    selectCluster,
    
    // Title
    setContentTitle,
    
    // SEO
    analyzeSeo,
    applySeoImprovement,
    skipOptimizationStep,
    
    // Meta
    setMetaTitle,
    setMetaDescription,
    
    // Regions
    setSelectedRegions,
    
    // Instructions
    setAdditionalInstructions,
    
    // Advanced Content
    saveContentToDraft,
    saveContentToPublished
  };
};
