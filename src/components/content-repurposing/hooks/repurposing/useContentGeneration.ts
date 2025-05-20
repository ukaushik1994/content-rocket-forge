import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats } from '@/components/content-repurposing/formats';
import { useGenerateContent } from './useGenerateContent';
import { 
  loadFromLocalStorage, 
  loadFromDatabase, 
  saveToLocalStorage, 
  updateFormatStatus, 
  fetchFormatsFromDatabase 
} from './utils/storage-utils';
import { ContentGenerationState, GenerationHookReturn } from './types/generation-types';

export const useContentGeneration = (content: ContentItemType | null): GenerationHookReturn => {
  // Initialize state
  const [state, setState] = useState<ContentGenerationState>({
    selectedFormats: [],
    generatedContents: {},
    isGenerating: false,
    activeFormat: null,
    savedContentFormats: [],
    isInitialized: false
  });

  // Get the content generation functions
  const { generateMultipleFormats } = useGenerateContent();
  
  // Extract state values for easier access
  const { selectedFormats, generatedContents, isGenerating, activeFormat, savedContentFormats, isInitialized } = state;
  
  // Load saved content from the database when content changes
  useEffect(() => {
    if (content?.id) {
      const initializeContent = async () => {
        // First check localStorage for immediate data display (transitional approach)
        const localData = loadFromLocalStorage(content.id);
        
        if (localData) {
          setState(prevState => ({
            ...prevState,
            generatedContents: localData.contents,
            selectedFormats: localData.formats,
            savedContentFormats: localData.savedFormats,
            activeFormat: localData.activeFormat || (Object.keys(localData.contents).length > 0 
              ? Object.keys(localData.contents)[0] 
              : null)
          }));
        }
        
        // Then load from the database for persistent storage
        const dbData = await loadFromDatabase(content.id);
        
        if (dbData) {
          setState(prevState => {
            // Merge with existing data, giving priority to database content
            const mergedContents = { ...prevState.generatedContents, ...dbData.contents };
            const uniqueFormats = Array.from(new Set([...prevState.selectedFormats, ...dbData.formats]));
            
            // Set an active format if none is selected
            const newActiveFormat = prevState.activeFormat || (dbData.formats.length > 0 ? dbData.formats[0] : null);
            
            // Update localStorage to keep in sync (transitional approach)
            saveToLocalStorage(
              content.id,
              mergedContents,
              uniqueFormats,
              dbData.savedFormats,
              newActiveFormat
            );
            
            return {
              ...prevState,
              generatedContents: mergedContents,
              selectedFormats: uniqueFormats,
              savedContentFormats: dbData.savedFormats,
              activeFormat: newActiveFormat,
              isInitialized: true
            };
          });
        } else {
          setState(prevState => ({ ...prevState, isInitialized: true }));
        }
      };
      
      initializeContent();
    }
  }, [content?.id]);
  
  // Save generated content to localStorage (transitional approach)
  useEffect(() => {
    if (content?.id && Object.keys(generatedContents).length > 0 && isInitialized) {
      saveToLocalStorage(
        content.id,
        generatedContents,
        selectedFormats,
        savedContentFormats,
        activeFormat
      );
    }
  }, [generatedContents, selectedFormats, activeFormat, savedContentFormats, content?.id, isInitialized]);
  
  // Handler for setting selected formats
  const setSelectedFormats = (formats: string[]) => {
    setState(prevState => ({ ...prevState, selectedFormats: formats }));
  };
  
  // Handler for setting active format
  const setActiveFormat = (format: string | null) => {
    setState(prevState => ({ ...prevState, activeFormat: format }));
  };
  
  // Main function to generate content
  const handleGenerateContent = async (contentTypeIds: string[]) => {
    if (!Array.isArray(contentTypeIds) || contentTypeIds.length === 0) {
      toast.error('Please select at least one content format');
      return;
    }
    
    if (!content) {
      toast.error('Please select content to repurpose');
      return;
    }
    
    setState(prevState => ({ ...prevState, isGenerating: true, selectedFormats: contentTypeIds }));
    
    try {
      const newGeneratedContents = await generateMultipleFormats(
        contentTypeIds,
        content,
        generatedContents
      );
      
      setState(prevState => ({ 
        ...prevState, 
        generatedContents: newGeneratedContents,
        isGenerating: false,
        activeFormat: Object.keys(newGeneratedContents).length > 0 
          ? Object.keys(newGeneratedContents)[0] 
          : null
      }));
      
      if (Object.keys(newGeneratedContents).length > 0) {
        toast.success(`Generated content for ${Object.keys(newGeneratedContents).length} format(s)`);
      } else {
        toast.error('Failed to generate any content');
      }
    } catch (error) {
      console.error('Error in content generation process:', error);
      toast.error('Failed to generate content');
      setState(prevState => ({ ...prevState, isGenerating: false }));
    }
  };
  
  // Mark a format as saved
  const markAsSaved = async (formatId: string): Promise<boolean> => {
    if (!formatId || !content) return false;
    
    const success = await updateFormatStatus(content.id, formatId);
    
    if (success && !savedContentFormats.includes(formatId)) {
      setState(prevState => ({
        ...prevState,
        savedContentFormats: [...prevState.savedContentFormats, formatId]
      }));
    }
    
    return success;
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
      
      // Save each format
      const savedFormats: string[] = [];
      
      for (const formatId of newFormatsToSave) {
        const success = await updateFormatStatus(content.id, formatId);
        if (success) {
          savedFormats.push(formatId);
        }
      }
      
      // Update the local state
      if (savedFormats.length > 0) {
        setState(prevState => ({
          ...prevState,
          savedContentFormats: [...prevState.savedContentFormats, ...savedFormats]
        }));
      }
      
      return savedFormats;
    } catch (error) {
      console.error('Error in saveAllFormats:', error);
      return [];
    }
  };
  
  // Function to get all available formats from the database
  const fetchAvailableFormats = async () => {
    return await fetchFormatsFromDatabase();
  };
  
  // Return the state and functions
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
