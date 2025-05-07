
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export async function generateContent(
  aiProvider: AiProvider,
  mainKeyword: string,
  contentTitle: string | undefined,
  outlineText: string,
  secondaryKeywords: string,
  selectedSolution: any,
  additionalInstructions: string,
  setIsGenerating: (value: boolean) => void,
  setContent: (content: string) => void
) {
  if (!mainKeyword) {
    toast.error("Please set a main keyword first");
    return;
  }
  
  setIsGenerating(true);
  
  try {
    // Create a detailed prompt for the AI
    const prompt = `
    Write comprehensive, high-quality content for an article about "${mainKeyword}".
    
    Title: ${contentTitle || `Complete Guide to ${mainKeyword}`}
    Primary Keyword: ${mainKeyword}
    ${secondaryKeywords ? `Secondary Keywords: ${secondaryKeywords}` : ''}
    
    Use this outline structure:
    ${outlineText}
    
    ${selectedSolution ? `This content should mention the solution "${selectedSolution.name}" and highlight these features: ${selectedSolution.features.slice(0,3).join(', ')}.` : ''}
    
    ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
    
    Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis. 
    Include a compelling introduction and a strong conclusion. 
    Optimize the content for readability and search engines.
    `;
    
    // Call the AI API via our service
    console.info("AI Content Generation prompt:", prompt);
    
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
      setContent(generatedContent);
      toast.success('Content generated successfully');
    } else {
      toast.error('Failed to generate content. Please check your API key configuration or try another provider.');
    }
    
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please try again or check your API configuration.');
  } finally {
    setIsGenerating(false);
  }
}

export async function saveContentToDraft(
  saveTitle: string,
  content: string,
  mainKeyword: string,
  saveNote: string,
  setIsSaving: (value: boolean) => void,
  setShowSaveDialog: (value: boolean) => void
) {
  if (!saveTitle.trim()) {
    toast.error('Please enter a title');
    return;
  }
  
  setIsSaving(true);
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Content saved successfully to your repository');
    setShowSaveDialog(false);
    
    // In a real app, this would save to a database
    console.log('Saved content:', {
      title: saveTitle,
      content,
      keyword: mainKeyword,
      note: saveNote
    });
    
  } catch (error) {
    console.error('Error saving content:', error);
    toast.error('Failed to save content. Please try again.');
  } finally {
    setIsSaving(false);
  }
}
