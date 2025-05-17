
import { toast } from 'sonner';
import { AiProvider } from '@/types/aiProvider';
import { Dispatch, SetStateAction } from 'react';
import { sendChatRequest } from '@/services/aiService';

export const generateContent = async (
  aiProvider: AiProvider,
  mainKeyword: string,
  contentTitle: string,
  outlineText: string,
  secondaryKeywords: string,
  selectedSolution: string | null,
  additionalInstructions: string,
  setIsGenerating: Dispatch<SetStateAction<boolean>>,
  handleContentChange: (content: string) => void
) => {
  // Check for required data
  if (!mainKeyword || !outlineText) {
    toast.error('Main keyword and outline are required to generate content');
    return;
  }
  
  setIsGenerating(true);
  
  try {
    // Create a detailed prompt for the AI
    const prompt = `
      Write comprehensive, high-quality content for an article about "${mainKeyword}".
      
      Title: ${contentTitle || `Complete Guide to ${mainKeyword}`}
      
      PRIMARY KEYWORD INSTRUCTIONS:
      - Primary Keyword: ${mainKeyword}
      - This is the main keyword that should be used throughout the content
      - Maintain optimal keyword density between 0.5% and 3% for this primary keyword
      - Include it in headings, introduction, and conclusion
      
      SECONDARY KEYWORDS INSTRUCTIONS:
      ${secondaryKeywords ? `- Secondary Keywords: ${secondaryKeywords}
      - Include ALL of these secondary keywords naturally in the content
      - Distribute them throughout different sections
      - Use variations where appropriate` : ''}
      
      Use this outline structure:
      ${outlineText}
      
      ${selectedSolution ? `This content should mention the solution "${selectedSolution}" and highlight its key features and benefits.` : ''}
      
      ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
      
      Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis. 
      Include a compelling introduction and a strong conclusion.
      Ensure there are relevant calls-to-action (CTAs) in the content.
      
      IMPORTANT CONTENT QUALITY CHECKLIST:
      - Primary keyword (${mainKeyword}) is used with optimal density (0.5%-3%)
      - All secondary keywords are included at least once
      - Content includes relevant call-to-action statements
      - Solution features are naturally incorporated
      - Content follows the provided outline structure
    `;
    
    // Call the AI API
    try {
      const chatResponse = await sendChatRequest(aiProvider, {
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content writer specializing in SEO-optimized articles. Create comprehensive, well-structured content that follows the provided outline and incorporates the specified keywords naturally.' 
          },
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
        return;
      } else {
        throw new Error('No content was returned from the AI service');
      }
    } catch (error) {
      console.error(`Error with AI provider ${aiProvider}:`, error);
      // Fall back to template-based content if AI fails
      generateTemplateFallbackContent(mainKeyword, contentTitle, outlineText, selectedSolution, additionalInstructions, handleContentChange);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    toast.error('Failed to generate content. Please try again or check your API configuration.');
    // Fall back to template content
    generateTemplateFallbackContent(mainKeyword, contentTitle, outlineText, selectedSolution, additionalInstructions, handleContentChange);
  } finally {
    setIsGenerating(false);
  }
};

// Fallback function for when AI generation fails
const generateTemplateFallbackContent = (
  mainKeyword: string,
  contentTitle: string,
  outlineText: string,
  selectedSolution: string | null,
  additionalInstructions: string,
  handleContentChange: (content: string) => void
) => {
  toast.warning('Using template-based content generation as fallback');
  
  // Generate a template-based content
  const generatedContent = `# ${contentTitle || `Complete Guide to ${mainKeyword}`}

## Introduction
This is an introductory paragraph about ${mainKeyword}. It provides context and explains why this topic is important.

${outlineText.split('\n').map(item => {
  const title = item.replace(/^\d+\.\s*/, '');
  return `## ${title}
This section discusses important aspects of ${title.toLowerCase()}.

`
}).join('\n')}

## Conclusion
In conclusion, ${mainKeyword} is an important topic that deserves attention. The key points to remember are:

1. First key point
2. Second key point 
3. Third key point

${additionalInstructions ? `\n\n/* Additional notes based on instructions: ${additionalInstructions} */` : ''}`;

  handleContentChange(generatedContent);
  toast.info('Template-based content generated. Consider checking your API configuration.');
};

export const saveContentToDraft = async (
  title: string,
  content: string,
  mainKeyword: string,
  note: string,
  setIsSaving: Dispatch<SetStateAction<boolean>>,
  setShowSaveDialog: Dispatch<SetStateAction<boolean>>
) => {
  if (!title || !content) {
    toast.error('Title and content are required');
    return;
  }
  
  setIsSaving(true);
  
  try {
    // In a real implementation, this would save to a database
    // For now, we'll simulate the API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Content saved to drafts!');
    setShowSaveDialog(false);
    
  } catch (error) {
    console.error('Error saving content:', error);
    toast.error('Failed to save content. Please try again.');
  } finally {
    setIsSaving(false);
  }
};
