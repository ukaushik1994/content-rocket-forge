import React from 'react';
import { PanelShell } from './PanelShell';
import { ContentApprovalView } from '@/components/approval/ContentApprovalView';
import { ContentProvider } from '@/contexts/content';
import { CheckCircle } from 'lucide-react';

export const ApprovalsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <ContentProvider>
      <PanelShell isOpen={isOpen} onClose={onClose} title="Approvals" icon={<CheckCircle className="h-4 w-4" />}>
        <ContentApprovalView />
      </PanelShell>
    </ContentProvider>
  );
};
