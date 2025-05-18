
import { useState } from 'react';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content/types';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { contentFormats, getFormatByIdOrDefault } from '../../formats';

export const useContentGeneration = (content: ContentItemType | null) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  
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
      const newGeneratedContents: Record<string, string> = {};
      
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
  
  return {
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
  };
};
