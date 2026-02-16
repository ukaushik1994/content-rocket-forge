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

  return (
    <div className="w-56 border-r border-white/[0.06] bg-card/30 backdrop-blur-sm flex flex-col relative z-10">
      <nav className="flex-1 p-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent'
              )}
            >
              {/* Active gradient bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary to-primary/60" />
              )}
              <item.icon className={cn('h-4 w-4 transition-all', isActive && 'drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
