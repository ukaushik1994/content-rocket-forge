import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { contentFormats, getFormatByIdOrDefault } from '../../formats';
import { supabase } from '@/integrations/supabase/client';

// Define the metadata interface for proper typing
interface RepurposedContentMetadata {
  repurposedContentMap?: Record<string, string>;
  repurposedFormats?: string[];
  lastUpdated?: string;
  [key: string]: any; // For other potential metadata properties
}

export const useContentGeneration = (content: ContentItemType | null) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [savedContentFormats, setSavedContentFormats] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Load saved content from the database when content changes
  useEffect(() => {
    if (content?.id) {
      // First check localStorage for immediate data display (transitional approach)
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
      
      // Then load from the database for persistent storage
      const databaseLoad = async () => {
        try {
          // Fetch all repurposed content for this content item
          const { data: repurposedContents, error } = await supabase
            .from('repurposed_contents')
            .select('*')
            .eq('content_id', content.id);
          
          if (error) {
            console.error('Error loading repurposed content from database:', error);
            return;
          }
          
          if (repurposedContents && repurposedContents.length > 0) {
            // Convert to the format used in the state
            const dbContents: Record<string, string> = {};
            const dbFormats: string[] = [];
            const dbSavedFormats: string[] = [];
            
            repurposedContents.forEach(item => {
              dbContents[item.format_code] = item.content;
              
              if (!dbFormats.includes(item.format_code)) {
                dbFormats.push(item.format_code);
              }
              
              if (item.status === 'saved' && !dbSavedFormats.includes(item.format_code)) {
                dbSavedFormats.push(item.format_code);
              }
            });
            
            // Merge with local data, giving priority to database content
            setGeneratedContents(prevContents => ({
              ...prevContents,
              ...dbContents
            }));
            
            // Update formats list and saved formats from database
            if (dbFormats.length > 0) {
              setSelectedFormats(prevFormats => {
                const uniqueFormats = new Set([...prevFormats, ...dbFormats]);
                return Array.from(uniqueFormats);
              });
              
              setSavedContentFormats(dbSavedFormats);
              
              // Set an active format if none is selected
              if (!activeFormat && dbFormats.length > 0) {
                setActiveFormat(dbFormats[0]);
              }
            }
            
            // Also update localStorage to keep in sync (transitional approach)
            try {
              const combinedData = {
                contents: { ...generatedContents, ...dbContents },
                formats: Array.from(new Set([...selectedFormats, ...dbFormats])),
                savedFormats: dbSavedFormats,
                activeFormat: activeFormat || (dbFormats.length > 0 ? dbFormats[0] : null),
                timestamp: new Date().toISOString(),
                contentId: content.id
              };
              
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
  
  // Save generated content to localStorage (transitional approach)
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
            
            // Store the generated content in the database with 'draft' status
            const { error } = await supabase
              .from('repurposed_contents')
              .upsert({
                content_id: content.id,
                format_code: formatId,
                content: generatedContent,
                title: `${content.title} - ${formatInfo.name}`,
                status: 'draft',
                user_id: content.user_id
              }, {
                onConflict: 'content_id,format_code',
                ignoreDuplicates: false
              });
              
            if (error) {
              console.error('Error storing generated content in database:', error);
              // Continue anyway since we have the content in memory
            }
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
  
  const markAsSaved = async (formatId: string): Promise<boolean> => {
    if (!formatId || !content) return false;
    
    try {
      // Update the format status in the database
      const { error } = await supabase
        .from('repurposed_contents')
        .update({ status: 'saved' })
        .eq('content_id', content.id)
        .eq('format_code', formatId);
        
      if (error) {
        console.error('Error marking format as saved:', error);
        return false;
      }
      
      // Update the local state
      if (!savedContentFormats.includes(formatId)) {
        setSavedContentFormats([...savedContentFormats, formatId]);
      }
      
      return true;
    } catch (error) {
      console.error('Error in markAsSaved:', error);
      return false;
    }
  };
  
  /**
   * Save all generated formats to the database
   * @returns Array of format IDs that were saved
   */
  const saveAllFormats = async (): Promise<string[]> => {
    if (!content) return [];
    
    try {
      const allFormatIds = Object.keys(generatedContents);
      
      // Only update formats that aren't already saved
      const newFormatsToSave = allFormatIds.filter(id => !savedContentFormats.includes(id));
      if (newFormatsToSave.length === 0) return [];
      
      // Prepare the data for batch upsert
      const batchData = newFormatsToSave.map(formatId => {
        const formatInfo = getFormatByIdOrDefault(formatId);
        return {
          content_id: content.id,
          format_code: formatId,
          content: generatedContents[formatId],
          title: `${content.title} - ${formatInfo.name}`,
          status: 'saved',
          user_id: content.user_id
        };
      });
      
      // Use upsert to either insert new records or update existing ones
      const { error } = await supabase
        .from('repurposed_contents')
        .upsert(batchData, {
          onConflict: 'content_id,format_code',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error saving all formats:', error);
        return [];
      }
      
      // Update the local state
      setSavedContentFormats([...savedContentFormats, ...newFormatsToSave]);
      
      return newFormatsToSave;
    } catch (error) {
      console.error('Error in saveAllFormats:', error);
      return [];
    }
  };
  
  // Function to get all available formats from the database
  const fetchAvailableFormats = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('content_formats')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching available formats:', error);
        return contentFormats; // Fall back to the hardcoded formats
      }
      
      return data || contentFormats;
    } catch (error) {
      console.error('Error in fetchAvailableFormats:', error);
      return contentFormats; // Fall back to the hardcoded formats
    }
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
    fetchAvailableFormats
  };
};
