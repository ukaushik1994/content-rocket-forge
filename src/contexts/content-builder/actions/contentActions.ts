
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { OutlineSection } from '../types/outline-types';
import { ContentType, ContentFormat, ContentIntent } from '../types/content-types';
import { Solution } from '../types/solution-types';
import { toast } from 'sonner';

export const createContentActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const setContentType = (contentType: ContentType) => {
    dispatch({ type: 'SET_CONTENT_TYPE', payload: contentType });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
  };
  
  const setContentFormat = (format: ContentFormat) => {
    dispatch({ type: 'SET_CONTENT_FORMAT', payload: format });
  };
  
  const setContentIntent = (intent: ContentIntent) => {
    dispatch({ type: 'SET_CONTENT_INTENT', payload: intent });
  };
  
  const setOutline = (outline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: outline });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const setOutlineSections = (sections: OutlineSection[]) => {
    dispatch({ type: 'SET_OUTLINE_SECTIONS', payload: sections });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  const updateContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
    
    // Mark content writing step as completed if there's enough content
    if (content && content.length >= 300) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  };
  
  const setContent = (content: string) => {
    dispatch({ type: 'SET_CONTENT', payload: content });
    
    // Mark content writing step as completed if there's enough content
    if (content && content.length >= 300) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
  };

  const setSelectedSolution = (solution: Solution | null) => {
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
  };

  const generateContent = async (outline: OutlineSection[]): Promise<void> => {
    if (!state.mainKeyword) {
      toast.error("Main keyword is required to generate content");
      return;
    }
    
    dispatch({ type: 'SET_IS_GENERATING', payload: true });
    
    try {
      // In a real implementation, this would call an AI service
      // For now we'll simulate content generation with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate placeholder content based on outline
      const content = generatePlaceholderContent(outline, state.mainKeyword);
      
      // Set the generated content
      dispatch({ type: 'SET_CONTENT', payload: content });
      
      // Mark content writing step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
      
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error("Failed to generate content");
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };
  
  const saveContent = async (options: { title: string; content: string }): Promise<boolean> => {
    if (!options.title || !options.content) {
      toast.error("Title and content are required");
      return false;
    }
    
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would save to a database
      // For now we'll just simulate saving with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set title and content
      dispatch({ type: 'SET_CONTENT_TITLE', payload: options.title });
      dispatch({ type: 'SET_CONTENT', payload: options.content });
      
      // Mark save step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
      
      toast.success("Content saved successfully");
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content");
      return false;
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  const setAdditionalInstructions = (instructions: string) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
  };
  
  const setContentTitle = (title: string) => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
  };
  
  const setSuggestedTitles = (titles: string[]) => {
    dispatch({ type: 'SET_SUGGESTED_TITLES', payload: titles });
  };
  
  const setMetaTitle = (title: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: title });
  };
  
  const setMetaDescription = (description: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: description });
  };
  
  // Helper function to generate placeholder content with improved structure
  const generatePlaceholderContent = (outline: OutlineSection[], mainKeyword: string): string => {
    let content = `# Complete Guide to ${mainKeyword}\n\n`;
    
    // Add introduction
    content += `## Introduction\n\nThis comprehensive guide explores ${mainKeyword} in detail. We'll cover everything you need to know about this topic and provide valuable insights to help you understand it better.\n\n`;
    
    // Add sections from outline
    outline.forEach(section => {
      content += `## ${section.title}\n\n`;
      content += `This section discusses ${section.title.toLowerCase()}. It covers important aspects of ${mainKeyword} related to this topic and provides practical guidance.\n\n`;
      
      // Add some subsections if this is a major section
      if (section.level <= 2) {
        content += `### Key Aspects of ${section.title}\n\n`;
        content += `Here we explore the most important elements of ${section.title.toLowerCase()} as they relate to ${mainKeyword}.\n\n`;
        
        content += `### Best Practices for ${section.title}\n\n`;
        content += `Follow these recommended practices to get the most out of your ${mainKeyword} strategy in the context of ${section.title.toLowerCase()}.\n\n`;
      }
    });
    
    // Add conclusion
    content += `## Conclusion\n\nIn this guide, we've explored ${mainKeyword} in depth. By implementing the strategies and insights shared here, you'll be well-equipped to leverage ${mainKeyword} effectively for your specific needs.\n\n`;
    
    return content;
  };
  
  return {
    setContentType,
    setContentFormat,
    setContentIntent,
    setOutline,
    setOutlineSections,
    updateContent,
    setContent,
    generateContent,
    saveContent,
    setAdditionalInstructions,
    setContentTitle,
    setSuggestedTitles,
    setMetaTitle,
    setMetaDescription,
    setSelectedSolution
  };
};
