import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Mail, GitBranch, Zap, Share2, Activity, Users, Layers } from 'lucide-react';

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

  const renderNavItem = (item: typeof navItems[0]) => {
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
  };

  return (
    <div className="w-56 border-r border-border bg-card/50 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(renderNavItem)}
      </nav>

    </div>
  );
};
