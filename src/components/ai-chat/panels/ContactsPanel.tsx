import React from 'react';
import { PanelShell } from './PanelShell';
import { ContactsList } from '@/components/engage/contacts/ContactsList';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { Users } from 'lucide-react';

export const ContactsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <WorkspaceProvider>
      <PanelShell isOpen={isOpen} onClose={onClose} title="Contacts" icon={<Users className="h-4 w-4" />}>
        <ContactsList />
      </PanelShell>
    </WorkspaceProvider>
  );
};
