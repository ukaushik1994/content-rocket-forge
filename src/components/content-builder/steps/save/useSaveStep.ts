
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';
import { useSaveContent } from '@/hooks/final-review/useSaveContent';

export const useSaveStep = () => {
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
  
  // Check for auto-saved content
  useEffect(() => {
    const hasDraft = localStorage.getItem('content_builder_draft') !== null;
    setAutoSaved(hasDraft);
    
    // If there's an auto-saved draft, remind the user it needs to be saved properly
    if (hasDraft && !saveCompleted) {
      toast.info(
        "You have auto-saved content that needs to be properly saved to your library",
        { duration: 5000 }
      );
    }
  }, [saveCompleted]);
  
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
      
      // Navigate to drafts page after a short delay 
      setTimeout(() => {
        console.log("[SaveStep] Navigating to drafts page...");
        navigate('/drafts', { 
          state: { contentRefresh: true }
        });
      }, 1000);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownload = (format: 'pdf' | 'docx' | 'html') => {
    toast.success(`Content exported as ${format.toUpperCase()}`);
    
    // Mock download functionality
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
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
    autoSaved
  };
};
