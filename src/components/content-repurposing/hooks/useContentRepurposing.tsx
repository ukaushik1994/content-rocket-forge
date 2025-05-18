
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';
import { generateContentByFormatType } from '@/services/contentTemplateService';

export const useContentRepurposing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { contentItems, getContentItem, addContentItem, updateContentItem } = useContent();
  
  const [content, setContent] = useState<ContentItemType | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  
  // Load content when component mounts
  useEffect(() => {
    // Check if we have a specific content ID from URL param
    const contentId = new URLSearchParams(location.search).get('id');
    if (contentId) {
      const contentItem = getContentItem(contentId);
      if (contentItem) {
        console.log('Loaded content for repurposing:', contentItem.title);
        setContent(contentItem);
      } else {
        toast.error('Content not found');
      }
    }
  }, [location, getContentItem]);
  
  const handleContentSelection = (contentId: string) => {
    const selectedContent = getContentItem(contentId);
    if (selectedContent) {
      setContent(selectedContent);
      // Update the URL without page reload
      navigate(`/content-repurposing?id=${contentId}`, { replace: true });
    }
  };
  
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
        const formatInfo = contentFormats.find(f => f.id === formatId);
        
        try {
          toast.info(`Generating ${formatInfo?.name} content...`);
          
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
            toast.error(`Failed to generate ${formatInfo?.name} content`);
          }
        } catch (error) {
          console.error('Error generating content:', error);
          toast.error(`Failed to generate ${formatInfo?.name} content`);
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
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const downloadAsText = (content: string, formatName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_${formatName.toLowerCase().replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${a.download}`);
  };
  
  const saveAsNewContent = async (formatId: string, generatedContent: string): Promise<boolean> => {
    if (!content) return false;
    
    try {
      const formatInfo = contentFormats.find(f => f.id === formatId);
      const formatName = formatInfo?.name || 'Repurposed';
      
      // Add as new content item with required properties
      const newContentId = await addContentItem({
        title: `${content.title} (${formatName})`,
        content: generatedContent,
        status: 'draft',
        seo_score: 0,
        keywords: [], // Adding the required property
        metadata: {
          originalContentId: content.id,
          repurposedType: formatId,
          repurposedFrom: content.title
        }
      });
      
      // Update the original content's metadata to track repurposed formats
      if (content && newContentId) {
        // Get the current metadata or initialize an empty object
        const currentMetadata = content.metadata || {};
        
        // Get existing repurposed formats or initialize an empty array
        const repurposedFormats = currentMetadata.repurposedFormats || [];
        
        // Add the new format if not already present
        if (!repurposedFormats.includes(formatId)) {
          const updatedRepurposedFormats = [...repurposedFormats, formatId];
          
          // Update the content with the new metadata
          await updateContentItem(content.id, {
            ...content,
            metadata: {
              ...currentMetadata,
              repurposedFormats: updatedRepurposedFormats
            }
          });
        }
      }
      
      toast.success(`Saved as new content item`);
      return true; // Return a boolean value for success
    } catch (error) {
      console.error('Error saving as new content:', error);
      toast.error('Failed to save content');
      return false; // Return a boolean value for failure
    }
  };

  return {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
  };
};

export default useContentRepurposing;

// Add missing import
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
