import { toast } from 'sonner';
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ContentItemType } from '@/contexts/content/types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

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
  setShowSaveDialog: (value: boolean) => void,
  serpSelections?: any[]
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
    
    // Create metadata object with outline and SERP selections
    const metadata: ContentItemType['metadata'] = {
      outline: outline || [],
      serpSelections: serpSelections || [],
      notes: saveNote
    };

    // Save to database
    const { data, error } = await supabase
      .from('content_items')
      .insert({
        title: saveTitle,
        content: content,
        status: 'draft',
        user_id: user.id,
        metadata: metadata
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // If we have keywords, save them too
    if (mainKeyword || (secondaryKeywords && secondaryKeywords.length > 0)) {
      try {
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
      } catch (keywordError) {
        // Log the error but don't fail the whole save operation
        console.warn('Warning: Some keywords could not be saved:', keywordError);
      }
    }
    
    toast.success('Content saved successfully to your repository');
    setShowSaveDialog(false);
    
    // Signal content was saved for refresh - use clear flag names
    sessionStorage.setItem('content_draft_saved', 'true');
    sessionStorage.setItem('content_save_timestamp', Date.now().toString());
    
    console.log('Saved content:', {
      id: data.id,
      title: saveTitle,
      content,
      keyword: mainKeyword,
      secondaryKeywords,
      metadata
    });
    
    return data.id;
  } catch (error: any) {
    console.error('Error saving content:', error);
    toast.error('Failed to save content: ' + (error.message || 'Please try again'));
    return null;
  } finally {
    setIsSaving(false);
  }
}

async function addKeyword(contentId: string, keyword: string, userId: string) {
  try {
    // Check if keyword exists
    const { data: existingKeyword } = await supabase
      .from('keywords')
      .select('id')
      .eq('keyword', keyword)
      .eq('user_id', userId)
      .single();

    let keywordId;
    
    if (!existingKeyword) {
      // Create new keyword
      const { data: newKeyword, error: keywordError } = await supabase
        .from('keywords')
        .insert({
          keyword,
          user_id: userId
        })
        .select('id')
        .single();

      if (keywordError) {
        console.warn('Warning: Could not create new keyword:', keywordError);
        return;
      }
      keywordId = newKeyword.id;
    } else {
      keywordId = existingKeyword.id;
    }

    // Simply insert the relationship without checking for duplicates
    const { error: relationError } = await supabase
      .from('content_keywords')
      .insert({
        content_id: contentId,
        keyword_id: keywordId
      });

    if (relationError) {
      console.warn('Warning: Could not create keyword relationship:', relationError);
    }
  } catch (error) {
    console.warn('Warning: Error in addKeyword:', error);
  }
}
