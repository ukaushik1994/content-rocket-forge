import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Puzzle, CheckCircle, ChevronDown, Search, Target, Megaphone, Mail, Users, Layers, GitBranch, Zap, Share2, Activity, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      active ? 'bg-muted/30 text-foreground' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'
    )}
  >
    {icon}
    {label}
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
            ? 'bg-muted/30 text-foreground'
            : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'
        )}
      >
        {icon}
        {label}
        <ChevronDown className="h-3 w-3" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-48 bg-card border border-border/20 z-50">
      {items.map((item) => (
        <DropdownMenuItem key={item.path} asChild>
          <Link
            to={item.path}
            className={cn(
              'flex items-center gap-2 w-full cursor-pointer',
              pathname.startsWith(item.path) && 'bg-muted/30 text-foreground'
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


interface MobileNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const MobileNavItem: React.FC<MobileNavItemProps> = React.memo(( {
  to, icon, label, onClick, active
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
      active ? 'bg-muted/30 text-foreground' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'
    )}
  >
    {icon}
    {label}
  </Link>
));

interface MobileNavDropdownProps {
  icon: React.ReactNode;
  label: string;
  items: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  pathname: string;
  onClick?: () => void;
}

const MobileNavDropdown: React.FC<MobileNavDropdownProps> = ({ icon, label, items, pathname, onClick }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          'flex items-center justify-between w-full gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors h-auto',
          isOpen ? 'bg-muted/30 text-foreground' : 'hover:bg-muted/20 text-muted-foreground hover:text-foreground'
        )}
        onClick={() => {
          toggleOpen();
          onClick?.();
        }}
      >
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>
      {isOpen && (
        <div className="flex flex-col pl-4">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClick}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.path) && 'bg-muted/30 text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

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
