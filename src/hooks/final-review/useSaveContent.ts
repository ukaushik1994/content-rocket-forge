
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  SaveContentParams,
  ContentFormat,
  ContentIntent,
  OutlineSection
} from '@/contexts/content-builder/types';

export const useSaveContent = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords, 
    content, 
    contentTitle, 
    contentType,
    contentFormat,
    contentIntent,
    outline,
    outlineSections,
    metaTitle,
    metaDescription,
    seoScore,
    selectedSolution,
    solutionIntegrationMetrics,
    additionalInstructions
  } = state;
  
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  
  // We need to access these methods through the context
  const { saveContentToDraft, saveContentToPublished } = useContentBuilder();

  const handleSaveToDraft = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the parameters for saving
      const params: SaveContentParams = {
        title: contentTitle || mainKeyword || 'Untitled Content',
        content: content || '',
        mainKeyword: mainKeyword || '',
        secondaryKeywords: selectedKeywords || [],
        contentType: contentType || 'blog',
        contentFormat: contentFormat || ContentFormat.ARTICLE,
        contentIntent: contentIntent || ContentIntent.INFORM,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        status: 'draft',
        notes: additionalInstructions || '',
        seoScore: seoScore || 0,
        outlineJson: JSON.stringify(outlineSections || outline || []),
        solutionInfo: selectedSolution ? {
          id: selectedSolution.id,
          name: selectedSolution.name,
          features: selectedSolution.features
        } : null,
        solutionMetrics: solutionIntegrationMetrics || null
      };
      
      // Call the save method
      const savedId = await saveContentToDraft(params);
      
      if (savedId) {
        toast.success('Content saved to drafts');
        setIsSavedToDraft(true);
      } else {
        toast.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Error saving content');
    } finally {
      setIsSaving(false);
    }
    
    return null; // Return null to match expected return type
  };
  
  const handlePublish = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the parameters for saving
      const params: SaveContentParams = {
        title: contentTitle || mainKeyword || 'Untitled Content',
        content: content || '',
        mainKeyword: mainKeyword || '',
        secondaryKeywords: selectedKeywords || [],
        contentType: contentType || 'blog',
        contentFormat: contentFormat || ContentFormat.ARTICLE,
        contentIntent: contentIntent || ContentIntent.INFORM,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        status: 'published',
        notes: additionalInstructions || '',
        seoScore: seoScore || 0,
        outlineJson: JSON.stringify(outlineSections || outline || []),
        solutionInfo: selectedSolution ? {
          id: selectedSolution.id,
          name: selectedSolution.name,
          features: selectedSolution.features
        } : null,
        solutionMetrics: solutionIntegrationMetrics || null
      };
      
      // Call the publish method
      const publishedId = await saveContentToPublished(params);
      
      if (publishedId) {
        toast.success('Content published successfully');
        navigate('/content', { state: { publishedId } });
        return publishedId;
      } else {
        toast.error('Failed to publish content');
      }
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Error publishing content');
    } finally {
      setIsSaving(false);
    }
    
    return null; // Return null to match expected return type
  };

  return {
    isSaving,
    isSavedToDraft,
    handleSaveToDraft,
    handlePublish
  };
};
