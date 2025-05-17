
import { toast } from 'sonner';
import { AiProvider } from '@/types/aiProvider';
import { Dispatch, SetStateAction } from 'react';

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
    // In a real implementation, this would call an AI service
    // For now, we'll simulate the API call with a timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demonstration, generate a simple content based on the outline
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
    toast.success('Content generated successfully!');
    
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
