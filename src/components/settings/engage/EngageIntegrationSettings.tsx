import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { EngageSettings } from '@/components/engage/settings/EngageSettings';
import { Loader2 } from 'lucide-react';

/**
 * Engage integration settings embedded in the global Settings dialog.
 * Auto-provisions a workspace transparently, then renders the full EngageSettings.
 */
export const EngageIntegrationSettings = () => {
  const { user } = useAuth();
  const [provisioning, setProvisioning] = useState(false);

  // Auto-provision workspace if none exists
  const { data: workspaceId, isLoading } = useQuery({
    queryKey: ['engage-workspace-provision', user?.id],
    queryFn: async () => {
      setProvisioning(true);
      try {
        const { data, error } = await supabase.rpc('ensure_engage_workspace', {
          p_user_id: user!.id,
        });
        if (error) throw error;
        return data as string;
      } finally {
        setProvisioning(false);
      }
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  if (isLoading || provisioning) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Unable to initialize Engage. Please try again.
      </div>
    );
  }

  // Wrap in WorkspaceProvider so EngageSettings can use useWorkspace()
  return (
    <WorkspaceProvider>
      <EngageSettings />
    </WorkspaceProvider>
  );
};
