
import React from 'react';
import { ContentReviewCard } from '../ContentReviewCard';
import { FinalChecklistCard } from '../FinalChecklistCard';
import { MetaInformationCard } from '../MetaInformationCard';
import { SolutionIntegrationCard } from '../SolutionIntegrationCard';
import { motion } from 'framer-motion';
import { useRunChecks } from '@/hooks/final-review/useRunChecks';
import { useChecklistItems } from '../hooks/useChecklistItems';

interface OverviewTabProps {
  content: string;
  checklistItems: {
    title: string;
    passed: boolean;
  }[];
  onRunAllChecks: () => void;
  metaTitle: string | null;
  metaDescription: string | null;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onGenerateMeta: () => void;
  solutionIntegrationMetrics: any | null;
  selectedSolution: any | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export const OverviewTab = ({
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
}: OverviewTabProps) => {
  const { isRunningAllChecks, runAllChecks } = useRunChecks();
  const { refreshChecklist } = useChecklistItems();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  // Handler that combines running all checks and refreshing the checklist
  const handleRunAllChecks = () => {
    // Pass refreshChecklist function to runAllChecks
    runAllChecks(refreshChecklist);
    onRunAllChecks(); // Call the original onRunAllChecks prop for backward compatibility
  };
  
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Main content area */}
      <motion.div className="lg:col-span-2" variants={item}>
        <ContentReviewCard content={content} />
      </motion.div>
      
      {/* Side panel */}
      <motion.div className="space-y-6">
        <motion.div variants={item}>
          <FinalChecklistCard 
            checks={checklistItems}
            isRefreshing={isRunningAllChecks}
            onRefresh={refreshChecklist}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <MetaInformationCard 
            metaTitle={metaTitle || ''} 
            metaDescription={metaDescription || ''}
            onMetaTitleChange={onMetaTitleChange}
            onMetaDescriptionChange={onMetaDescriptionChange}
            onGenerateMeta={onGenerateMeta}
          />
        </motion.div>

        <motion.div variants={item}>
          <SolutionIntegrationCard
            metrics={solutionIntegrationMetrics}
            solution={selectedSolution}
            isAnalyzing={isAnalyzing}
            onAnalyze={onAnalyze}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
