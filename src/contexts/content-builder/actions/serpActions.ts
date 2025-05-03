
import { ContentBuilderState, ContentBuilderAction, SerpSelection } from '../types';
import { toast } from 'sonner';

/**
 * Actions related to SERP data analysis and selection
 */
export const createSerpActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  // Set SERP analysis results
  const setSerpAnalysisResults = (results: any) => {
    dispatch({ type: 'SET_SERP_ANALYSIS_RESULTS', payload: results });
  };

  // Set selected SERP keywords
  const setSerpKeywordsSelected = (keywords: SerpSelection[]) => {
    dispatch({ type: 'SET_SERP_KEYWORDS_SELECTED', payload: keywords });
  };

  // Set selected SERP questions
  const setSerpQuestionsSelected = (questions: SerpSelection[]) => {
    dispatch({ type: 'SET_SERP_QUESTIONS_SELECTED', payload: questions });
  };

  // Set analyzing state
  const setIsAnalyzing = (isAnalyzing: boolean) => {
    dispatch({ type: 'SET_IS_ANALYZING', payload: isAnalyzing });
  };

  // Generate outline from SERP selections
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
    const outlineSections = [
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
    
    // Enhanced solution-specific sections if solution is selected
    if (state.selectedSolution) {
      // Add section about the solution
      outlineSections.push({
        id: crypto.randomUUID(),
        title: `How ${state.selectedSolution.name} Solves Your ${state.mainKeyword} Challenges`
      });
      
      // Add section about solution benefits
      outlineSections.push({
        id: crypto.randomUUID(),
        title: `Key Benefits of Using ${state.selectedSolution.name}`
      });
      
      // Add section about features if they exist
      if (state.selectedSolution.features && state.selectedSolution.features.length > 0) {
        outlineSections.push({
          id: crypto.randomUUID(),
          title: `Essential Features of ${state.selectedSolution.name}`
        });
      }
      
      // Add use case section if they exist
      if (state.selectedSolution.useCases && state.selectedSolution.useCases.length > 0) {
        outlineSections.push({
          id: crypto.randomUUID(),
          title: `Real-World Use Cases for ${state.selectedSolution.name}`
        });
      }
      
      // Add a customer testimonial section placeholder
      outlineSections.push({
        id: crypto.randomUUID(),
        title: `Success Stories: Real Results with ${state.selectedSolution.name}`
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
  
  // Helper function to navigate between steps (defined here to avoid circular dependency)
  const navigateToStep = (step: number) => {
    if (step >= 0 && step < state.steps.length) {
      dispatch({ type: 'SET_ACTIVE_STEP', payload: step });
    }
  };

  return {
    setSerpAnalysisResults,
    setSerpKeywordsSelected,
    setSerpQuestionsSelected,
    setIsAnalyzing,
    generateOutlineFromSelections
  };
};
