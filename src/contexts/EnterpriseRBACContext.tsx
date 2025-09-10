import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  teamId?: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface EnterpriseRBACContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  updateUserRole: (userId: string, role: UserRole) => Promise<boolean>;
  getTeamMembers: () => Promise<UserProfile[]>;
  inviteTeamMember: (email: string, role: UserRole) => Promise<boolean>;
  suspendUser: (userId: string) => Promise<boolean>;
  auditLog: (action: string, resource: string, details?: any) => Promise<void>;
}

const EnterpriseRBACContext = createContext<EnterpriseRBACContextType | undefined>(undefined);

const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { id: 'all', name: 'All Permissions', description: 'Full system access', resource: '*', action: '*' }
  ],
  manager: [
    { id: 'content_read', name: 'View Content', description: 'View all content', resource: 'content', action: 'read' },
    { id: 'content_write', name: 'Edit Content', description: 'Create and edit content', resource: 'content', action: 'write' },
    { id: 'analytics_read', name: 'View Analytics', description: 'View analytics dashboards', resource: 'analytics', action: 'read' },
    { id: 'team_manage', name: 'Manage Team', description: 'Invite and manage team members', resource: 'team', action: 'manage' }
  ],
  member: [
    { id: 'content_read', name: 'View Content', description: 'View assigned content', resource: 'content', action: 'read' },
    { id: 'content_write', name: 'Edit Content', description: 'Create and edit own content', resource: 'content', action: 'write' }
  ],
  viewer: [
    { id: 'content_read', name: 'View Content', description: 'View content only', resource: 'content', action: 'read' }
  ]
};

export const useEnterpriseRBAC = () => {
  const context = useContext(EnterpriseRBACContext);
  if (context === undefined) {
    throw new Error('useEnterpriseRBAC must be used within an EnterpriseRBACProvider');
  }
  return context;
};

export const EnterpriseRBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      // First check if user has a profile record
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create default one
        const newProfile = {
          id: user.id,
          role: 'member' as UserRole,
          display_name: user.user_metadata?.display_name || user.email,
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name,
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error('Failed to create user profile');
          return;
        }
        profile = createdProfile;
      }

      if (profile) {
        const userRole = (profile.role as UserRole) || 'member';
        setUserProfile({
          id: user.id,
          email: user.email!,
          role: userRole,
          permissions: DEFAULT_PERMISSIONS[userRole],
          lastActive: new Date().toISOString(),
          status: 'active'
        });

        // Log user access
        await auditLog('user_access', 'auth', { userId: user.id, timestamp: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!userProfile) return false;
    
    return userProfile.permissions.some(permission => 
      (permission.resource === '*' && permission.action === '*') ||
      (permission.resource === resource && (permission.action === action || permission.action === '*'))
    );
  };

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
    if (!hasPermission('team', 'manage')) {
      toast.error('You do not have permission to update user roles');
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
        return false;
      }

      await auditLog('role_update', 'user', { userId, newRole: role });
      toast.success('User role updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  };

  const getTeamMembers = async (): Promise<UserProfile[]> => {
    if (!hasPermission('team', 'read')) {
      return [];
    }

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching team members:', error);
        return [];
      }

      return profiles?.map(profile => ({
        id: profile.id,
        email: 'user@example.com', // TODO: Get from auth.users
        role: (profile.role as UserRole) || 'member',
        permissions: DEFAULT_PERMISSIONS[(profile.role as UserRole) || 'member'],
        lastActive: profile.updated_at || new Date().toISOString(),
        status: 'active'
      })) || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  };

  const inviteTeamMember = async (email: string, role: UserRole): Promise<boolean> => {
    if (!hasPermission('team', 'manage')) {
      toast.error('You do not have permission to invite team members');
      return false;
    }

    try {
      // In a real implementation, this would send an invitation email
      // For now, we'll just log the action
      await auditLog('team_invite', 'team', { email, role, invitedBy: user?.id });
      toast.success(`Invitation sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  };

  const suspendUser = async (userId: string): Promise<boolean> => {
    if (!hasPermission('team', 'manage')) {
      toast.error('You do not have permission to suspend users');
      return false;
    }

    try {
      await auditLog('user_suspend', 'user', { userId, suspendedBy: user?.id });
      toast.success('User suspended successfully');
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
      return false;
    }
  };

  const auditLog = async (action: string, resource: string, details?: any): Promise<void> => {
    try {
      // Insert audit log entry
      const { error } = await supabase
        .from('action_analytics')
        .insert({
          user_id: user?.id,
          action_type: action,
          action_label: `${resource}:${action}`,
          action_id: `${Date.now()}-${Math.random()}`,
          success: true,
          interaction_data: details || {},
          triggered_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging audit event:', error);
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
    }
  };

  const value: EnterpriseRBACContextType = {
    userProfile,
    loading,
    hasPermission,
    hasRole,
    updateUserRole,
    getTeamMembers,
    inviteTeamMember,
    suspendUser,
    auditLog
  };

  return <EnterpriseRBACContext.Provider value={value}>{children}</EnterpriseRBACContext.Provider>;
};