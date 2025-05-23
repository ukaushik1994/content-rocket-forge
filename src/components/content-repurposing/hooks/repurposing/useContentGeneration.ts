
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { repurposedContentService } from '@/services/repurposedContentService';
import { useAuth } from '@/contexts/AuthContext';
import { contentFormats, getFormatByIdOrDefault } from '../../formats';

export const useContentGeneration = (content: ContentItemType | null) => {
  const { user } = useAuth();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [savedContentFormats, setSavedContentFormats] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  
  // Load saved content from localStorage on initial render
  useEffect(() => {
    if (content?.id) {
      const savedData = localStorage.getItem(`repurposed_content_${content.id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setGeneratedContents(parsedData.contents || {});
          setSelectedFormats(parsedData.formats || []);
          
          if (parsedData.activeFormat) {
            setActiveFormat(parsedData.activeFormat);
          } else if (Object.keys(parsedData.contents || {}).length > 0) {
            setActiveFormat(Object.keys(parsedData.contents)[0]);
          }
        } catch (error) {
          console.error('Error parsing saved content:', error);
        }
      }
      
      // Load saved formats from database
      loadSavedFormats();
    }
  }, [content?.id]);

  const loadSavedFormats = async () => {
    if (!content?.id) return;
    
    try {
      const savedContent = await repurposedContentService.getAllRepurposedContent(content.id);
      const savedFormatCodes = savedContent.map(item => item.format_code);
      setSavedContentFormats(savedFormatCodes);
    } catch (error) {
      console.error('Error loading saved formats:', error);
    }
  };
  
  // Save generated content to localStorage whenever it changes
  useEffect(() => {
    if (content?.id && Object.keys(generatedContents).length > 0) {
      const dataToSave = {
        contents: generatedContents,
        formats: selectedFormats,
        activeFormat: activeFormat,
        timestamp: new Date().toISOString(),
        contentId: content.id
      };
      
      localStorage.setItem(`repurposed_content_${content.id}`, JSON.stringify(dataToSave));
    }
  }, [generatedContents, selectedFormats, activeFormat, content?.id]);
  
  const handleGenerateContent = async (contentTypeIds: string[]) => {
    if (contentTypeIds.length === 0) {
      toast.error('Please select at least one content format');
      return;
    }
    
    if (!content) {
      toast.error('Please select content to repurpose');
      return;
    }
    
    setIsGenerating(true);
    setSelectedFormats(contentTypeIds);
    
    try {
      const newGeneratedContents: Record<string, string> = { ...generatedContents };
      
      for (const formatId of contentTypeIds) {
        if (!formatId) continue;
        
        const formatInfo = getFormatByIdOrDefault(formatId);
        
        try {
          toast.info(`Generating ${formatInfo.name} content...`);
          
          const generatedContent = await generateContentByFormatType(
            formatId,
            content.title,
            {
              content: content.content?.substring(0, 1500) || '',
              keyword: content.keywords ? content.keywords[0] : ''
            }
          );
          
          if (generatedContent) {
            newGeneratedContents[formatId] = generatedContent;
          } else {
            toast.error(`Failed to generate ${formatInfo.name} content`);
          }
        } catch (error) {
          console.error('Error generating content:', error);
          toast.error(`Failed to generate ${formatInfo.name} content`);
        }
      }
      
      setGeneratedContents(newGeneratedContents);
      
      if (Object.keys(newGeneratedContents).length > 0) {
        setActiveFormat(Object.keys(newGeneratedContents)[0]);
        toast.success(`Generated content for ${Object.keys(newGeneratedContents).length} format(s)`);
      } else {
        toast.error('Failed to generate any content');
      }
    } catch (error) {
      console.error('Error in content generation process:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveAsNewContent = async (formatId: string, generatedContent: string): Promise<boolean> => {
    if (!content || !formatId || !generatedContent || !user) {
      toast.error('Missing required information for saving');
      return false;
    }
    
    setIsSaving(true);
    
    try {
      const formatInfo = getFormatByIdOrDefault(formatId);
      
      const result = await repurposedContentService.saveRepurposedContent({
        contentId: content.id,
        formatCode: formatId,
        content: generatedContent,
        title: `${content.title} - ${formatInfo.name}`,
        userId: user.id
      });
      
      if (result) {
        setSavedContentFormats(prev => [...new Set([...prev, formatId])]);
        toast.success(`${formatInfo.name} content saved successfully`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveAllContent = async (): Promise<boolean> => {
    if (!content || !user || Object.keys(generatedContents).length === 0) {
      toast.error('No content available to save');
      return false;
    }
    
    setIsSavingAll(true);
    
    try {
      const savedFormats = await repurposedContentService.saveAllRepurposedContent(
        content.id,
        user.id,
        generatedContents,
        content.title
      );
      
      if (savedFormats.length > 0) {
        setSavedContentFormats(prev => [...new Set([...prev, ...savedFormats])]);
        toast.success(`Successfully saved ${savedFormats.length} content format(s)`);
        return true;
      } else {
        toast.error('Failed to save any content');
        return false;
      }
    } catch (error) {
      console.error('Error saving all content:', error);
      toast.error('Failed to save content');
      return false;
    } finally {
      setIsSavingAll(false);
    }
  };
  
  const deleteRepurposedContent = async (formatId: string): Promise<boolean> => {
    if (!content || !formatId) return false;
    
    try {
      const success = await repurposedContentService.deleteRepurposedContent(content.id, formatId);
      
      if (success) {
        setSavedContentFormats(prev => prev.filter(id => id !== formatId));
        toast.success('Content deleted successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
      return false;
    }
  };
  
  return {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    savedContentFormats,
    isSaving,
    isSavingAll,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    saveAsNewContent,
    handleSaveAllContent,
    deleteRepurposedContent,
  };
};
