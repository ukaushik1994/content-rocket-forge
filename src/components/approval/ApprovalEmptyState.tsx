
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface ApprovalEmptyStateProps {
  loading: boolean;
}

export const ApprovalEmptyState: React.FC<ApprovalEmptyStateProps> = ({ loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-6 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-9 w-36" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 border rounded-lg bg-background/50">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">No content pending approval</h3>
      <p className="text-muted-foreground mb-6">Create some content in the builder to get started.</p>
      <Button onClick={() => navigate('/content-builder')}>
        Create Content
      </Button>
    </div>
  );
};
