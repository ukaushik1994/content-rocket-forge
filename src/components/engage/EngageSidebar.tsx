import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Mail, GitBranch, Zap, Share2, Activity, Users, Layers } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const navItems = [
  { path: '/engage/email', label: 'Email', icon: Mail },
  { path: '/engage/contacts', label: 'Contacts', icon: Users },
  { path: '/engage/segments', label: 'Segments', icon: Layers },
  { path: '/engage/journeys', label: 'Journeys', icon: GitBranch },
  { path: '/engage/automations', label: 'Automations', icon: Zap },
  { path: '/engage/social', label: 'Social', icon: Share2 },
  { path: '/engage/activity', label: 'Activity', icon: Activity },
];

export const EngageSidebar = () => {
  const location = useLocation();
  const { workspaces, currentWorkspaceId, switchWorkspace } = useWorkspace();

  return (
    <div className="w-56 border-r border-border bg-card/50 flex flex-col">
      {/* Workspace Switcher */}
      {workspaces.length > 1 && (
        <div className="p-3 border-b border-border">
          <Select value={currentWorkspaceId || ''} onValueChange={switchWorkspace}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Workspace" />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map(ws => (
                <SelectItem key={ws.id} value={ws.id} className="text-xs">
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
