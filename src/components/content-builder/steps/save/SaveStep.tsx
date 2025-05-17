
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

export const SaveStep = () => {
  const { state } = useContentBuilder();
  const { content, mainKeyword } = state;
  const navigate = useNavigate();
  
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
    saveCompleted
  } = useSaveStep();
  
  // Set a flag in session storage when saving and navigating to content library
  useEffect(() => {
    if (saveCompleted) {
      console.log('[SaveStep] Save completed, setting session storage flag');
      // Use consistent flag names across the app
      sessionStorage.setItem('content_draft_saved', 'true');
      sessionStorage.setItem('content_save_timestamp', Date.now().toString());
      toast.success('Content saved successfully! Navigating to content library...');
    }
  }, [saveCompleted]);
  
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
