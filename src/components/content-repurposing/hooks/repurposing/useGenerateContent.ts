
import { toast } from 'sonner';
import { generateContentByFormatType } from '@/services/contentTemplateService';
import { ContentItemType } from '@/contexts/content/types';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { storeContentInDatabase } from './utils/storage-utils';

export const useGenerateContent = () => {
  /**
   * Generates content for a specific format
   */
  const generateForFormat = async (
    formatId: string,
    content: ContentItemType
  ): Promise<string | null> => {
    if (!formatId || !content) return null;
    
    const formatInfo = getFormatByIdOrDefault(formatId);
    
    try {
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
        return generatedContent;
      } else {
        toast.error(`Failed to generate ${formatInfo.name} content`);
        return null;
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate ${formatInfo.name} content`);
      return null;
    }
  };

  /**
   * Generates content for multiple formats
   */
  const generateMultipleFormats = async (
    contentTypeIds: string[],
    content: ContentItemType,
    existingContents: Record<string, string> = {}
  ): Promise<Record<string, string>> => {
    const newGeneratedContents: Record<string, string> = { ...existingContents };
    
    // Generate content for each selected format using templates
    for (const formatId of contentTypeIds) {
      if (!formatId) continue;
      
      const formatInfo = getFormatByIdOrDefault(formatId);
      toast.info(`Generating ${formatInfo.name} content...`);
      
      const generatedContent = await generateForFormat(formatId, content);
      
      if (generatedContent) {
        newGeneratedContents[formatId] = generatedContent;
        
        // Store the generated content in the database with 'draft' status
        await storeContentInDatabase(
          content.id,
          formatId,
          generatedContent,
          content.title || 'Untitled Content',
          content.user_id || '',
          'draft'
        );
      }
    }
    
    return newGeneratedContents;
  };
  
  return { generateForFormat, generateMultipleFormats };
};
