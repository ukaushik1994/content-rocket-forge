
import { useState, useCallback, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { contentFormats } from '../../formats';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { sendChatRequest } from '@/services/aiService';
import { repurposedContentService } from '@/services/repurposedContentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useContentGeneration = (content: ContentItemType | null) => {
  const { user } = useAuth();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const [savedContentFormats, setSavedContentFormats] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Auto-select first format when generated contents change
  useEffect(() => {
    const formats = Object.keys(generatedContents);
    if (formats.length > 0 && !activeFormat) {
      setActiveFormat(formats[0]);
    }
  }, [generatedContents, activeFormat]);

  // Load saved formats for current content
  useEffect(() => {
    if (content?.metadata?.repurposedFormats) {
      setSavedContentFormats(content.metadata.repurposedFormats);
      
      // Load saved content into generatedContents
      if (content.metadata.repurposedContentMap) {
        setGeneratedContents(content.metadata.repurposedContentMap);
      }
    } else {
      setSavedContentFormats([]);
      setGeneratedContents({});
    }
  }, [content]);

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
        setSavedContentFormats(prev => [...new Set([...prev, formatId])]);
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
  }, [content, user]);

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

      setSavedContentFormats(prev => [...new Set([...prev, ...savedFormats])]);
      
      if (savedFormats.length > 0) {
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
  }, [content, user, generatedContents]);

  const deleteRepurposedContent = useCallback(async (formatId: string): Promise<boolean> => {
    if (!content || !formatId) {
      toast.error('Missing information to delete content');
      return false;
    }

    try {
      const success = await repurposedContentService.deleteRepurposedContent(content.id, formatId);
      if (success) {
        setSavedContentFormats(prev => prev.filter(id => id !== formatId));
        setGeneratedContents(prev => {
          const updated = { ...prev };
          delete updated[formatId];
          return updated;
        });
        
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
  }, [content, activeFormat, generatedContents]);

  return {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    savedContentFormats,
    setSavedContentFormats,
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
