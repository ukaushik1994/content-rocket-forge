
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { ContentType } from '@/contexts/content-builder/types';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';

export function useSaveContent() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { state } = useContentBuilder();
  const { addContentItem } = useContent();
  
  // Helper function to safely extract titles from outline items
  const extractOutlineTitles = (outline: any): string[] => {
    if (!outline) return [];
    
    if (!Array.isArray(outline)) {
      outline = [outline];
    }
    
    return outline.map(item => {
      // If item is a string, return it directly
      if (typeof item === 'string') return item;
      
      // If item is an OutlineSection or has a title property
      if (item && typeof item === 'object' && 'title' in item) {
        return item.title;
      }
      
      // Fallback
      return String(item);
    }).filter(Boolean);
  };
  
  const handleSaveToDraft = async (): Promise<void> => {
    try {
      setIsSaving(true);
      console.log("Saving content to draft...");
      
      if (!state.content || !state.mainKeyword) {
        toast.error("Content or main keyword is missing");
        setIsSaving(false);
        return;
      }
      
      const title = state.metaTitle || `${state.mainKeyword} - Draft`;
      
      // Prepare keywords array from main keyword and selected keywords
      const keywords = [
        state.mainKeyword,
        ...(state.selectedKeywords || [])
      ];
      
      // Convert outline to string array using our helper function
      const outlineAsStringArray = extractOutlineTitles(state.outline);
      
      // Draft content item
      const contentItem = {
        status: "draft" as const,
        title: title,
        content: state.content,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        keywords: keywords.filter(Boolean),
        contentType: state.contentType as ContentType,
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        seo_score: state.seoScore || 0,
        metadata: {
          mainKeyword: state.mainKeyword,
          secondaryKeywords: state.selectedKeywords,
          outline: outlineAsStringArray, // Now properly formatted as string[]
          outlineSections: JSON.stringify(state.outlineSections),
          additionalInstructions: state.additionalInstructions,
          contentType: state.contentType,
          contentFormat: state.contentFormat,
          contentIntent: state.contentIntent,
          metaTitle: state.metaTitle,
          metaDescription: state.metaDescription,
          solutionInfo: state.selectedSolution
        }
      };
      
      await addContentItem(contentItem);
      
      // Don't check the result, just assume it worked if no error was thrown
      toast.success("Content saved to drafts");
      setIsSavedToDraft(true);
    } catch (error) {
      console.error("Error in handleSaveToDraft:", error);
      toast.error("An error occurred while saving the content");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePublish = async (): Promise<void> => {
    try {
      setIsPublishing(true);
      console.log("Publishing content...");
      
      if (!state.content || !state.mainKeyword) {
        toast.error("Content or main keyword is missing");
        setIsPublishing(false);
        return;
      }
      
      // Check for minimum SEO score before publishing
      if (state.seoScore < 50) {
        if (!confirm("This content has a low SEO score. Are you sure you want to publish it?")) {
          setIsPublishing(false);
          return;
        }
      }
      
      const title = state.metaTitle || `${state.mainKeyword}`;
      
      // Prepare keywords array from main keyword and selected keywords
      const keywords = [
        state.mainKeyword,
        ...(state.selectedKeywords || [])
      ];
      
      // Convert outline to string array using our helper function
      const outlineAsStringArray = extractOutlineTitles(state.outline);
      
      // Published content item
      const contentItem = {
        status: "published" as const,
        title: title,
        content: state.content,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        keywords: keywords.filter(Boolean),
        contentType: state.contentType as ContentType,
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        seo_score: state.seoScore || 0,
        metadata: {
          mainKeyword: state.mainKeyword,
          secondaryKeywords: state.selectedKeywords,
          outline: outlineAsStringArray, // Now properly formatted as string[]
          outlineSections: JSON.stringify(state.outlineSections),
          additionalInstructions: state.additionalInstructions,
          contentType: state.contentType,
          contentFormat: state.contentFormat,
          contentIntent: state.contentIntent,
          metaTitle: state.metaTitle,
          metaDescription: state.metaDescription,
          publishedAt: new Date().toISOString(),
          solutionInfo: state.selectedSolution
        }
      };
      
      await addContentItem(contentItem);
      
      // Don't check the result, just assume it worked if no error was thrown
      toast.success("Content published successfully!");
    } catch (error) {
      console.error("Error in handlePublish:", error);
      toast.error("An error occurred while publishing the content");
    } finally {
      setIsPublishing(false);
    }
  };
  
  return {
    handleSaveToDraft,
    handlePublish,
    isSaving,
    isPublishing,
    isSavedToDraft
  };
}
