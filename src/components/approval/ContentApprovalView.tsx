
import React, { useState, useEffect } from 'react';
import { ContentApprovalHeader } from './ContentApprovalHeader';
import { ContentApprovalWorkflow } from './ContentApprovalWorkflow';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalProvider } from './context/ApprovalContext';

export const ContentApprovalView: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { contentItems, loading } = useContent();
  
  // Filter content based on selected status
  const filteredContent = contentItems.filter(item => 
    statusFilter === 'all' || item.approval_status === statusFilter
  );
  
  // Calculate content statistics using approval_status
  const contentStats = {
    all: contentItems.length,
    draft: contentItems.filter(item => item.approval_status === 'draft').length,
    pending_review: contentItems.filter(item => item.approval_status === 'pending_review').length,
    approved: contentItems.filter(item => item.approval_status === 'approved').length,
    published: contentItems.filter(item => item.approval_status === 'published').length
  };
  
  // Handle status filter change
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setSelectedContent(null); // Reset selected content when filter changes
  };
  
  return (
    <ApprovalProvider>
      <div className="space-y-6">
        <ContentApprovalHeader 
          contentStats={contentStats}
          statusFilter={statusFilter}
          onFilterChange={handleFilterChange}
          selectedContent={selectedContent}
        />
        
        <ContentApprovalWorkflow 
          contentItems={filteredContent}
          selectedContent={selectedContent}
          onSelectContent={setSelectedContent}
          statusFilter={statusFilter}
        />
      </div>
    </ApprovalProvider>
  );
};
