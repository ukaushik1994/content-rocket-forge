import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  Trash2,
  Edit,
  Crown,
  User,
  Eye,
  Check,
  X,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
  permissions: string[];
}

interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
}

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    email: 'john@company.com',
    name: 'John Smith',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20',
    permissions: ['all']
  },
  {
    id: '2',
    email: 'sarah@company.com',
    name: 'Sarah Johnson',
    role: 'manager',
    status: 'active',
    joinedAt: '2024-01-18',
    lastActive: '2024-01-20',
    permissions: ['content_create', 'content_edit', 'analytics_view']
  },
  {
    id: '3',
    email: 'mike@company.com',
    name: 'Mike Chen',
    role: 'member',
    status: 'active',
    joinedAt: '2024-01-20',
    lastActive: '2024-01-20',
    permissions: ['content_create']
  }
];

const MOCK_WORKSPACE: TeamWorkspace = {
  id: '1',
  name: 'Marketing Team',
  description: 'Content creation and marketing campaigns',
  memberCount: 12,
  createdAt: '2024-01-01',
  settings: {
    allowInvites: true,
    requireApproval: false,
    maxMembers: 25
  }
};

const ROLE_PERMISSIONS = {
  admin: ['all'],
  manager: ['content_create', 'content_edit', 'content_delete', 'analytics_view', 'team_view'],
  member: ['content_create', 'content_edit']
};

export const TeamWorkspaceManager: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [workspace, setWorkspace] = useState<TeamWorkspace>(MOCK_WORKSPACE);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 hover:bg-green-100',
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    };
    return variants[status as keyof typeof variants] || variants.inactive;
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !user) return;

    setIsInviting(true);
    try {
      // Here you would integrate with your backend to send invitations
      const newMember: TeamMember = {
        id: Date.now().toString(),
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        role: inviteRole,
        status: 'pending',
        joinedAt: new Date().toISOString().split('T')[0],
        lastActive: 'Never',
        permissions: ROLE_PERMISSIONS[inviteRole]
      };

      setTeamMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      toast.success('Invitation sent successfully');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
    toast.success('Team member removed');
  };

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    setTeamMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole, permissions: ROLE_PERMISSIONS[newRole] }
        : member
    ));
    toast.success('Role updated successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Workspace Management
          </CardTitle>
          <CardDescription>
            Manage team members, roles, and workspace settings for collaborative AI content creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="workspace">Workspace Settings</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invite New Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={(value: 'manager' | 'member') => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleInviteMember}
                        disabled={!inviteEmail || isInviting}
                        className="w-full sm:w-auto"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isInviting ? 'Sending...' : 'Invite'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Team Members ({teamMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{member.name}</h4>
                              {getRoleIcon(member.role)}
                              <Badge className={getStatusBadge(member.status)}>
                                {member.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {member.joinedAt} • Last active: {member.lastActive}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={member.role} 
                            onValueChange={(value: 'admin' | 'manager' | 'member') => handleRoleChange(member.id, value)}
                            disabled={member.role === 'admin'}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {member.role !== 'admin' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workspace" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Workspace Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workspace-name">Workspace Name</Label>
                      <Input
                        id="workspace-name"
                        value={workspace.name}
                        onChange={(e) => setWorkspace(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-members">Max Members</Label>
                      <Input
                        id="max-members"
                        type="number"
                        value={workspace.settings.maxMembers}
                        onChange={(e) => setWorkspace(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings, maxMembers: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={workspace.description}
                      onChange={(e) => setWorkspace(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">Team Invitation Settings</h4>
                      <p className="text-sm text-muted-foreground">Control how new members can join your workspace</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="allow-invites"
                          checked={workspace.settings.allowInvites}
                          onChange={(e) => setWorkspace(prev => ({ 
                            ...prev, 
                            settings: { ...prev.settings, allowInvites: e.target.checked }
                          }))}
                        />
                        <Label htmlFor="allow-invites">Allow team invitations</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="require-approval"
                          checked={workspace.settings.requireApproval}
                          onChange={(e) => setWorkspace(prev => ({ 
                            ...prev, 
                            settings: { ...prev.settings, requireApproval: e.target.checked }
                          }))}
                        />
                        <Label htmlFor="require-approval">Require admin approval</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role Permissions Matrix</CardTitle>
                  <CardDescription>
                    Configure what each role can access and modify in your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Permission</th>
                          <th className="text-center p-3">Member</th>
                          <th className="text-center p-3">Manager</th>
                          <th className="text-center p-3">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Create Content', key: 'content_create' },
                          { name: 'Edit Content', key: 'content_edit' },
                          { name: 'Delete Content', key: 'content_delete' },
                          { name: 'View Analytics', key: 'analytics_view' },
                          { name: 'Manage Team', key: 'team_manage' },
                          { name: 'Workspace Settings', key: 'workspace_settings' },
                        ].map((permission) => (
                          <tr key={permission.key} className="border-b">
                            <td className="p-3 font-medium">{permission.name}</td>
                            <td className="text-center p-3">
                              {['content_create', 'content_edit'].includes(permission.key) ? 
                                <Check className="h-4 w-4 text-green-500 mx-auto" /> : 
                                <X className="h-4 w-4 text-gray-400 mx-auto" />
                              }
                            </td>
                            <td className="text-center p-3">
                              {!['team_manage', 'workspace_settings'].includes(permission.key) ? 
                                <Check className="h-4 w-4 text-green-500 mx-auto" /> : 
                                <X className="h-4 w-4 text-gray-400 mx-auto" />
                              }
                            </td>
                            <td className="text-center p-3">
                              <Check className="h-4 w-4 text-green-500 mx-auto" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};