
import { useState, useCallback, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats } from '../../formats';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { sendChatRequest } from '@/services/aiService';
import { repurposedContentService } from '@/services/repurposedContentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRepurposedContentData } from './useRepurposedContentData';
import { AiProvider } from '@/services/aiService/types';
import { getAvailableProviders, getBestAvailableProvider } from '@/services/providerAvailabilityService';
import { getUserPreference } from '@/services/userPreferencesService';

export const useContentGeneration = (content: ContentItemType | null) => {
  const { user } = useAuth();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProvider>('openrouter');
  const [availableProviders, setAvailableProviders] = useState<AiProvider[]>([]);

  // Use the repurposed content data hook
  const {
    repurposedFormats: savedContentFormats,
    repurposedContentMap,
    isLoading: isLoadingRepurposed,
    refreshData: refreshRepurposedData
  } = useRepurposedContentData(content?.id || null);

  // Load available providers and set default
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await getAvailableProviders();
        setAvailableProviders(providers);
        
        // Set default provider from preferences or best available
        const defaultProvider = await getUserPreference('defaultAiProvider') as AiProvider;
        if (defaultProvider && providers.includes(defaultProvider)) {
          setAiProvider(defaultProvider);
        } else {
          const bestProvider = await getBestAvailableProvider();
          if (bestProvider) {
            setAiProvider(bestProvider);
          }
        }
      } catch (error) {
        console.warn('Error loading AI providers:', error);
      }
    };
    
    loadProviders();
  }, []);

  console.log('[useContentGeneration] Content:', content?.id);
  console.log('[useContentGeneration] repurposedContentMap:', repurposedContentMap);
  console.log('[useContentGeneration] generatedContents state:', generatedContents);

  // Load saved content into generatedContents when data changes
  useEffect(() => {
    console.log('[useContentGeneration] Effect - repurposedContentMap changed:', repurposedContentMap);
    if (repurposedContentMap && Object.keys(repurposedContentMap).length > 0) {
      console.log('[useContentGeneration] Setting generatedContents from repurposedContentMap');
      setGeneratedContents(repurposedContentMap);
      
      // Auto-select first format if none is active
      if (!activeFormat) {
        const firstFormat = Object.keys(repurposedContentMap)[0];
        console.log('[useContentGeneration] Auto-selecting first format:', firstFormat);
        setActiveFormat(firstFormat);
      }
    } else if (Object.keys(generatedContents).length === 0) {
      // Only clear if we don't have any generated content in memory
      console.log('[useContentGeneration] No repurposed content and no generated content, clearing state');
      setActiveFormat(null);
    }
  }, [repurposedContentMap]);

  // Auto-select first format when generated contents change
  useEffect(() => {
    const formats = Object.keys(generatedContents);
    console.log('[useContentGeneration] generatedContents changed, formats:', formats);
    if (formats.length > 0 && !activeFormat) {
      console.log('[useContentGeneration] Auto-selecting first format from generatedContents:', formats[0]);
      setActiveFormat(formats[0]);
    }
  }, [generatedContents, activeFormat]);

  // Reset state when content changes
  useEffect(() => {
    if (!content) {
      console.log('[useContentGeneration] Content cleared, resetting state');
      setSelectedFormats([]);
      setGeneratedContents({});
      setActiveFormat(null);
    }
  }, [content?.id]);

  const handleGenerateContent = useCallback(async (formats: string[]) => {
    if (!content || formats.length === 0) {
      toast.error('Please select content and formats to generate');
      return;
    }

    if (availableProviders.length === 0) {
      toast.error('No AI providers configured. Please configure at least one AI provider in Settings.');
      return;
    }

    console.log('[useContentGeneration] Starting content generation for formats:', formats);
    setIsGenerating(true);
    const newGeneratedContents: Record<string, string> = { ...generatedContents };

    try {
      for (const formatId of formats) {
        const format = contentFormats.find(f => f.id === formatId);
        if (!format) continue;

        console.log(`[useContentGeneration] Generating content for format: ${format.name} using ${aiProvider}`);
        toast.info(`Generating ${format.name} format...`);

        try {
          // Try template-based generation first
          let generatedContent = await generateContentByFormatType(
            formatId,
            content.title,
            {
              content: content.content?.substring(0, 1500) || '',
              keyword: content.metadata?.mainKeyword || ''
            }
          );

          // Fallback to AI service if template generation fails
          if (!generatedContent?.content) {
            console.log(`[useContentGeneration] Template generation failed for ${format.name}, trying AI service with ${aiProvider}`);
            const response = await sendChatRequest(aiProvider, {
              messages: [
                {
                  role: 'system',
                  content: `You are an expert content repurposing specialist. Transform the provided content into the requested ${format.name} format while maintaining its core message and value.`
                },
                {
                  role: 'user',
                  content: `Transform this content titled "${content.title}" for the ${format.name} format.
                            
                            Content: ${content.content?.substring(0, 1500)}...
                            
                            Make it appropriate for the ${format.name} format with all necessary elements.`
                }
              ]
            });

            if (response?.choices?.[0]?.message?.content) {
              generatedContent = { 
                content: response.choices[0].message.content, 
                templateUsed: { name: `Default ${format.name}`, isCustom: false } 
              };
            } else {
              throw new Error(`Failed to generate content for ${format.name}`);
            }
          }

          console.log(`[useContentGeneration] Generated content for ${format.name}:`, generatedContent?.content?.substring(0, 100) + '...');
          if (generatedContent?.content) {
            newGeneratedContents[formatId] = generatedContent.content;
          }
          toast.success(`${format.name} format generated successfully`);

        } catch (formatError) {
          console.error(`Error generating ${format.name}:`, formatError);
          toast.error(`Failed to generate ${format.name} format`);
        }
      }

      console.log('[useContentGeneration] Setting new generated contents:', Object.keys(newGeneratedContents));
      setGeneratedContents(newGeneratedContents);

      // Auto-select first generated format
      const firstFormat = Object.keys(newGeneratedContents)[0];
      if (firstFormat && !activeFormat) {
        console.log('[useContentGeneration] Auto-selecting first generated format:', firstFormat);
        setActiveFormat(firstFormat);
      }

    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [content, generatedContents, activeFormat, aiProvider, availableProviders]);

  const saveAsNewContent = useCallback(async (formatId: string, generatedContent: string): Promise<boolean> => {
    if (!content || !user || !formatId || !generatedContent) {
      toast.error('Missing required information to save content');
      return false;
    }

    setIsSaving(true);
    try {
      const format = contentFormats.find(f => f.id === formatId);
      const formatName = format?.name || formatId;

      console.log('[useContentGeneration] Saving content for format:', formatId);

      const result = await repurposedContentService.saveRepurposedContent({
        contentId: content.id,
        formatCode: formatId,
        content: generatedContent,
        title: `${content.title} - ${formatName}`,
        userId: user.id
      });

      if (result) {
        // Refresh data to get latest from database
        await refreshRepurposedData();
        toast.success(`${formatName} content saved successfully`);
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
  }, [content, user, refreshRepurposedData]);

  const handleSaveAllContent = useCallback(async (): Promise<boolean> => {
    if (!content || !user || Object.keys(generatedContents).length === 0) {
      toast.error('No content to save');
      return false;
    }

    setIsSavingAll(true);
    try {
      console.log('[useContentGeneration] Saving all content:', Object.keys(generatedContents));

      const savedFormats = await repurposedContentService.saveAllRepurposedContent(
        content.id,
        user.id,
        generatedContents,
        content.title
      );

      if (savedFormats.length > 0) {
        // Refresh data to get latest from database
        await refreshRepurposedData();
        toast.success(`${savedFormats.length} format(s) saved successfully`);
        return true;
      } else {
        toast.error('No formats were saved');
        return false;
      }
    } catch (error) {
      console.error('Error saving all content:', error);
      toast.error('Failed to save content');
      return false;
    } finally {
      setIsSavingAll(false);
    }
  }, [content, user, generatedContents, refreshRepurposedData]);

  const deleteRepurposedContent = useCallback(async (formatId: string): Promise<boolean> => {
    if (!content || !formatId) {
      toast.error('Missing information to delete content');
      return false;
    }

    try {
      console.log('[useContentGeneration] Deleting format:', formatId);

      const success = await repurposedContentService.deleteRepurposedContent(content.id, formatId);
      if (success) {
        // Refresh data to get latest from database
        await refreshRepurposedData();
        
        // Remove from local generated contents as well
        setGeneratedContents(prev => {
          const newContents = { ...prev };
          delete newContents[formatId];
          return newContents;
        });
        
        // Reset active format if deleted
        if (activeFormat === formatId) {
          const remainingFormats = Object.keys(generatedContents).filter(id => id !== formatId);
          setActiveFormat(remainingFormats.length > 0 ? remainingFormats[0] : null);
        }
        
        toast.success('Content deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting repurposed content:', error);
      toast.error('Failed to delete content');
      return false;
    }
  }, [content, activeFormat, generatedContents, refreshRepurposedData]);

  // Bulk operations
  const handleCopyAllContent = useCallback(() => {
    if (Object.keys(generatedContents).length === 0) {
      toast.error('No content to copy');
      return;
    }

    const allContent = Object.entries(generatedContents)
      .map(([formatId, content]) => {
        const format = contentFormats.find(f => f.id === formatId);
        return `=== ${format?.name || formatId} ===\n\n${content}`;
      })
      .join('\n\n---\n\n');
    
    navigator.clipboard.writeText(allContent);
    toast.success(`${Object.keys(generatedContents).length} formats copied to clipboard`);
  }, [generatedContents]);

  const handleExportAllContent = useCallback(() => {
    if (Object.keys(generatedContents).length === 0) {
      toast.error('No content to export');
      return;
    }

    const allContent = Object.entries(generatedContents)
      .map(([formatId, content]) => {
        const format = contentFormats.find(f => f.id === formatId);
        return `=== ${format?.name || formatId} ===\n\n${content}`;
      })
      .join('\n\n---\n\n');
    
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'content'}_repurposed_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${Object.keys(generatedContents).length} formats exported successfully`);
  }, [generatedContents, content]);

  const handleDeleteAllContent = useCallback(async (): Promise<boolean> => {
    if (Object.keys(generatedContents).length === 0) {
      toast.error('No content to delete');
      return false;
    }

    try {
      const formatIds = Object.keys(generatedContents);
      let deletedCount = 0;

      for (const formatId of formatIds) {
        const success = await repurposedContentService.deleteRepurposedContent(content!.id, formatId);
        if (success) {
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        // Refresh data to get latest from database
        await refreshRepurposedData();
        setGeneratedContents({});
        setActiveFormat(null);
        toast.success(`${deletedCount} format(s) deleted successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting all content:', error);
      toast.error('Failed to delete content');
      return false;
    }
  }, [generatedContents, content, refreshRepurposedData]);

  return {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    savedContentFormats,
    setSavedContentFormats: () => {}, // Deprecated - data comes from database now
    isSaving,
    isSavingAll,
    isLoadingRepurposed,
    aiProvider,
    setAiProvider,
    availableProviders,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    saveAsNewContent,
    handleSaveAllContent,
    deleteRepurposedContent,
    handleCopyAllContent,
    handleExportAllContent,
    handleDeleteAllContent,
    refreshRepurposedData
  };
};
