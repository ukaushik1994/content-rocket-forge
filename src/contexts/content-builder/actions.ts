
import { SerpSelection, ContentOutlineSection } from './types';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { toast } from 'sonner';

export const createContentBuilderActions = (state: any, dispatch: any) => {
  // Helper function to analyze keyword
  const analyzeKeyword = async (keyword: string) => {
    if (!keyword) {
      toast.error('Please enter a keyword to analyze');
      return;
    }

    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    try {
      const data = await analyzeKeywordSerp(keyword);
      dispatch({ type: 'SET_SERP_DATA', payload: data });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      toast.success(`Analysis completed for: ${keyword}`);
    } catch (error) {
      console.error('Error analyzing keyword:', error);
      toast.error('Failed to analyze keyword. Please try again.');
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };

  // Helper function to navigate between steps
  const navigateToStep = (step: number) => {
    if (step >= 0 && step < state.steps.length) {
      dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
    }
  };

  // Helper function to add content from SERP
  const addContentFromSerp = (content: string, type: string) => {
    // Add content to the current draft, we'll use this in the editor step
    dispatch({ type: 'SET_CONTENT', payload: state.content + '\n\n' + content });
    toast.success(`Added ${type} to your content draft`);
  };

  // Helper function to generate outline from selections
  const generateOutlineFromSelections = () => {
    // Generate outline based on selected SERP items
    const selectedItems = state.serpSelections.filter((item: SerpSelection) => item.selected);
    
    if (selectedItems.length === 0) {
      toast.warning('Please select some items from the SERP analysis first');
      return;
    }
    
    // Group selected items by type
    const questionItems = selectedItems.filter(item => item.type === 'question');
    const keywordItems = selectedItems.filter(item => item.type === 'keyword');
    const snippetItems = selectedItems.filter(item => item.type === 'snippet');
    
    // Generate a title based on main keyword
    const title = `Ultimate Guide to ${state.mainKeyword}`;
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
    
    // Create outline sections based on selected items
    const outlineSections: ContentOutlineSection[] = [
      { id: crypto.randomUUID(), title: `Introduction to ${state.mainKeyword}` }
    ];
    
    // Add sections for keywords
    if (keywordItems.length > 0) {
      keywordItems.forEach(item => {
        outlineSections.push({
          id: crypto.randomUUID(),
          title: item.content.charAt(0).toUpperCase() + item.content.slice(1)
        });
      });
    }
    
    // Add FAQ section if questions exist
    if (questionItems.length > 0) {
      outlineSections.push({
        id: crypto.randomUUID(),
        title: 'Frequently Asked Questions',
        subsections: questionItems.map(item => ({
          id: crypto.randomUUID(),
          title: item.content
        }))
      });
    }
    
    // If solution is selected, add solution-specific sections
    if (state.selectedSolution) {
      outlineSections.push({
        id: crypto.randomUUID(),
        title: `How ${state.selectedSolution.name} Solves Your ${state.mainKeyword} Challenges`
      });
      
      outlineSections.push({
        id: crypto.randomUUID(),
        title: `Key Benefits of Using ${state.selectedSolution.name}`
      });
    }
    
    // Add conclusion
    outlineSections.push({ 
      id: crypto.randomUUID(), 
      title: 'Conclusion' 
    });
    
    dispatch({ type: 'SET_OUTLINE', payload: outlineSections });
    toast.success('Outline generated from selected items');
    
    // Mark outline step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    
    // Navigate to the outline step
    navigateToStep(3);
  };

  return {
    analyzeKeyword,
    navigateToStep,
    addContentFromSerp,
    generateOutlineFromSelections
  };
};
