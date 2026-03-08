import React from 'react';
import { PanelShell } from './PanelShell';
import { EmailDashboard } from '@/components/engage/email/EmailDashboard';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { Mail } from 'lucide-react';

export const EmailPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <WorkspaceProvider>
      <PanelShell isOpen={isOpen} onClose={onClose} title="Email" icon={<Mail className="h-4 w-4" />}>
        <EmailDashboard />
      </PanelShell>
    </WorkspaceProvider>
  );
};
