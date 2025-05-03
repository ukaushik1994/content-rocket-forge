
import { ContentBuilderState, ContentBuilderAction, SerpSelection, ContentOutlineSection, ContentType } from './types';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const createContentBuilderActions = (state: ContentBuilderState, dispatch: React.Dispatch<ContentBuilderAction>) => {
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

  // Helper function to set primary keyword
  const setPrimaryKeyword = (keyword: string) => {
    dispatch({ type: 'SET_PRIMARY_KEYWORD', payload: keyword });
  };

  // Helper function to add secondary keyword
  const addSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'ADD_SECONDARY_KEYWORD', payload: keyword });
  };

  // Helper function to remove secondary keyword
  const removeSecondaryKeyword = (keyword: string) => {
    dispatch({ type: 'REMOVE_SECONDARY_KEYWORD', payload: keyword });
  };

  // Helper function to set keyword clusters
  const setKeywordClusters = (clusters: { [key: string]: string[] }) => {
    dispatch({ type: 'SET_KEYWORD_CLUSTERS', payload: clusters });
  };

  // Helper function to set content type - Fixed type to match ContentType
  const setContentType = (contentType: ContentType) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: contentType });
  };

  // Helper function to set content format
  const setContentFormat = (format: string) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };

  // Helper function to set outline title
  const setOutlineTitle = (title: string) => {
    dispatch({ type: 'SET_OUTLINE_TITLE', payload: title });
  };

  // Helper function to set outline sections
  const setOutlineSections = (sections: { id: string; heading: string; content: string }[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
  };

  // Helper function to set SERP analysis results
  const setSerpAnalysisResults = (results: any) => {
    dispatch({ type: 'SET_SERP_ANALYSIS_RESULTS', payload: results });
  };

  // Helper function to set selected SERP keywords
  const setSerpKeywordsSelected = (keywords: SerpSelection[]) => {
    dispatch({ type: 'SET_SERP_KEYWORDS_SELECTED', payload: keywords });
  };

  // Helper function to set selected SERP questions
  const setSerpQuestionsSelected = (questions: SerpSelection[]) => {
    dispatch({ type: 'SET_SERP_QUESTIONS_SELECTED', payload: questions });
  };

  // Helper function to set analyzing state
  const setIsAnalyzing = (isAnalyzing: boolean) => {
    dispatch({ type: 'SET_IS_ANALYZING', payload: isAnalyzing });
  };

  // Helper function to set content
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
  };

  // Helper function to add content from SERP
  const addContentFromSerp = (content: string, type: string) => {
    // Add content to the current draft, we'll use this in the editor step
    dispatch({ type: 'SET_CONTENT', payload: state.content + '\n\n' + content });
    toast.success(`Added ${type} to your content draft`);
  };

  // Helper function to save content as draft
  const saveContentAsDraft = async () => {
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to save content');
        return false;
      }
      
      // Prepare content data
      const contentData = {
        title: state.contentTitle || `Content about ${state.primaryKeyword || state.mainKeyword}`,
        content: state.content,
        status: 'draft',
        seo_score: state.seoScore || 0,
        user_id: user.id
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('content_items')
        .insert(contentData)
        .select('id')
        .single();
        
      if (error) {
        throw error;
      }
      
      // Add keywords if available
      if ((state.selectedKeywords && state.selectedKeywords.length > 0) || state.primaryKeyword) {
        const allKeywords = [...(state.selectedKeywords || [])];
        
        if (state.primaryKeyword && !allKeywords.includes(state.primaryKeyword)) {
          allKeywords.push(state.primaryKeyword);
        }
        
        if (state.mainKeyword && !allKeywords.includes(state.mainKeyword)) {
          allKeywords.push(state.mainKeyword);
        }
        
        // Create and link keywords
        for (const keyword of allKeywords) {
          // First check if keyword exists
          const { data: existingKeyword, error: keywordError } = await supabase
            .from('keywords')
            .select('id')
            .eq('keyword', keyword)
            .eq('user_id', user.id)
            .single();
            
          if (keywordError && keywordError.code !== 'PGRST116') {
            console.error('Error checking keyword:', keywordError);
            continue;
          }
          
          let keywordId;
          
          if (!existingKeyword) {
            // Create keyword if it doesn't exist
            const { data: newKeyword, error: createError } = await supabase
              .from('keywords')
              .insert({ keyword, user_id: user.id })
              .select('id')
              .single();
              
            if (createError) {
              console.error('Error creating keyword:', createError);
              continue;
            }
            
            keywordId = newKeyword.id;
          } else {
            keywordId = existingKeyword.id;
          }
          
          // Link keyword to content
          await supabase
            .from('content_keywords')
            .insert({
              content_id: data.id,
              keyword_id: keywordId
            });
        }
      }
      
      toast.success('Content saved as draft');
      return data.id;
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(`Failed to save content: ${error.message}`);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };

  // Helper function to publish content
  const publishContent = async () => {
    try {
      dispatch({ type: 'SET_IS_PUBLISHING', payload: true });
      
      // First save as draft to get the id
      const contentId = await saveContentAsDraft();
      
      if (!contentId) {
        throw new Error('Failed to save content before publishing');
      }
      
      // Update status to published
      const { error } = await supabase
        .from('content_items')
        .update({ status: 'published' })
        .eq('id', contentId);
        
      if (error) {
        throw error;
      }
      
      toast.success('Content published successfully!');
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.activeStep });
      return contentId;
    } catch (error: any) {
      console.error('Error publishing content:', error);
      toast.error(`Failed to publish content: ${error.message}`);
      return false;
    } finally {
      dispatch({ type: 'SET_IS_PUBLISHING', payload: false });
    }
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

  return {
    analyzeKeyword,
    navigateToStep,
    setPrimaryKeyword,
    addSecondaryKeyword,
    removeSecondaryKeyword,
    setKeywordClusters,
    setContentType,
    setContentFormat,
    setOutlineTitle,
    setOutlineSections,
    setSerpAnalysisResults,
    setSerpKeywordsSelected,
    setSerpQuestionsSelected,
    setIsAnalyzing,
    setContent,
    addContentFromSerp,
    generateOutlineFromSelections,
    saveContentAsDraft,
    publishContent
  };
};
