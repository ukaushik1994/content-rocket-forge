
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveAlreadyExistsAlert } from './SaveAlreadyExistsAlert';
import { SaveStepOptimizationsAlert } from './SaveStepOptimizationsAlert';
import { ContentDetailsCard } from './ContentDetailsCard';
import { ContentSummaryCard } from './ContentSummaryCard';
import { SaveActions } from './SaveActions';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaveStep } from './useSaveStep';
import { toast } from 'sonner';

interface SaveStepProps {
  onSaveComplete?: (contentId: string) => Promise<void>;
}

export const SaveStep = ({ onSaveComplete }: SaveStepProps = {}) => {
  const { state } = useContentBuilder();
  const { content, mainKeyword } = state;
  const navigate = useNavigate();
  
  // Detect if we're in modal context (has onSaveComplete callback)
  const isInModalContext = !!onSaveComplete;
  
  const {
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
    saveCompleted,
    savedContentId
  } = useSaveStep(isInModalContext);
  
  // Set a flag in session storage when saving and handle completion callback
  useEffect(() => {
    let isMounted = true;
    
    const handleAsyncCompletion = async () => {
      if (saveCompleted && savedContentId && isMounted) {
        console.log('[SaveStep] Save completed with ID:', savedContentId);
        // Use consistent flag names across the app
        sessionStorage.setItem('content_draft_saved', 'true');
        sessionStorage.setItem('content_save_timestamp', Date.now().toString());
        
        // Call the completion callback if provided with actual contentId
        if (onSaveComplete) {
          console.log('[SaveStep] Calling onSaveComplete with contentId:', savedContentId);
          try {
            await onSaveComplete(savedContentId);
          } catch (error) {
            console.error('[SaveStep] Error in onSaveComplete callback:', error);
            if (isMounted) {
              toast.error('Save completed but validation failed - check proposal status manually');
            }
          }
        } else {
          if (isMounted) {
            toast.success('Content saved successfully! Navigating to content library...');
          }
        }
      }
    };
    
    handleAsyncCompletion();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [saveCompleted, savedContentId, onSaveComplete]);
  
  // Validate that we have content before showing the form
  if (!content || content.trim().length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
        <p className="text-muted-foreground mb-6">
          You need to generate content before you can save or publish.
        </p>
        <Button onClick={() => navigate('/content-builder')}>
          Return to Content Builder
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Alert for already saved content */}
      {alreadySaved && (
        <SaveAlreadyExistsAlert 
          onViewExisting={handleViewExisting}
        />
      )}
      
      {/* Alert for applied optimizations */}
      {hasAppliedOptimizations && (
        <SaveStepOptimizationsAlert />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Details Card */}
        <ContentDetailsCard
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          socialShare={socialShare}
          setSocialShare={setSocialShare}
        />
        
        {/* Content Summary Card */}
        <ContentSummaryCard
          handleDownload={handleDownload}
          socialShare={socialShare}
        />
      </div>
      
      {/* Save Actions */}
      <SaveActions
        alreadySaved={alreadySaved}
        isSubmitting={isSubmitting}
        handleSaveContent={handleSaveContent}
        content={content}
        mainKeyword={mainKeyword}
        title={title}
      />
    </div>
  );
};
