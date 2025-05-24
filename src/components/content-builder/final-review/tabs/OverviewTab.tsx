import React from 'react';
import { useEnhancedChecklistItems } from '../hooks/useEnhancedChecklistItems';
import { EnhancedFinalChecklistCard } from '../EnhancedFinalChecklistCard';
import { ContentReviewCard } from '../ContentReviewCard';
import { MetaInformationCard } from '../MetaInformationCard';
import { SolutionIntegrationCard } from '../SolutionIntegrationCard';

interface OverviewTabProps {
  content: string;
  checklistItems: Array<{title: string, passed: boolean}>;
  onRunAllChecks: () => void;
  metaTitle: string | null;
  metaDescription: string | null;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onGenerateMeta: () => void;
  solutionIntegrationMetrics: any;
  selectedSolution: any;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  content,
  checklistItems,
  onRunAllChecks,
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onGenerateMeta,
  solutionIntegrationMetrics,
  selectedSolution,
  isAnalyzing,
  onAnalyze
}) => {
  const {
    sections,
    totalChecks,
    passedChecks,
    overallCompletionPercentage,
    isAnalyzing: isChecklistAnalyzing,
    refreshChecklist,
    toggleSection
  } = useEnhancedChecklistItems();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Review */}
      <div className="space-y-4">
        <ContentReviewCard content={content} />
      </div>
      
      {/* Enhanced Checklist */}
      <div className="space-y-4">
        <EnhancedFinalChecklistCard
          sections={sections}
          totalChecks={totalChecks}
          passedChecks={passedChecks}
          overallCompletionPercentage={overallCompletionPercentage}
          isAnalyzing={isChecklistAnalyzing}
          onRefresh={refreshChecklist}
          onToggleSection={toggleSection}
        />
        
        <MetaInformationCard
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          onMetaTitleChange={onMetaTitleChange}
          onMetaDescriptionChange={onMetaDescriptionChange}
          onGenerateMeta={onGenerateMeta}
        />
        
        {selectedSolution && (
          <SolutionIntegrationCard
            solutionIntegrationMetrics={solutionIntegrationMetrics}
            selectedSolution={selectedSolution}
            isAnalyzing={isAnalyzing}
            onAnalyze={onAnalyze}
          />
        )}
      </div>
    </div>
  );
};
