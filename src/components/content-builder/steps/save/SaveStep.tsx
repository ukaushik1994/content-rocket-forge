
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SaveAlreadyExistsAlert } from './SaveAlreadyExistsAlert';
import { SaveStepOptimizationsAlert } from './SaveStepOptimizationsAlert';
import { ContentDetailsCard } from './ContentDetailsCard';
import { ContentSummaryCard } from './ContentSummaryCard';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
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
        
        // Set session storage flags
        sessionStorage.setItem('content_draft_saved', 'true');
        sessionStorage.setItem('content_save_timestamp', Date.now().toString());
        
        // Call completion callback with comprehensive error handling
        if (onSaveComplete) {
          console.log('[SaveStep] Calling onSaveComplete with contentId:', savedContentId);
          try {
            // Add timeout protection
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('onSaveComplete timeout')), 10000)
            );
            
            const completionPromise = onSaveComplete(savedContentId);
            
            await Promise.race([completionPromise, timeoutPromise]);
            
            console.log('[SaveStep] ✅ onSaveComplete callback completed successfully');
          } catch (error) {
            console.error('[SaveStep] ❌ Error in onSaveComplete callback:', error);
            
            if (isMounted) {
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              
              if (errorMsg.includes('timeout')) {
                toast.error('Save completed but final validation timed out - content is safe');
              } else {
                toast.error('Save completed but validation failed - check proposal status manually');
              }
            }
            
            // DO NOT rethrow - we want the modal to close even on error
          }
        } else {
          // Not in modal context - show success toast
          if (isMounted) {
            toast.success('Content saved successfully! Navigating to content library...');
          }
        }
      }
    };
    
    // Wrap in try-catch to prevent React error
    handleAsyncCompletion().catch(error => {
      console.error('[SaveStep] Unhandled error in async completion:', error);
      toast.error('An error occurred after saving - your content is safe');
    });
    
    // Cleanup function
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
      
      {/* Hidden auto-save trigger button */}
      {isInModalContext && (
        <button
          data-auto-save-trigger
          onClick={handleSaveContent}
          disabled={isSubmitting || !content || !mainKeyword || !title.trim()}
          className="hidden"
          aria-hidden="true"
        />
      )}
      
      {/* Manual save button for non-modal context */}
      {!isInModalContext && (
        <div className="flex justify-center pt-4">
          <Button
            className={`gap-1 ${
              alreadySaved 
              ? 'bg-secondary hover:bg-secondary/90' 
              : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'
            } min-w-[150px]`}
            onClick={handleSaveContent}
            disabled={isSubmitting || !content || !mainKeyword || !title.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : alreadySaved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                View in Content Library
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Save Content
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
