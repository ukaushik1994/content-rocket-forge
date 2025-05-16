
import React from 'react';
import { OptimizeReviewHeader } from './optimize-review/OptimizeReviewHeader';
import { OptimizeReviewTabs } from './optimize-review/OptimizeReviewTabs';
import { OptimizeReviewActions } from './optimize-review/OptimizeReviewActions';
import { OptimizeReviewSavePanel } from './optimize-review/OptimizeReviewSavePanel';
import { useOptimizeReview } from './optimize-review/hooks/useOptimizeReview';

export const OptimizeAndReviewStep = () => {
  const {
    activeTab,
    handleTabChange,
    state,
    isAnalyzing,
    isRunningAllChecks,
    keywordUsage,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    runAllChecks,
    handleRunTabChecks,
    onMetaTitleChange,
    onMetaDescriptionChange,
    handleSaveToDraftWrapper,
    handlePublishWrapper,
    isSaving,
    isSavedToDraft,
    checklistItems,
    passedChecks,
    totalChecks,
    completionPercentage,
    isGeneratingTitles
  } = useOptimizeReview();
  
  return (
    <div className="space-y-8">
      <OptimizeReviewHeader 
        completionPercentage={completionPercentage} 
        passedChecks={passedChecks}
        totalChecks={totalChecks}
        seoScore={state.seoScore}
      />
      
      <OptimizeReviewSavePanel 
        completionPercentage={completionPercentage}
        onSave={handleSaveToDraftWrapper}
        onPublish={handlePublishWrapper}
        isSaving={isSaving}
        isSavedToDraft={isSavedToDraft}
      />
      
      <OptimizeReviewActions 
        isRunningAllChecks={isRunningAllChecks}
        onRunAllChecks={runAllChecks}
        activeTab={activeTab}
        onRunTabChecks={handleRunTabChecks}
      />
      
      <OptimizeReviewTabs
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        state={state}
        isAnalyzing={isAnalyzing}
        isGeneratingTitles={isGeneratingTitles}
        keywordUsage={keywordUsage}
        titleSuggestions={titleSuggestions}
        serpData={serpData}
        onMetaTitleChange={onMetaTitleChange}
        onMetaDescriptionChange={onMetaDescriptionChange}
        onGenerateMeta={generateMeta}
        onGenerateTitleSuggestions={generateTitleSuggestions}
        onAnalyze={analyzeSolutionUsage}
        checklistItems={checklistItems}
        onRunAllChecks={runAllChecks}
        completionPercentage={completionPercentage}
      />
    </div>
  );
};
