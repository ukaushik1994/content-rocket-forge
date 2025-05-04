
import React, { useState } from 'react';
import { ContentApprovalHeader } from './ContentApprovalHeader';
import { ContentApprovalWorkflow } from './ContentApprovalWorkflow';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalProvider } from './context/ApprovalContext';
import { ApprovalEmptyState } from './ApprovalEmptyState';
import { motion } from 'framer-motion';

export const ContentApprovalView = () => {
  const { contentItems, loading } = useContent();
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  
  // Filter for draft content items that need approval
  const pendingApprovalItems = contentItems.filter(item => item.status === 'draft');

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ContentApprovalHeader 
        pendingCount={pendingApprovalItems.length}
        selectedContent={selectedContent}
        onSelectContent={setSelectedContent}
      />
      
      {pendingApprovalItems.length > 0 ? (
        <ApprovalProvider>
          <ContentApprovalWorkflow 
            contentItems={pendingApprovalItems}
            selectedContent={selectedContent}
            onSelectContent={setSelectedContent}
          />
        </ApprovalProvider>
      ) : (
        <ApprovalEmptyState loading={loading} />
      )}
    </motion.div>
  );
};
