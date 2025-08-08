
import React from 'react';
import { ModernContentApproval } from './modern/ModernContentApproval';
import { useContent } from '@/contexts/content';
import { ApprovalProvider } from './context/ApprovalContext';

export const ContentApprovalView: React.FC = () => {
  const { contentItems } = useContent();
  
  return (
    <ApprovalProvider>
      <ModernContentApproval contentItems={contentItems} />
    </ApprovalProvider>
  );
};
