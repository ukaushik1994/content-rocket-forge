
import React from 'react';
import { ContentReviewCard } from '../ContentReviewCard';
import { FinalChecklistCard } from '../FinalChecklistCard';
import { MetaInformationCard } from '../MetaInformationCard';
import { motion } from 'framer-motion';

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
}

export const OverviewTab = ({
  content,
  checklistItems,
  onRunAllChecks,
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onGenerateMeta
}: OverviewTabProps) => {
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
          <FinalChecklistCard checks={checklistItems} />
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
      </motion.div>
    </motion.div>
  );
};
