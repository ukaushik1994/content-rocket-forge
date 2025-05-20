
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { contentFormats, getFormatByIdOrDefault } from '../../formats';

export const useContentGeneration = (content: ContentItemType | null) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [savedContentFormats, setSavedContentFormats] = useState<string[]>([]);
  
  // Load saved content from localStorage on initial render
  useEffect(() => {
    if (content?.id) {
      const savedData = localStorage.getItem(`repurposed_content_${content.id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setGeneratedContents(parsedData.contents || {});
          setSelectedFormats(parsedData.formats || []);
          setSavedContentFormats(parsedData.savedFormats || []);
          
          if (parsedData.activeFormat) {
            setActiveFormat(parsedData.activeFormat);
          } else if (Object.keys(parsedData.contents || {}).length > 0) {
            setActiveFormat(Object.keys(parsedData.contents)[0]);
          }
          
          toast.info("Loaded previously generated content formats");
        } catch (error) {
          console.error('Error parsing saved content:', error);
        }
      }
    }
  }, [content?.id]);
  
  // Save generated content to localStorage whenever it changes
  useEffect(() => {
    if (content?.id && Object.keys(generatedContents).length > 0) {
      const dataToSave = {
        contents: generatedContents,
        formats: selectedFormats,
        savedFormats: savedContentFormats,
        activeFormat: activeFormat,
        timestamp: new Date().toISOString(),
        contentId: content.id
      };
      
      localStorage.setItem(`repurposed_content_${content.id}`, JSON.stringify(dataToSave));
    }
  }, [generatedContents, selectedFormats, activeFormat, savedContentFormats, content?.id]);
  
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
      
      // Generate content for each selected format using templates
      for (const formatId of contentTypeIds) {
        const formatInfo = getFormatByIdOrDefault(formatId);
        
        try {
          toast.info(`Generating ${formatInfo.name} content...`);
          
          // Use our template service to generate content
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
        
        // Auto-save to localStorage
        const saveData = {
          contents: newGeneratedContents,
          formats: contentTypeIds,
          savedFormats: savedContentFormats,
          activeFormat: Object.keys(newGeneratedContents)[0],
          timestamp: new Date().toISOString(),
          contentId: content.id
        };
        localStorage.setItem(`repurposed_content_${content.id}`, JSON.stringify(saveData));
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
  
  const markAsSaved = (formatId: string) => {
    if (!savedContentFormats.includes(formatId)) {
      const updatedSavedFormats = [...savedContentFormats, formatId];
      setSavedContentFormats(updatedSavedFormats);
    }
  };
  
  const saveAllFormats = () => {
    const allFormatIds = Object.keys(generatedContents);
    setSavedContentFormats(allFormatIds);
    
    // Update localStorage
    if (content?.id) {
      const currentData = localStorage.getItem(`repurposed_content_${content.id}`);
      if (currentData) {
        try {
          const parsedData = JSON.parse(currentData);
          parsedData.savedFormats = allFormatIds;
          localStorage.setItem(`repurposed_content_${content.id}`, JSON.stringify(parsedData));
        } catch (error) {
          console.error('Error updating saved formats in localStorage:', error);
        }
      }
    }
    
    toast.success(`Saved all ${allFormatIds.length} content formats`);
    return allFormatIds;
  };
  
  return {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    savedContentFormats,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    markAsSaved,
    saveAllFormats,
  };
};
