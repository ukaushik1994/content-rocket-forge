import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Workspace {
  id: string;
  name: string;
  role: string;
}

interface WorkspaceContextType {
  currentWorkspaceId: string | null;
  workspaceRole: string | null;
  workspaces: Workspace[];
  loading: boolean;
  switchWorkspace: (id: string) => void;
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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      setLoading(false);
      return;
    }

    const fetchWorkspaces = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('workspace_id, role, team_workspaces(id, name)')
        .eq('user_id', user.id);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const ws = data.map((m: any) => ({
        id: m.workspace_id,
        name: m.team_workspaces?.name || 'Workspace',
        role: m.role || 'viewer',
      }));

      setWorkspaces(ws);
      if (ws.length > 0 && !currentWorkspaceId) {
        const saved = localStorage.getItem('engage_workspace_id');
        const found = ws.find((w: Workspace) => w.id === saved);
        setCurrentWorkspaceId(found ? found.id : ws[0].id);
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = (id: string) => {
    setCurrentWorkspaceId(id);
    localStorage.setItem('engage_workspace_id', id);
  };

  const current = workspaces.find(w => w.id === currentWorkspaceId);
  const role = current?.role || null;
  const canEdit = ['owner', 'admin', 'marketer'].includes(role || '');
  const canManage = ['owner', 'admin'].includes(role || '');

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspaceId,
      workspaceRole: role,
      workspaces,
      loading,
      switchWorkspace,
      canEdit,
      canManage,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
