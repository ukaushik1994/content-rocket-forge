
import React from 'react';
import { FileText } from 'lucide-react';
import { UnifiedEmptyState } from '@/components/ui/UnifiedEmptyState';

interface ApprovalEmptyStateProps {
  loading: boolean;
}

export const ApprovalEmptyState: React.FC<ApprovalEmptyStateProps> = ({ loading }) => {
  return (
    <UnifiedEmptyState
      loading={loading}
      icon={FileText}
      title="No content matching filter"
      description="Try selecting a different filter to view available content for review and approval."
    />
  );
};
