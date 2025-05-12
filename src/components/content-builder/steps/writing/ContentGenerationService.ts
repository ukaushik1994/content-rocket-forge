
import { toast } from 'sonner';
import { generatePrompt } from './contentGenerationUtils';
import { ContentBuilderState } from '@/contexts/content-builder/types';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { AiProvider } from '@/services/aiService/types';
import { sendChatRequest } from '@/services/aiService';

export const generateContent = async (
  aiProvider: AiProvider,
  mainKeyword: string,
  contentTitle: string | undefined,
  outlineString: string,
  secondaryKeywords: string,
  selectedSolution: Solution | null,
  additionalInstructions: string | undefined,
  setIsGenerating: (state: boolean) => void,
  handleContentChange: (content: string) => void,
  selectedCountries: string[] = ['us'] // Default to 'us' if not provided
) => {
  if (!mainKeyword) {
    toast.error("Please set a main keyword first");
    return;
  }

  setIsGenerating(true);

  try {
    // Create a detailed prompt for the AI
    const prompt = generatePrompt({
      mainKeyword,
      contentTitle: contentTitle || `Complete Guide to ${mainKeyword}`,
      outlineString,
      secondaryKeywords,
      selectedSolution,
      additionalInstructions,
      selectedCountries
    });
    
    console.info("AI Content Generation prompt:", prompt);
    
    // Call the AI API via our service
    try {
      const chatResponse = await sendChatRequest(aiProvider, {
        messages: [
          { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized articles. Create comprehensive, well-structured content that follows the provided outline and incorporates the specified keywords naturally.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 4000
      });
      
      if (chatResponse?.choices?.[0]?.message?.content) {
        // Use the AI-generated content
        const generatedContent = chatResponse.choices[0].message.content;
        handleContentChange(generatedContent);
        toast.success('Content generated successfully');
      }
    } catch (error) {
      console.error(`Error with AI provider ${aiProvider}:`, error);
      toast.error(`Failed to generate content with ${aiProvider}. Please check your API configuration.`);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};

export const saveContentToDraft = async (
  title: string,
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[],
  note: string,
  outline: string[],
  setIsSaving: (state: boolean) => void,
  setShowSaveDialog: (state: boolean) => void
): Promise<string | null> => {
  setIsSaving(true);
  
  try {
    // In a real implementation, this would save to a database
    console.log('Saving content to draft:', { title, mainKeyword, secondaryKeywords, outline, note });
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const draftId = `draft_${Date.now()}`;
    
    toast.success('Content saved to drafts!');
    setShowSaveDialog(false);
    
    return draftId;
  } catch (error) {
    console.error('Error saving content:', error);
    toast.error('Failed to save content. Please try again.');
    return null;
  } finally {
    setIsSaving(false);
  }
};
