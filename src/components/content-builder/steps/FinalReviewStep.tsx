import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Import components
import { OverviewTab, OptimizeTab, TechnicalTab } from '../final-review/tabs';
import { FinalReviewHeader } from '../final-review/FinalReviewHeader';
import { FinalReviewTabNavigation } from '../final-review/FinalReviewTabNavigation';
import { FinalReviewQuickActions } from '../final-review/FinalReviewQuickActions';
import { useChecklistItems } from '../final-review/hooks/useChecklistItems';
import { useConfetti } from '@/hooks/final-review/useConfetti';
import { toast } from 'sonner';
import { SaveContentDialog } from '../steps/writing/SaveContentDialog';
import { SaveAndExportPanel } from '../final-review/SaveAndExportPanel';
import { Button } from '@/components/ui/button';
import { Loader2, Save, FileCheck } from 'lucide-react';

export const FinalReviewStep = () => {
  const { state, dispatch, saveContentToDraft, saveContentToPublished, setMetaTitle, setMetaDescription } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    metaTitle, 
    metaDescription, 
    documentStructure, 
    selectedSolution,
    solutionIntegrationMetrics,
    selectedKeywords,
    seoScore,
    serpData,
    outline
  } = state;
  
  const { 
    isAnalyzing, 
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage, 
    ctaInfo, 
    titleSuggestions,
    generateMeta, 
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks
  } = useFinalReview();

  const { checklistItems, completionPercentage, passedChecks, totalChecks } = useChecklistItems();
  const [activeTab, setActiveTab] = useState("overview");
  const { confettiShown, triggerConfetti } = useConfetti();
  
  // State for save functionality
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState(metaTitle || '');
  const [saveNote, setSaveNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedToDraft, setIsSavedToDraft] = useState(false);
  
  // Debug current state
  useEffect(() => {
    console.log("[FinalReviewStep] Current state:", { 
      metaTitle, 
      contentTitle: state.contentTitle, 
      metaDescription
    });
  }, [metaTitle, state.contentTitle, metaDescription, state]);
  
  // Set meta information when component mounts if not already set
  useEffect(() => {
    if (content && mainKeyword && (!metaTitle || !metaDescription)) {
      console.log("[FinalReviewStep] No meta information detected, generating...");
      generateMeta();
      toast.info("Generating meta information for your content...");
    }
  }, [content, mainKeyword, metaTitle, metaDescription, generateMeta]);

  // Trigger confetti when all checks pass
  useEffect(() => {
    if (completionPercentage === 100 && !confettiShown) {
      triggerConfetti();
      toast.success("All checks passed! Your content is ready to publish.");
    }
  }, [completionPercentage, confettiShown, triggerConfetti]);
  
  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta title to:", value);
    // Update both metaTitle and contentTitle for consistency
    setMetaTitle(value);
    dispatch({ type: 'SET_CONTENT_TITLE', payload: value });
    setSaveTitle(value); // Update the save dialog title too
  };
  
  const handleMetaDescriptionChange = (value: string) => {
    console.log("[FinalReviewStep] Setting meta description to:", value);
    setMetaDescription(value);
  };
  
  // Handler for running necessary checks based on the current tab
  const handleRunTabChecks = () => {
    switch (activeTab) {
      case "overview":
        // Run content-specific checks
        if (!metaTitle || !metaDescription) {
          generateMeta();
        }
        break;
      case "optimize":
        // Run SEO-specific checks
        analyzeSolutionUsage();
        generateTitleSuggestions();
        break;
      case "technical":
        // Run technical checks
        // (This could include structure validation or other technical aspects)
        break;
      default:
        // Run all checks as a fallback
        runAllChecks();
    }
  };

  // Save content to draft
  const handleSaveToDraft = async () => {
    if (!saveTitle.trim()) {
      toast.error("Please enter a title before saving");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveContentToDraft({
        title: saveTitle,
        note: saveNote,
        isPublished: false,
        mainKeyword,
        content,
        metaTitle,
        metaDescription,
        outline,
        seoScore
      });
      
      setIsSavedToDraft(true);
      toast.success("Content saved to drafts");
      
      // Close the dialog after saving
      setShowSaveDialog(false);
      
      // Mark the step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish content directly
  const handlePublishContent = async () => {
    if (!metaTitle) {
      toast.error("Please set a title before publishing");
      return;
    }
    
    if (completionPercentage < 60) {
      toast.warning("Your content still needs optimization before publishing");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveContentToPublished({
        title: metaTitle,
        note: "Published from content builder",
        isPublished: true,
        mainKeyword,
        content,
        metaTitle,
        metaDescription,
        outline,
        seoScore
      });
      
      toast.success("Content published successfully!");
      
      // Mark the step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 6 });
    } catch (error) {
      console.error("Error publishing content:", error);
      toast.error("Failed to publish content. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FinalReviewHeader 
          completionPercentage={completionPercentage}
          passedChecks={passedChecks}
          totalChecks={totalChecks}
          seoScore={seoScore}
        />
      </motion.div>
      
      {/* Save and Export Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <SaveAndExportPanel
          completionPercentage={completionPercentage}
          onSave={() => setShowSaveDialog(true)}
          onPublish={handlePublishContent}
          isSaving={isSaving}
          isSavedToDraft={isSavedToDraft}
        />
      </motion.div>
      
      {/* Quick Actions - Now contextual based on current tab */}
      <FinalReviewQuickActions 
        isRunningAllChecks={isRunningAllChecks} 
        onRunAllChecks={runAllChecks}
        activeTab={activeTab}
        onRunTabChecks={handleRunTabChecks}
      />
      
      {/* Main Content Area with Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <FinalReviewTabNavigation />
          
          {/* Overview Tab (replaces Content tab) */}
          <TabsContent value="overview" className="mt-0">
            <OverviewTab 
              content={content} 
              checklistItems={checklistItems}
              onRunAllChecks={runAllChecks}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              onMetaTitleChange={handleMetaTitleChange}
              onMetaDescriptionChange={handleMetaDescriptionChange}
              onGenerateMeta={generateMeta}
            />
          </TabsContent>
          
          {/* Optimize Tab (replaces SEO tab) */}
          <TabsContent value="optimize" className="mt-0">
            <OptimizeTab 
              keywordUsage={keywordUsage}
              mainKeyword={mainKeyword}
              selectedKeywords={selectedKeywords}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              onMetaTitleChange={handleMetaTitleChange}
              onMetaDescriptionChange={handleMetaDescriptionChange}
              onGenerateMeta={generateMeta}
              solutionIntegrationMetrics={solutionIntegrationMetrics}
              selectedSolution={selectedSolution}
              isAnalyzing={isAnalyzing}
              onAnalyze={analyzeSolutionUsage}
              titleSuggestions={titleSuggestions}
              isGeneratingTitles={isGeneratingTitles}
              onGenerateTitleSuggestions={generateTitleSuggestions}
              completionPercentage={completionPercentage}
            />
          </TabsContent>
          
          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-0">
            <TechnicalTab 
              documentStructure={documentStructure}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              serpData={serpData}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Save Dialog */}
      <SaveContentDialog
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        saveTitle={saveTitle}
        setSaveTitle={setSaveTitle}
        saveNote={saveNote}
        setSaveNote={setSaveNote}
        handleSaveToDraft={handleSaveToDraft}
        isSaving={isSaving}
        mainKeyword={mainKeyword}
        content={content}
        outlineLength={outline ? outline.length : 0}
      />
    </div>
  );
};
