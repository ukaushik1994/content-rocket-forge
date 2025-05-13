
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { toast } from 'sonner';

export const createContentGenerationActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const generateContentRequest = async (instructions?: string) => {
    try {
      dispatch({ type: 'SET_IS_GENERATING', payload: true });
      
      // In a real implementation, this would call an API
      // For now, let's simulate a delay and generate placeholder content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = `# ${state.contentTitle || state.mainKeyword || 'Generated Content'}
      
This is sample generated content based on your outline and keywords.

${state.outlineSections.map(section => `## ${section.title}\n\nContent for ${section.title} would appear here.\n\n`).join('')}

Keywords: ${[state.mainKeyword, ...state.selectedKeywords].join(', ')}

${instructions ? `\nFollowing your instructions: ${instructions}` : ''}
      `;
      
      dispatch({ type: 'SET_CONTENT', payload: generatedContent });
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      dispatch({ type: 'SET_IS_GENERATING', payload: false });
    }
  };

  return {
    generateContentRequest
  };
};
