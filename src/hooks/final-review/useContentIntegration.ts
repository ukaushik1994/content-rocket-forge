import { useCallback } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { ContentSyncService } from '@/services/contentSyncService';
import { toast } from 'sonner';
import { useFinalReview } from '@/hooks/useFinalReview';

/**
 * Hook to manage content integration between suggestions and the main builder context
 */
export const useContentIntegration = () => {
  const { state, setContent } = useContentBuilder();
  const { runAllChecks } = useFinalReview();

  const updateContent = useCallback(async (
    newContent: string,
    reason?: string,
    triggerRefresh = true
  ) => {
    try {
      // Update the main content
      setContent(newContent);
      
      // Trigger content analysis if requested
      if (triggerRefresh) {
        // Small delay to ensure content is updated in context
        setTimeout(async () => {
          try {
            await runAllChecks();
            if (reason) {
              toast.success(`Content updated: ${reason}`, {
                description: 'Running fresh analysis on updated content...'
              });
            }
          } catch (error) {
            console.error('Error refreshing checklist after content update:', error);
            toast.error('Content updated but failed to refresh checklist');
          }
        }, 500);
      } else if (reason) {
        toast.success(`Content updated: ${reason}`);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content: ' + error.message);
      return false;
    }
  }, [setContent, runAllChecks]);

  const resetContentTracking = useCallback(() => {
    // Reset content sync tracking
    ContentSyncService.resetAppliedSuggestions();
    toast.info('Content tracking reset');
  }, []);

  const validateContentUpdate = useCallback((
    originalContent: string,
    newContent: string
  ): { isValid: boolean; issues: string[] } => {
    const issues: string[] = [];
    
    // Basic validation
    if (!newContent || newContent.trim().length === 0) {
      issues.push('Content cannot be empty');
    }
    
    if (newContent.length < originalContent.length * 0.5) {
      issues.push('Content appears to have been significantly reduced');
    }
    
    if (newContent.length > originalContent.length * 2) {
      issues.push('Content appears to have been significantly expanded');
    }
    
    // Check for keyword presence if main keyword is set
    if (state.mainKeyword && !newContent.toLowerCase().includes(state.mainKeyword.toLowerCase())) {
      issues.push(`Main keyword "${state.mainKeyword}" not found in updated content`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }, [state.mainKeyword]);

  const safeUpdateContent = useCallback(async (
    originalContent: string,
    newContent: string,
    reason?: string,
    forceUpdate = false
  ) => {
    // Validate the content update
    const validation = validateContentUpdate(originalContent, newContent);
    
    if (!validation.isValid && !forceUpdate) {
      console.warn('Content validation failed:', validation.issues);
      toast.error('Content update validation failed', {
        description: validation.issues[0]
      });
      return false;
    }
    
    if (!validation.isValid && forceUpdate) {
      toast.warning('Forced content update with validation warnings', {
        description: validation.issues.join(', ')
      });
    }
    
    return await updateContent(newContent, reason, true);
  }, [updateContent, validateContentUpdate]);

  return {
    updateContent,
    safeUpdateContent,
    resetContentTracking,
    validateContentUpdate,
    currentContent: state.content,
    hasContent: !!state.content && state.content.trim().length > 0
  };
};

export default useContentIntegration;