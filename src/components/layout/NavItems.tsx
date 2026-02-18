import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Puzzle, CheckCircle, ChevronDown, Search, Target, Megaphone, Mail, Users, Layers, GitBranch, Zap, Share2, Activity, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = React.memo(({
  to, icon, label, active
}) => (
  <Link 
    to={to} 
    className={cn(
      'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      active ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md' : 'hover:bg-white/10 text-white/60 hover:text-white'
    )}
  >
    {icon}
    {label}
    {active && (
      <motion.span 
        layoutId={`nav-highlight-${to}`}
        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }} 
        className="absolute inset-0 rounded-lg border-2 border-gradient-to-r from-neon-purple to-neon-blue" 
      />
    )}
  </Link>
));

interface NavDropdownProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  items: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
}

const NavDropdown: React.FC<NavDropdownProps> = ({ icon, label, active, items, pathname }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors h-auto',
          active
            ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md'
            : 'hover:bg-white/10 text-white/60 hover:text-white'
        )}
      >
        {icon}
        {label}
        <ChevronDown className="h-3 w-3" />
        {active && (
          <motion.span 
            layoutId={`nav-highlight-${label}`}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }} 
            className="absolute inset-0 rounded-lg border-2 border-gradient-to-r from-neon-purple to-neon-blue" 
          />
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-48 bg-card border border-white/10 z-50">
      {items.map((item) => (
        <DropdownMenuItem key={item.path} asChild>
          <Link
            to={item.path}
            className={cn(
              'flex items-center gap-2 w-full cursor-pointer',
              pathname.startsWith(item.path) && 'bg-accent text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

const contentRoutes = [
  '/content-builder', '/content-approval', '/glossary-builder',
  '/repository', '/drafts', '/content-type-selection', '/keywords',
  '/research/content-strategy'
];

const contentItems = [
  { path: '/content-type-selection', label: 'Builder', icon: Puzzle },
  { path: '/content-approval', label: 'Approval', icon: CheckCircle },
  { path: '/repository', label: 'Repository', icon: FileText },
  { path: '/keywords', label: 'Keywords', icon: Search },
  { path: '/research/content-strategy', label: 'Strategy', icon: Target },
];

const marketingRoutes = [
  '/campaigns', '/engage/email', '/engage/social',
  '/engage/automations', '/engage/journeys'
];

const marketingItems = [
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/engage/email', label: 'Email', icon: Mail },
  { path: '/engage/social', label: 'Social', icon: Share2 },
  { path: '/engage/automations', label: 'Automations', icon: Zap },
  { path: '/engage/journeys', label: 'Journeys', icon: GitBranch },
];

const audienceRoutes = ['/engage/contacts', '/engage/segments', '/engage/activity'];

const audienceItems = [
  { path: '/engage/contacts', label: 'Contacts', icon: Users },
  { path: '/engage/segments', label: 'Segments', icon: Layers },
  { path: '/engage/activity', label: 'Activity', icon: Activity },
];

export default function NavItems() {
  const location = useLocation();
  const { user } = useAuth();
  const { pathname } = location;

  const homeRoute = user ? '/dashboard' : '/';
  const isHomeActive = user ? pathname === '/dashboard' : pathname === '/';
  const isContentActive = contentRoutes.includes(pathname);
  const isMarketingActive = marketingRoutes.some(r => pathname.startsWith(r));
  const isAudienceActive = audienceRoutes.some(r => pathname.startsWith(r));

  return (
    <div className="flex flex-row gap-1">
      <NavItem to={homeRoute} icon={<Home className="h-4 w-4" />} label="Home" active={isHomeActive} />
      <NavDropdown icon={<Puzzle className="h-4 w-4" />} label="Content" active={isContentActive} items={contentItems} pathname={pathname} />
      <NavDropdown icon={<Send className="h-4 w-4" />} label="Marketing" active={isMarketingActive} items={marketingItems} pathname={pathname} />
      <NavDropdown icon={<Users className="h-4 w-4" />} label="Audience" active={isAudienceActive} items={audienceItems} pathname={pathname} />
      <NavItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" active={pathname === '/analytics'} />
    </div>
  );
}
