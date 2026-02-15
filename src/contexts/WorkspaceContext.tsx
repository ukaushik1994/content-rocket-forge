import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WorkspaceContextType {
  currentWorkspaceId: string | null;
  loading: boolean;
  canEdit: boolean;
  canManage: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCurrentWorkspaceId(null);
      setLoading(false);
      return;
    }

    const fetchWorkspace = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (!error && data?.workspace_id) {
        setCurrentWorkspaceId(data.workspace_id);
        setLoading(false);
        return;
      }

      // Auto-provision if no workspace exists
      const { data: wsId, error: rpcError } = await supabase.rpc('ensure_engage_workspace', {
        p_user_id: user.id,
      });

      if (!rpcError && wsId) {
        setCurrentWorkspaceId(wsId);
      }
      setLoading(false);
    };

    fetchWorkspace();
  }, [user]);

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspaceId,
      loading,
      canEdit: true,
      canManage: true,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
