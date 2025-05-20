import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { contentFormats, getFormatByIdOrDefault } from '../../formats';
import { supabase } from '@/integrations/supabase/client';

export const useContentGeneration = (content: ContentItemType | null) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [savedContentFormats, setSavedContentFormats] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Load saved content from both database and localStorage on initial render
  useEffect(() => {
    if (content?.id) {
      // First check localStorage for immediate data display
      const localStorageLoad = async () => {
        const savedLocalData = localStorage.getItem(`repurposed_content_${content.id}`);
        
        if (savedLocalData) {
          try {
            const parsedLocalData = JSON.parse(savedLocalData);
            
            // Ensure all data is valid before setting state
            const parsedContents = parsedLocalData.contents || {};
            const parsedFormats = Array.isArray(parsedLocalData.formats) ? parsedLocalData.formats : [];
            const parsedSavedFormats = Array.isArray(parsedLocalData.savedFormats) ? parsedLocalData.savedFormats : [];
            
            setGeneratedContents(parsedContents);
            setSelectedFormats(parsedFormats);
            setSavedContentFormats(parsedSavedFormats);
            
            if (parsedLocalData.activeFormat && typeof parsedLocalData.activeFormat === 'string') {
              setActiveFormat(parsedLocalData.activeFormat);
            } else if (Object.keys(parsedContents).length > 0) {
              setActiveFormat(Object.keys(parsedContents)[0]);
            }
          } catch (error) {
            console.error('Error parsing saved local content:', error);
          }
        }
      };
      
      // Then try to load from database for persistent storage
      const databaseLoad = async () => {
        try {
          // Fetch the content item to get the repurposed content from metadata
          const { data: contentItem, error } = await supabase
            .from('content_items')
            .select('metadata')
            .eq('id', content.id)
            .single();
          
          if (error) {
            console.error('Error loading repurposed content from database:', error);
            return;
          }
          
          if (contentItem?.metadata?.repurposedContentMap) {
            const dbContents = contentItem.metadata.repurposedContentMap || {};
            const dbFormats = contentItem.metadata.repurposedFormats || [];
            
            // Merge with local data, giving priority to database content
            setGeneratedContents(prevContents => ({
              ...prevContents,
              ...dbContents
            }));
            
            // Update formats list from database
            if (dbFormats.length > 0) {
              setSavedContentFormats(dbFormats);
              
              // Make sure all saved formats are also in selected formats
              setSelectedFormats(prevFormats => {
                const uniqueFormats = new Set([...prevFormats, ...dbFormats]);
                return Array.from(uniqueFormats);
              });
            }
            
            // Also update localStorage to keep in sync
            const combinedData = {
              contents: { ...generatedContents, ...dbContents },
              formats: Array.from(new Set([...selectedFormats, ...dbFormats])),
              savedFormats: dbFormats,
              activeFormat: activeFormat || (Object.keys(dbContents).length > 0 ? Object.keys(dbContents)[0] : null),
              timestamp: new Date().toISOString(),
              contentId: content.id
            };
            
            try {
              localStorage.setItem(`repurposed_content_${content.id}`, JSON.stringify(combinedData));
            } catch (error) {
              console.error('Error updating localStorage with database content:', error);
            }
          }
        } catch (error) {
          console.error('Error in database load operation:', error);
        } finally {
          setIsInitialized(true);
        }
      };
      
      // Run both loading operations
      localStorageLoad().then(databaseLoad);
    }
  }, [content?.id]);
  
  // Save generated content to localStorage whenever it changes
  useEffect(() => {
    if (content?.id && Object.keys(generatedContents).length > 0 && isInitialized) {
      const dataToSave = {
        contents: generatedContents,
        formats: selectedFormats,
        savedFormats: savedContentFormats,
        activeFormat: activeFormat,
        timestamp: new Date().toISOString(),
        contentId: content.id
      };
      
      try {
        localStorage.setItem(`repurposed_content_${content.id}`, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [generatedContents, selectedFormats, activeFormat, savedContentFormats, content?.id, isInitialized]);
  
  const handleGenerateContent = async (contentTypeIds: string[]) => {
    if (!Array.isArray(contentTypeIds) || contentTypeIds.length === 0) {
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
        if (!formatId) continue;
        
        const formatInfo = getFormatByIdOrDefault(formatId);
        
        try {
          toast.info(`Generating ${formatInfo.name} content...`);
          
          const contentText = content.content && typeof content.content === 'string' 
            ? content.content.substring(0, 1500) 
            : '';
            
          const keyword = content.metadata?.mainKeyword || 
            (Array.isArray(content.keywords) && content.keywords.length > 0 ? content.keywords[0] : '');
          
          // Use our template service to generate content
          const generatedContent = await generateContentByFormatType(
            formatId,
            content.title || 'Untitled Content',
            {
              content: contentText,
              keyword: keyword
            }
          );
          
          if (generatedContent && typeof generatedContent === 'string') {
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
        const firstFormatKey = Object.keys(newGeneratedContents)[0];
        setActiveFormat(firstFormatKey);
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
  
  const markAsSaved = (formatId: string) => {
    if (!formatId) return;
    
    if (!savedContentFormats.includes(formatId)) {
      const updatedSavedFormats = [...savedContentFormats, formatId];
      setSavedContentFormats(updatedSavedFormats);
    }
  };
  
  const saveAllFormats = () => {
    const allFormatIds = Object.keys(generatedContents);
    setSavedContentFormats(allFormatIds);
    
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
