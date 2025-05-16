
import { useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useNavigate } from 'react-router-dom';

export const useSaveContent = () => {
  const { state, setContentTitle } = useContentBuilder();
  const { addContentItem } = useContent();
  const navigate = useNavigate();

  const handleSaveToDraft = useCallback(async (overrideTitle?: string) => {
    try {
      const title = overrideTitle || state.contentTitle || state.metaTitle || `Article about ${state.mainKeyword}`;
      
      const contentData: SaveContentParams = {
        title,
        content: state.content,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        keywords: state.selectedKeywords,
        contentType: state.contentType as any, // Cast to satisfy TS
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        seoScore: state.seoScore,
        isPublished: false,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords.filter(k => k !== state.mainKeyword),
        outline: Array.isArray(state.outline) && typeof state.outline[0] === 'string' 
          ? state.outline as string[]
          : state.outlineSections.map(section => section.title),
        outlineSections: state.outlineSections,
        serpSelections: state.serpSelections,
        serpData: state.serpData,
        solutionInfo: state.selectedSolution
      };

      // Update title in content builder state
      if (setContentTitle && overrideTitle) {
        setContentTitle(overrideTitle);
      }

      const contentId = await addContentItem({
        ...contentData,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seo_score: state.seoScore,
      });

      toast.success('Content saved as draft');
      return contentId;
    } catch (error) {
      console.error('Error saving content as draft:', error);
      toast.error('Failed to save content');
      return null;
    }
  }, [state, setContentTitle, addContentItem]);

  const handlePublish = useCallback(async (overrideTitle?: string) => {
    try {
      const title = overrideTitle || state.contentTitle || state.metaTitle || `Article about ${state.mainKeyword}`;
      
      const contentData: SaveContentParams = {
        title,
        content: state.content,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        keywords: state.selectedKeywords,
        contentType: state.contentType as any, // Cast to satisfy TS
        contentFormat: state.contentFormat,
        contentIntent: state.contentIntent,
        seoScore: state.seoScore,
        isPublished: true,
        mainKeyword: state.mainKeyword,
        secondaryKeywords: state.selectedKeywords.filter(k => k !== state.mainKeyword),
        outline: Array.isArray(state.outline) && typeof state.outline[0] === 'string' 
          ? state.outline as string[]
          : state.outlineSections.map(section => section.title),
        outlineSections: state.outlineSections,
        serpSelections: state.serpSelections,
        serpData: state.serpData,
        solutionInfo: state.selectedSolution
      };

      // Update title in content builder state
      if (setContentTitle && overrideTitle) {
        setContentTitle(overrideTitle);
      }

      const contentId = await addContentItem({
        ...contentData,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        seo_score: state.seoScore,
      });

      toast.success('Content published successfully');
      
      // Navigate to content view
      navigate(`/content/${contentId}`);
      
      return contentId;
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
      return null;
    }
  }, [state, setContentTitle, addContentItem, navigate]);

  return {
    handleSaveToDraft,
    handlePublish
  };
};
