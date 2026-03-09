import React from 'react';
import { EngageBreadcrumb } from './shared/EngageBreadcrumb';
import { EngageBackground } from './shared/EngageBackground';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Loader2 } from 'lucide-react';

interface EngageLayoutProps {
  children: React.ReactNode;
}

export const EngageLayout: React.FC<EngageLayoutProps> = ({ children }) => {
  const { loading, currentWorkspaceId } = useWorkspace();
  const { pathname } = useLocation();

  // Full-screen builder routes get no padding, no backgrounds, no breadcrumb
  const isBuilderRoute = /\/engage\/journeys\/[a-f0-9-]{36}/i.test(pathname);

  return (
    <div className="min-h-screen relative">
      <div className="h-[calc(100vh-4rem)] overflow-auto relative">
        {!isBuilderRoute && (
          <>
            <EngageBackground />
            <AnimatedBackground intensity="low" />
          </>
        )}
        <div className={`relative z-0 ${isBuilderRoute ? 'h-full' : 'p-6'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {!isBuilderRoute && <EngageBreadcrumb />}
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
};