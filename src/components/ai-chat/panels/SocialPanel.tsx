import React from 'react';
import { PanelShell } from './PanelShell';
import { SocialDashboard } from '@/components/engage/social/SocialDashboard';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { Share2 } from 'lucide-react';

export const SocialPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <WorkspaceProvider>
      <PanelShell isOpen={isOpen} onClose={onClose} title="Social" icon={<Share2 className="h-4 w-4" />}>
        <SocialDashboard />
      </PanelShell>
    </WorkspaceProvider>
  );
};
