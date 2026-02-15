import React from 'react';
import { EngageSidebar } from './EngageSidebar';
import { PageLayout } from '@/components/layout/PageLayout';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';

interface EngageLayoutProps {
  children: React.ReactNode;
}

export const EngageLayout: React.FC<EngageLayoutProps> = ({ children }) => {
  const { loading, currentWorkspaceId } = useWorkspace();

  return (
    <PageLayout containerized={false} className="!p-0 !pt-16">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <EngageSidebar />
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !currentWorkspaceId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">No workspace found</p>
                <p className="text-sm text-muted-foreground">Create or join a workspace to use Engage.</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </PageLayout>
  );
};
