import React, { useState } from 'react';
import { PanelShell } from './PanelShell';
import { RepositoryTabs } from '@/components/repository/RepositoryTabs';
import { ContentDetailModal } from '@/components/repository/ContentDetailModal';
import { ContentItemType } from '@/contexts/content/types';
import { ContentProvider } from '@/contexts/content';
import { FileText } from 'lucide-react';

const RepositoryPanelInner: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpenDetail = (content: ContentItemType) => {
    setSelectedContent(content);
    setDetailOpen(true);
  };

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Repository" icon={<FileText className="h-4 w-4" />}>
      <RepositoryTabs onOpenDetailView={handleOpenDetail} />
      <ContentDetailModal
        content={selectedContent}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </PanelShell>
  );
};

export const RepositoryPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <ContentProvider>
    <RepositoryPanelInner {...props} />
  </ContentProvider>
);
