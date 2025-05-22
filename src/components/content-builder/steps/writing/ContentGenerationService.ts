
import { toast } from 'sonner';
import { AiProvider } from '@/services/aiService/types';
import { Solution } from '@/contexts/content-builder/types';
import { sendChatRequest } from '@/services/aiService';
import { getUserPreference } from '@/services/userPreferencesService';

/**
 * Generate content using AI
 */
export const generateContent = async (
  aiProvider: AiProvider,
  mainKeyword: string,
  contentTitle: string | null,
  outlineText: string,
  secondaryKeywords: string,
  selectedSolution: Solution | null,
  additionalInstructions: string,
  wordCountLimit?: number,
  setIsGenerating?: (value: boolean) => void,
  setContent?: (content: string) => void
): Promise<boolean> => {
  if (!mainKeyword) {
    toast.error("Please set a main keyword first");
    return false;
  }
  
  if (setIsGenerating) {
    setIsGenerating(true);
  }
  
  try {
    // Create a detailed prompt for the AI
    const prompt = `
    Write comprehensive, high-quality content for an article with the title: "${contentTitle || `Complete Guide to ${mainKeyword}`}".
    
    Title: ${contentTitle || `Complete Guide to ${mainKeyword}`}
    Primary Keyword: ${mainKeyword}
    ${secondaryKeywords ? `Secondary Keywords: ${secondaryKeywords}` : ''}
    ${wordCountLimit ? `Word Count Target: Exactly ${wordCountLimit} words (with a margin of error of +/- 3 words)` : ''}
    
    The content MUST start with the title as an H1 heading. For example:
    # ${contentTitle || `Complete Guide to ${mainKeyword}`}
    
    Then use this outline structure for the rest of the content:
    ${outlineText}
    
    ${selectedSolution ? `This content should mention the solution "${selectedSolution.name}" and highlight these features: ${selectedSolution.features.slice(0,3).join(', ')}.` : ''}
    
    ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
    
    Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis. 
    Include a compelling introduction and a strong conclusion. 
    Optimize the content for readability and search engines.
    ${wordCountLimit ? `It's CRITICAL to hit exactly ${wordCountLimit} words (with a margin of error of +/- 3 words). Please count your words carefully before submitting.` : ''}
    `;
    
    // Call the AI API via our service
    const chatResponse = await sendChatRequest(aiProvider, {
      messages: [
        { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized articles. Create comprehensive, well-structured content that follows the provided outline and incorporates the specified keywords naturally. Always start with the title as an H1 heading. If a specific word count is requested, you MUST adhere to it precisely (with a margin of error of +/- 3 words).' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 4000
    });
    
    if (chatResponse?.choices?.[0]?.message?.content) {
      // Use the AI-generated content
      const generatedContent = chatResponse.choices[0].message.content;
      
      // If content doesn't start with the title as an H1, add it
      let finalContent = generatedContent;
      const titleAsH1 = `# ${contentTitle || `Complete Guide to ${mainKeyword}`}`;
      
      if (!finalContent.trim().startsWith('#')) {
        finalContent = `${titleAsH1}\n\n${finalContent}`;
      }
      
      // Save the word count in localStorage for future reference
      if (wordCountLimit) {
        localStorage.setItem('content_builder_word_count', wordCountLimit.toString());
      }
      
      if (setContent) {
        setContent(finalContent);
      }
      
      toast.success('Content generated successfully');
      return true;
    } else {
      toast.error('Failed to generate content. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please try again or check your API configuration.');
    return false;
  } finally {
    if (setIsGenerating) {
      setIsGenerating(false);
    }
  }
};

/**
 * Save content to drafts
 */
export const saveContentToDraft = async (
  title: string,
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[],
  note: string,
  outline: string[],
  setIsSaving: (value: boolean) => void,
  setShowSaveDialog: (value: boolean) => void
): Promise<boolean> => {
  if (!title || !content) {
    toast.error("Title and content are required");
    return false;
  }
  
  setIsSaving(true);
  
  try {
    // Here you could implement actual saving to a database or service
    // For now we're just simulating a successful save
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage as a backup
    const draft = {
      title,
      content,
      mainKeyword,
      secondaryKeywords,
      note,
      outline,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const drafts = JSON.parse(localStorage.getItem('content_drafts') || '[]');
    drafts.push(draft);
    localStorage.setItem('content_drafts', JSON.stringify(drafts));
    
    toast.success('Content saved to drafts');
    setShowSaveDialog(false);
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error('Failed to save content');
    return false;
  } finally {
    setIsSaving(false);
  }
};
