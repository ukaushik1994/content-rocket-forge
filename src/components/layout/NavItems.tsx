import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, BarChart3, Puzzle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}
const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  active
}) => {
  return <Link to={to} className={cn('relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors', active ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md' : 'hover:bg-white/10 text-white/60 hover:text-white')}>
      {icon}
      {label}
      {active && <motion.span layoutId="nav-highlight" transition={{
      type: "spring",
      duration: 0.6
    }} className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue opacity-10 font-normal text-inherit" />}
    </Link>;
};
export default function NavItems() {
  const location = useLocation();
  return <div className="flex flex-row gap-1">
      <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Dashboard" active={location.pathname === '/'} />
      <NavItem to="/content" icon={<FileText className="h-4 w-4" />} label="Content" active={location.pathname === '/content'} />
      <NavItem to="/content-builder" icon={<Puzzle className="h-4 w-4" />} label="Builder" active={location.pathname === '/content-builder'} />
      <NavItem to="/content-approval" icon={<CheckCircle className="h-4 w-4" />} label="Approval" active={location.pathname === '/content-approval'} />
      <NavItem to="/solutions" icon={<Puzzle className="h-4 w-4" />} label="Solutions" active={location.pathname === '/solutions'} />
      <NavItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" active={location.pathname === '/analytics'} />
      <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={location.pathname === '/settings'} />
    </div>;
}