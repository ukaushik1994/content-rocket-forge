
import React, { useState } from 'react';
import { ContentApprovalHeader } from './ContentApprovalHeader';
import { ContentApprovalWorkflow } from './ContentApprovalWorkflow';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalProvider } from './context/ApprovalContext';
import { ApprovalEmptyState } from './ApprovalEmptyState';

export const ContentApprovalView = () => {
  const { contentItems, loading } = useContent();
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  
  // Filter for draft content items that need approval
  const pendingApprovalItems = contentItems.filter(item => item.status === 'draft');

  return (
    <div className="space-y-6">
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
    </div>
  );
};
