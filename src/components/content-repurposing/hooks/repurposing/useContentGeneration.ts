
import { useState, useCallback, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats } from '../../formats';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { sendChatRequest } from '@/services/aiService';
import { repurposedContentService } from '@/services/repurposedContentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRepurposedContentData } from './useRepurposedContentData';

export const useContentGeneration = (content: ContentItemType | null) => {
  const { user } = useAuth();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Use the new hook to get repurposed content data from database
  const {
    repurposedFormats: savedContentFormats,
    repurposedContentMap,
    isLoading: isLoadingRepurposed,
    refreshData: refreshRepurposedData
  } = useRepurposedContentData(content?.id || null);

  // Load saved content into generatedContents when data changes
  useEffect(() => {
    if (repurposedContentMap && Object.keys(repurposedContentMap).length > 0) {
      setGeneratedContents(repurposedContentMap);
      
      // Auto-select first format if none is active
      if (!activeFormat && Object.keys(repurposedContentMap).length > 0) {
        setActiveFormat(Object.keys(repurposedContentMap)[0]);
      }
    } else {
      // Clear generated contents if no repurposed content exists
      setGeneratedContents({});
      setActiveFormat(null);
    }
  }, [repurposedContentMap, activeFormat]);

  // Auto-select first format when generated contents change
  useEffect(() => {
    const formats = Object.keys(generatedContents);
    if (formats.length > 0 && !activeFormat) {
      setActiveFormat(formats[0]);
    }
  }, [generatedContents, activeFormat]);

  const handleGenerateContent = useCallback(async (formats: string[]) => {
    if (!content || formats.length === 0) {
      toast.error('Please select content and formats to generate');
      return;
    }

    setIsGenerating(true);
    const newGeneratedContents: Record<string, string> = { ...generatedContents };

    try {
      for (const formatId of formats) {
        const format = contentFormats.find(f => f.id === formatId);
        if (!format) continue;

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
          if (!generatedContent) {
            const response = await sendChatRequest('openai', {
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
              generatedContent = response.choices[0].message.content;
            } else {
              throw new Error(`Failed to generate content for ${format.name}`);
            }
          }

          newGeneratedContents[formatId] = generatedContent;
          toast.success(`${format.name} format generated successfully`);

        } catch (formatError) {
          console.error(`Error generating ${format.name}:`, formatError);
          toast.error(`Failed to generate ${format.name} format`);
        }
      }

      setGeneratedContents(newGeneratedContents);

      // Auto-select first generated format
      const firstFormat = Object.keys(newGeneratedContents)[0];
      if (firstFormat && !activeFormat) {
        setActiveFormat(firstFormat);
      }

    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [content, generatedContents, activeFormat]);

  const saveAsNewContent = useCallback(async (formatId: string, generatedContent: string): Promise<boolean> => {
    if (!content || !user || !formatId || !generatedContent) {
      toast.error('Missing required information to save content');
      return false;
    }

    setIsSaving(true);
    try {
      const format = contentFormats.find(f => f.id === formatId);
      const formatName = format?.name || formatId;

      const result = await repurposedContentService.saveRepurposedContent({
        contentId: content.id,
        formatCode: formatId,
        content: generatedContent,
        title: `${content.title} - ${formatName}`,
        userId: user.id
      });

      if (result) {
        // Refresh data to get latest from database
        refreshRepurposedData();
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
      const savedFormats = await repurposedContentService.saveAllRepurposedContent(
        content.id,
        user.id,
        generatedContents,
        content.title
      );

      if (savedFormats.length > 0) {
        // Refresh data to get latest from database
        refreshRepurposedData();
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
      const success = await repurposedContentService.deleteRepurposedContent(content.id, formatId);
      if (success) {
        // Refresh data to get latest from database
        refreshRepurposedData();
        
        // Reset active format if deleted
        if (activeFormat === formatId) {
          const remainingFormats = Object.keys(generatedContents).filter(id => id !== formatId);
          setActiveFormat(remainingFormats.length > 0 ? remainingFormats[0] : null);
        }
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
        refreshRepurposedData();
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
