
import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UnifiedEmptyState } from '@/components/ui/UnifiedEmptyState';

interface EmptyStateProps {
  selectedTab: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedTab }) => {
  const navigate = useNavigate();
  
  return (
    <UnifiedEmptyState
      icon={Plus}
      title={`No ${selectedTab === 'all' ? 'content items' : selectedTab} found`}
      description="Create content in the wizard to see it here."
      actionLabel="Create Your First Draft"
      onAction={() => navigate('/ai-chat')}
    />
  );
};
