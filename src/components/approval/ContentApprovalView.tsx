
import React, { useState, useEffect } from 'react';
import { ContentApprovalHeader } from './ContentApprovalHeader';
import { ContentApprovalWorkflow } from './ContentApprovalWorkflow';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalProvider } from './context/ApprovalContext';
import { ApprovalEmptyState } from './ApprovalEmptyState';
import { motion } from 'framer-motion';

type ContentStatusFilter = 'all' | 'draft' | 'approved' | 'published';

export const ContentApprovalView = () => {
  const { contentItems, loading } = useContent();
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContentStatusFilter>('all');
  
  // Filter content based on selected status
  const filteredContent = contentItems.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });
  
  // Get counts for each status
  const contentStats = {
    all: contentItems.length,
    draft: contentItems.filter(item => item.status === 'draft').length,
    approved: contentItems.filter(item => item.status === 'approved').length,
    published: contentItems.filter(item => item.status === 'published').length
  };
  
  // If current selection is no longer in filtered list, clear selection
  useEffect(() => {
    if (selectedContent && !filteredContent.some(item => item.id === selectedContent.id)) {
      setSelectedContent(null);
    }
  }, [statusFilter, filteredContent, selectedContent]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ContentApprovalHeader 
        contentStats={contentStats}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        selectedContent={selectedContent}
      />
      
      {filteredContent.length > 0 ? (
        <ApprovalProvider>
          <ContentApprovalWorkflow 
            contentItems={filteredContent}
            selectedContent={selectedContent}
            onSelectContent={setSelectedContent}
            statusFilter={statusFilter}
          />
        </ApprovalProvider>
      ) : (
        <ApprovalEmptyState loading={loading} />
      )}
    </motion.div>
  );
};
