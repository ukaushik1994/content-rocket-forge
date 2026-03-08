import React from 'react';
import { PanelShell } from './PanelShell';
import { SolutionManager } from '@/components/solutions/manager/SolutionManager';
import { Puzzle } from 'lucide-react';

export const OfferingsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Offerings" icon={<Puzzle className="h-4 w-4" />}>
      <SolutionManager />
    </PanelShell>
  );
};
