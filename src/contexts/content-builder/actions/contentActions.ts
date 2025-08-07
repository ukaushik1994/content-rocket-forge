
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { OutlineSection } from '../types/outline-types';
import { ContentType, ContentFormat, ContentIntent } from '../types/content-types';
import AIServiceController from '@/services/aiService/AIServiceController';

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
  };

  const generateContent = async (outline: OutlineSection[]): Promise<void> => {
    dispatch({ type: 'SET_IS_GENERATING', payload: true });
    
    try {
      // Create comprehensive prompt
      const outlineText = outline.map((item, index) => `${index + 1}. ${item.title}`).join('\n');
      
      let prompt = `Write comprehensive content based on this outline:
${outlineText}

Main keyword: ${state.mainKeyword}
Content title: ${state.contentTitle || 'N/A'}
Additional instructions: ${state.additionalInstructions || 'None'}`;

      // Add solution context if available
      if (state.selectedSolution) {
        prompt += `

SOLUTION INTEGRATION:
Solution: ${state.selectedSolution.name}
Description: ${state.selectedSolution.description}
Key Features: ${state.selectedSolution.features.slice(0,5).join(', ')}
Pain Points: ${state.selectedSolution.painPoints.slice(0,3).join(', ')}
Target Audience: ${state.selectedSolution.targetAudience.join(', ')}
Use Cases: ${state.selectedSolution.useCases.slice(0,3).join(', ')}`;

        if (state.selectedSolution.uniqueValuePropositions) {
          prompt += `
Value Propositions: ${state.selectedSolution.uniqueValuePropositions.slice(0,3).join(', ')}`;
        }

        if (state.selectedSolution.keyDifferentiators) {
          prompt += `
Key Differentiators: ${state.selectedSolution.keyDifferentiators.slice(0,3).join(', ')}`;
        }

        prompt += `

Please naturally integrate this solution throughout the content, addressing relevant pain points and highlighting applicable features.`;
      }

      prompt += `

Requirements:
- Use Markdown formatting with proper headings
- Make content engaging and actionable
- Follow the outline structure
- Include a compelling introduction and conclusion
- Optimize for readability and SEO`;

      // Use AI service to generate content
      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'content_generation',
        temperature: 0.7,
        max_tokens: 4000
      });

      if (response?.content) {
        dispatch({ type: 'SET_CONTENT', payload: response.content });
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to placeholder content
      const content = generatePlaceholderContent(outline);
      dispatch({ type: 'SET_CONTENT', payload: content });
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };
  
  const saveContent = async (options: { title: string; content: string }): Promise<boolean> => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    try {
      // In a real implementation, this would save to a database
      // For now we'll just simulate saving with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set title and content
      dispatch({ type: 'SET_CONTENT_TITLE', payload: options.title });
      dispatch({ type: 'SET_CONTENT', payload: options.content });
      
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
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
  
  // Helper function to generate placeholder content
  const generatePlaceholderContent = (outline: OutlineSection[]): string => {
    return outline.map(section => {
      return `# ${section.title}\n\nThis section will discuss ${section.title.toLowerCase()}. It will cover various aspects and provide valuable insights for the reader.\n\n`;
    }).join('\n');
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
    setMetaDescription
  };
};
