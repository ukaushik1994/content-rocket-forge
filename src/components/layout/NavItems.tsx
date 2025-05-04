
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Settings,
  BarChart3,
  Puzzle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      active
        ? 'bg-primary text-primary-foreground'
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
    )}
  >
    {icon}
    {label}
  </Link>
);

export default function NavItems() {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-1">
      <NavItem
        to="/"
        icon={<Home className="h-4 w-4" />}
        label="Dashboard"
        active={location.pathname === '/'}
      />
      <NavItem
        to="/content"
        icon={<FileText className="h-4 w-4" />}
        label="Content"
        active={location.pathname === '/content'}
      />
      <NavItem
        to="/content-builder"
        icon={<Puzzle className="h-4 w-4" />}
        label="Builder"
        active={location.pathname === '/content-builder'}
      />
      <NavItem
        to="/content-approval"
        icon={<CheckCircle className="h-4 w-4" />}
        label="Approval"
        active={location.pathname === '/content-approval'}
      />
      <NavItem
        to="/solutions"
        icon={<Puzzle className="h-4 w-4" />}
        label="Solutions"
        active={location.pathname === '/solutions'}
      />
      <NavItem
        to="/analytics"
        icon={<BarChart3 className="h-4 w-4" />}
        label="Analytics"
        active={location.pathname === '/analytics'}
      />
      <NavItem
        to="/settings"
        icon={<Settings className="h-4 w-4" />}
        label="Settings"
        active={location.pathname === '/settings'}
      />
    </div>
  );
}
