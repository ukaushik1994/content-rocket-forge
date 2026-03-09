
import React from 'react';
import { Plus } from 'lucide-react';
import { UnifiedEmptyState } from '@/components/ui/UnifiedEmptyState';

interface EmptyStateProps {
  searchTerm?: string;
  onAddNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, onAddNew }) => {
  if (searchTerm) {
    return (
      <UnifiedEmptyState
        title={`No offerings found matching "${searchTerm}"`}
        description="Try a different search term or clear the search."
      />
    );
  }

  return (
    <UnifiedEmptyState
      icon={Plus}
      title="No Offerings Yet"
      description="Create your first business offering to start generating content that showcases your products or services."
      actionLabel="Add Your First Offering"
      onAction={onAddNew}
    />
  );
};
