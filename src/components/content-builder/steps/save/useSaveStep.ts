
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useSaveContent } from '@/hooks/final-review/useSaveContent';

export const useSaveStep = (skipNavigation: boolean = false) => {
  const { state } = useContentBuilder();
  const { 
    mainKeyword, 
    contentType, 
    seoScore, 
    selectedSolution, 
    metaTitle,
    metaDescription,
    contentTitle,
    seoImprovements,
    selectedKeywords,
    content
  } = state;
  
  const { contentItems, refreshContent } = useContent();
  const navigate = useNavigate();
  const { handlePublish, handleSaveToDraft } = useSaveContent();
  
  // Override with ContentBuilder actions if available
  const contentBuilderContext = useContentBuilder();
  const hasSaveActions = contentBuilderContext?.saveContentToDraft && contentBuilderContext?.saveContentToPublished;
  
  // Track optimizations
  const hasAppliedOptimizations = seoImprovements?.some(improvement => improvement.applied) || false;
  
  // Initialize title from contentTitle (blog title), not metaTitle
  const [title, setTitle] = useState(contentTitle || `${mainKeyword} - Complete Guide`);
  
  // Initialize description from metaDescription if available, otherwise use a default
  const [description, setDescription] = useState(metaDescription || `A comprehensive guide about ${mainKeyword}`);
  
  const [socialShare, setSocialShare] = useState(true);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [existingContentId, setExistingContentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const [autoSaved, setAutoSaved] = useState<boolean>(false);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [autoSaveToastShown, setAutoSaveToastShown] = useState(false);
  
  // Check for auto-saved content
  useEffect(() => {
    const hasDraft = localStorage.getItem('content_builder_draft') !== null;
    setAutoSaved(hasDraft);
    
    // If there's an auto-saved draft, remind the user it needs to be saved properly (only once)
    if (hasDraft && !saveCompleted && !autoSaveToastShown) {
      toast.info(
        "You have auto-saved content that needs to be properly saved to your library",
        { duration: 5000 }
      );
      setAutoSaveToastShown(true);
    }
  }, [saveCompleted, autoSaveToastShown]);
  
  // Update the local state when global state changes
  useEffect(() => {
    console.log("[SaveStep] Global state updated:", { metaTitle, contentTitle, metaDescription });
    
    // Prioritize contentTitle for the blog title
    if (contentTitle) {
      setTitle(contentTitle);
      console.log("[SaveStep] Updated title from contentTitle:", contentTitle);
    }
    
    if (metaDescription) {
      setDescription(metaDescription);
      console.log("[SaveStep] Updated description from metaDescription:", metaDescription);
    }
  }, [metaTitle, metaDescription, contentTitle]);
  
  // Improved check for similar content already exists
  useEffect(() => {
    if (mainKeyword && title) {
      // Look for similar content based on title or main keyword
      const similarContent = contentItems.find(item => {
        // Check for similar title (case insensitive)
        const titleMatch = item.title.toLowerCase() === title.toLowerCase();
        
        // Check for main keyword match
        const keywordMatch = item.keywords && 
          item.keywords.some(kw => 
            kw.toLowerCase() === mainKeyword.toLowerCase()
          );
          
        return titleMatch || keywordMatch;
      });
      
      if (similarContent) {
        setAlreadySaved(true);
        setExistingContentId(similarContent.id);
        console.log("[SaveStep] Found similar content:", similarContent);
      } else {
        setAlreadySaved(false);
        setExistingContentId(null);
      }
    }
  }, [title, mainKeyword, contentItems]);
  
  const handleViewExisting = () => {
    if (existingContentId) {
      // Navigate to content library with focus on the existing item
      navigate('/content', { state: { highlightId: existingContentId } });
    } else {
      navigate('/content');
    }
  };
  
  const handleSaveContent = async () => {
    if (!content || !mainKeyword) {
      toast.error("Content or keywords are missing");
      return;
    }

    // If content is already saved, navigate directly to content library
    if (alreadySaved && existingContentId) {
      toast.info("Navigating to existing content in your library");
      handleViewExisting();
      return;
    }

    // Save to content library using ContentBuilder context if available
    try {
      setIsSubmitting(true);
      console.log("[SaveStep] Saving content with title:", title);
      console.log("[SaveStep] Using description:", description);
      console.log("[SaveStep] Applied optimizations:", hasAppliedOptimizations ? "Yes" : "No");
      
      if (hasSaveActions) {
        // Use ContentBuilder's save function with enhanced params
        const saveParams = {
          title: contentTitle || title, // Use contentTitle as the blog title
          content,
          mainKeyword,
          secondaryKeywords: selectedKeywords,
          contentType,
          metaTitle: metaTitle || title, // Use metaTitle for SEO meta title
          metaDescription: description,
          status: 'draft' as const,
          notes: '',
          seoScore,
          outline: state.outline,
          serpSelections: state.serpSelections,
          serpData: state.serpData
        };
        
        const result = await contentBuilderContext.saveContentToDraft(saveParams);
        if (!result) {
          throw new Error('Failed to save content');
        }
        
        // Capture the contentId for callback
        setSavedContentId(result);
        console.log('[SaveStep] Content saved with ID:', result);
      } else {
        // Fallback to original save method
        await handleSaveToDraft();
      }
      
      // Clear auto-saved content now that it's properly saved
      localStorage.removeItem('content_builder_draft');
      localStorage.removeItem('content_builder_timestamp');
      
      // Force refresh content before navigating
      console.log("[SaveStep] Draft saved, refreshing content...");
      await refreshContent();
      console.log("[SaveStep] Content refreshed, found items:", contentItems.length);
      
      setSaveCompleted(true);
      toast.success("Content saved to library");
      
      // Set a consistent flag for content draft saved
      sessionStorage.setItem('content_draft_saved', 'true');
      sessionStorage.setItem('content_save_timestamp', Date.now().toString());
      console.log("[SaveStep] Session storage flags set for draft saved");
      
      // Clear auto-save data after successful save
      localStorage.removeItem('autoSave_content');
      localStorage.removeItem('autoSave_timestamp');
      
      // Success! Navigate to drafts ONLY if not in modal context
      toast.success('Content saved to drafts successfully!');
      
      // Only navigate if skipNavigation is false (not in modal context)
      if (!skipNavigation) {
        setTimeout(() => {
          navigate('/drafts', { state: { contentRefresh: true } });
        }, 1000);
      }
      // If skipNavigation is true, do NOTHING - let the modal control flow
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownload = async (format: 'pdf' | 'docx' | 'html') => {
    try {
      let blob: Blob;
      const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '');
      const fileName = `${sanitizedTitle.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      
      switch (format) {
        case 'html':
          const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizedTitle}</title>
  ${metaDescription ? `<meta name="description" content="${metaDescription.replace(/"/g, '&quot;')}">` : ''}
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #1a1a1a; }
    h1 { color: #111; font-size: 2rem; margin-bottom: 0.5em; } 
    h2 { color: #333; font-size: 1.5rem; margin-top: 2em; }
    h3 { color: #444; font-size: 1.25rem; }
    p { margin: 1em 0; } 
    img { max-width: 100%; height: auto; }
    ul, ol { padding-left: 1.5em; }
    blockquote { border-left: 3px solid #ddd; padding-left: 1em; margin: 1em 0; color: #666; }
  </style>
</head>
<body>
  <article>
    <h1>${sanitizedTitle}</h1>
    ${content}
  </article>
</body>
</html>`;
          blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          break;
          
        case 'docx':
          // Generate a simple HTML that Word can open
          const docxContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="UTF-8">
  <title>${sanitizedTitle}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
</head>
<body style="font-family: Calibri, sans-serif; font-size: 11pt;">
  <h1 style="font-size: 24pt;">${sanitizedTitle}</h1>
  ${content}
</body>
</html>`;
          blob = new Blob([docxContent], { type: 'application/vnd.ms-word;charset=utf-8' });
          break;
          
        case 'pdf':
          // For PDF, we create a printable HTML and let browser handle conversion
          const pdfWindow = window.open('', '_blank');
          if (pdfWindow) {
            pdfWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${sanitizedTitle}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; }
    h1 { font-size: 28px; margin-bottom: 20px; }
    h2 { font-size: 22px; margin-top: 30px; }
    p { margin: 15px 0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${sanitizedTitle}</h1>
  ${content}
  <script>window.print(); setTimeout(() => window.close(), 500);</script>
</body>
</html>`);
            pdfWindow.document.close();
            toast.success('PDF print dialog opened');
            return;
          } else {
            throw new Error('Pop-up blocked. Please allow pop-ups to export PDF.');
          }
          
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Content exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error instanceof Error ? error.message : `Failed to export as ${format.toUpperCase()}`);
    }
  };
  
  return {
    alreadySaved,
    existingContentId,
    hasAppliedOptimizations,
    handleViewExisting,
    title,
    setTitle,
    description,
    setDescription,
    socialShare,
    setSocialShare,
    handleSaveContent,
    isSubmitting,
    handleDownload,
    solutionName: selectedSolution ? selectedSolution.name : 'Not specified',
    seoScore,
    contentType,
    content,
    saveCompleted,
    autoSaved,
    savedContentId
  };
};
