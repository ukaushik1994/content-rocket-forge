
import { toast } from "sonner";
import { AiProvider } from '@/services/aiService/types';

export async function generateContent(
  aiProvider: AiProvider,
  mainKeyword: string,
  contentTitle: string | undefined,
  outlineText: string,
  secondaryKeywords: string,
  selectedSolution: any, // Using any here to match the existing type
  additionalInstructions: string | undefined,
  setIsGenerating: (value: boolean) => void,
  handleContentChange: (content: string) => void
) {
  setIsGenerating(true);
  toast.info("Generating content...");

  try {
    // Mock content generation with a delay for now
    // In a real implementation, this would call an AI service
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate content based on input
    const title = contentTitle || `Complete Guide to ${mainKeyword}`;
    
    let content = `# ${title}\n\n`;
    
    // Add introduction
    content += `## Introduction\n\nThis comprehensive guide explores ${mainKeyword} in detail`;
    if (secondaryKeywords) {
      content += `, covering related topics like ${secondaryKeywords}`;
    }
    content += `. We'll provide you with valuable insights, practical tips, and expert guidance to help you master ${mainKeyword}.\n\n`;
    
    // Process outline into content sections
    if (outlineText) {
      const outlineItems = outlineText.split('\n').filter(Boolean);
      
      outlineItems.forEach(item => {
        const sectionTitle = item.replace(/^\d+\.\s*/, '');
        content += `## ${sectionTitle}\n\n`;
        content += `This section covers important aspects of ${sectionTitle.toLowerCase()}. `;
        content += `When working with ${mainKeyword}, it's crucial to understand how ${sectionTitle.toLowerCase()} impacts your results.\n\n`;
        content += `Key considerations for ${sectionTitle.toLowerCase()}:\n\n`;
        content += `- Important point about ${sectionTitle.toLowerCase()}\n`;
        content += `- Strategic approach to ${mainKeyword} through ${sectionTitle.toLowerCase()}\n`;
        content += `- Best practices for implementing ${sectionTitle.toLowerCase()}\n\n`;
      });
    }
    
    // Add conclusion
    content += `## Conclusion\n\nIn this guide, we've explored ${mainKeyword} in depth, covering the essential aspects you need to know. By applying these strategies and insights, you'll be well-positioned to achieve success with ${mainKeyword}.`;
    
    // Change the content
    handleContentChange(content);
    
    // Save to localStorage to prevent content loss on refresh
    localStorage.setItem('content_builder_draft', content);
    localStorage.setItem('content_builder_timestamp', new Date().toISOString());
    localStorage.setItem('content_builder_keyword', mainKeyword);
    localStorage.setItem('content_builder_title', title);

    toast.success("Content generated successfully!");
  } catch (error) {
    console.error("Error generating content:", error);
    toast.error("Failed to generate content");
  } finally {
    setIsGenerating(false);
  }
}

export async function saveContentToDraft(
  title: string,
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[],
  note: string,
  outline: string[],
  setIsSaving: (value: boolean) => void,
  setShowSaveDialog: (value: boolean) => void
) {
  setIsSaving(true);
  
  try {
    // Mock saving content with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save draft to localStorage with timestamp for persistence
    const draftData = {
      title,
      content,
      mainKeyword,
      secondaryKeywords,
      note,
      outline,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('content_builder_saved_draft', JSON.stringify(draftData));
    
    // Clear the temporary draft since we've properly saved it now
    localStorage.removeItem('content_builder_draft');
    
    toast.success("Content saved to drafts!");
    setShowSaveDialog(false);
  } catch (error) {
    console.error("Error saving content:", error);
    toast.error("Failed to save content");
  } finally {
    setIsSaving(false);
  }
}
