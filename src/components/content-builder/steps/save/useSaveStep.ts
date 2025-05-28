
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SaveContentParams } from '@/contexts/content-builder/types/content-types';

export const useSaveStep = () => {
  const { state, saveContentToDraft, saveContentToPublished } = useContentBuilder();
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
    content,
    comprehensiveAnalytics
  } = state;
  
  const { contentItems, refreshContent } = useContent();
  const navigate = useNavigate();
  
  // Track optimizations
  const hasAppliedOptimizations = seoImprovements?.some(improvement => improvement.applied) || false;
  
  // Initialize title from contentTitle or metaTitle if available, otherwise use a default
  const [title, setTitle] = useState(contentTitle || metaTitle || `${mainKeyword} - Complete Guide`);
  
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
    
    if (metaTitle) {
      setTitle(metaTitle);
      console.log("[SaveStep] Updated title from metaTitle:", metaTitle);
    } else if (contentTitle) {
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
      const similarContent = contentItems.find(item => {
        const titleMatch = item.title.toLowerCase() === title.toLowerCase();
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

    if (alreadySaved && existingContentId) {
      toast.info("Navigating to existing content in your library");
      handleViewExisting();
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("[SaveStep] Saving content with enhanced analytics:", {
        title,
        description,
        hasAnalytics: !!comprehensiveAnalytics,
        analyticsScore: comprehensiveAnalytics?.contentQualityMetrics.overallScore
      });
      
      await saveContentToDraft();
      
      localStorage.removeItem('content_builder_draft');
      localStorage.removeItem('content_builder_timestamp');
      
      console.log("[SaveStep] Draft saved with enhanced metadata, refreshing content...");
      await refreshContent();
      
      setSaveCompleted(true);
      toast.success("Content saved with comprehensive analytics");
      
      sessionStorage.setItem('content_draft_saved', 'true');
      sessionStorage.setItem('content_save_timestamp', Date.now().toString());
      
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

  const handlePublishContent = async () => {
    if (!content || !mainKeyword) {
      toast.error("Content or keywords are missing");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("[SaveStep] Publishing content with enhanced analytics");
      
      await saveContentToPublished();
      
      localStorage.removeItem('content_builder_draft');
      localStorage.removeItem('content_builder_timestamp');
      
      await refreshContent();
      
      setSaveCompleted(true);
      toast.success("Content published with comprehensive analytics");
      
      setTimeout(() => {
        navigate('/content', { 
          state: { contentRefresh: true }
        });
      }, 1000);
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownload = (format: 'pdf' | 'docx' | 'html') => {
    toast.success(`Content exported as ${format.toUpperCase()}`);
    
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };
  
  // Enhanced analytics summary for display
  const getAnalyticsSummary = () => {
    if (!comprehensiveAnalytics) {
      return {
        overallScore: seoScore || 0,
        hasAnalytics: false,
        readabilityGrade: 'Unknown',
        contentLength: content?.split(/\s+/).length || 0
      };
    }

    return {
      overallScore: comprehensiveAnalytics.contentQualityMetrics.overallScore,
      hasAnalytics: true,
      readabilityGrade: comprehensiveAnalytics.readabilityMetrics.grade,
      contentLength: comprehensiveAnalytics.technicalSeoMetrics.contentLength,
      structureScore: comprehensiveAnalytics.contentQualityMetrics.structureScore,
      keywordScore: comprehensiveAnalytics.contentQualityMetrics.keywordOptimizationScore,
      metaScore: comprehensiveAnalytics.contentQualityMetrics.metaOptimizationScore
    };
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
    handlePublishContent,
    isSubmitting,
    handleDownload,
    solutionName: selectedSolution ? selectedSolution.name : 'Not specified',
    seoScore: comprehensiveAnalytics?.contentQualityMetrics.overallScore || seoScore,
    contentType,
    content,
    saveCompleted,
    autoSaved,
    analyticsSummary: getAnalyticsSummary()
  };
};
