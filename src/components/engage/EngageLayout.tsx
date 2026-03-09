import React from 'react';
import { EngageBreadcrumb } from './shared/EngageBreadcrumb';
import { EngageBackground } from './shared/EngageBackground';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';

interface EngageLayoutProps {
  children: React.ReactNode;
}

export const EngageLayout: React.FC<EngageLayoutProps> = ({ children }) => {
  const { loading, currentWorkspaceId } = useWorkspace();

  return (
    <div className="min-h-screen relative">
      <div className="h-[calc(100vh-4rem)] overflow-auto relative">
        <EngageBackground />
        <div className="relative z-0 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <EngageBreadcrumb />
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
};