
import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
    
    Make sure to:
    - Use the primary keyword "${mainKeyword}" with an optimal density between 0.5% and 3% of the content
    - Include all secondary keywords naturally throughout the text
    - Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis 
    - Include a compelling introduction and a strong conclusion
    - Optimize the content for both readability and search engines
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
  secondaryKeywords: string[],
  saveNote: string,
  outline: string[],
  setIsSaving: (value: boolean) => void,
  setShowSaveDialog: (value: boolean) => void
) {
  if (!saveTitle.trim()) {
    toast.error('Please enter a title');
    return;
  }
  
  setIsSaving(true);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to save content');
      setIsSaving(false);
      return;
    }
    
    // Save to database
    const { data, error } = await supabase
      .from('content_items')
      .insert({
        title: saveTitle,
        content: content,
        status: 'draft',
        user_id: user.id,
        notes: saveNote
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // If we have keywords, save them too
    if (mainKeyword || (secondaryKeywords && secondaryKeywords.length > 0)) {
      // Add main keyword first
      if (mainKeyword) {
        await addKeyword(data.id, mainKeyword, user.id);
      }
      
      // Add secondary keywords
      if (secondaryKeywords && secondaryKeywords.length > 0) {
        for (const keyword of secondaryKeywords) {
          if (keyword && keyword !== mainKeyword) {
            await addKeyword(data.id, keyword, user.id);
          }
        }
      }
    }
    
    toast.success('Content saved successfully to your repository');
    setShowSaveDialog(false);
    
    // Signal content was saved for refresh
    sessionStorage.setItem('from_content_builder', 'true');
    sessionStorage.setItem('content_save_timestamp', Date.now().toString());
    
    console.log('Saved content:', {
      id: data.id,
      title: saveTitle,
      content,
      keyword: mainKeyword,
      secondaryKeywords,
      note: saveNote,
      outline
    });
    
  } catch (error: any) {
    console.error('Error saving content:', error);
    toast.error('Failed to save content: ' + (error.message || 'Please try again'));
  } finally {
    setIsSaving(false);
  }
}

// Helper function to add a keyword to a content item
async function addKeyword(contentId: string, keyword: string, userId: string) {
  try {
    // Check if keyword exists
    let { data: existingKeyword } = await supabase
      .from('keywords')
      .select('id')
      .eq('keyword', keyword)
      .eq('user_id', userId)
      .maybeSingle();
    
    let keywordId;
    
    if (!existingKeyword) {
      // Create keyword if it doesn't exist
      const { data: newKeyword, error: keywordError } = await supabase
        .from('keywords')
        .insert({
          keyword: keyword,
          user_id: userId
        })
        .select('id')
        .single();
        
      if (keywordError) throw keywordError;
      keywordId = newKeyword.id;
    } else {
      keywordId = existingKeyword.id;
    }
    
    // Create relationship between content and keyword
    const { error: relationError } = await supabase
      .from('content_keywords')
      .insert({
        content_id: contentId,
        keyword_id: keywordId
      });
      
    if (relationError) throw relationError;
    
  } catch (error) {
    console.error('Error adding keyword:', error);
    // Don't throw here so we don't break the main content saving flow
  }
}
