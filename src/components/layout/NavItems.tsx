import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Puzzle, CheckCircle, Repeat, ChevronDown, Search, Target, MessageSquare, Globe, Book, Sparkles } from 'lucide-react';
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
  to,
  icon,
  label,
  active
}) => {
  return (
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
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0.2
          }} 
          className="absolute inset-0 rounded-lg border-2 border-gradient-to-r from-neon-purple to-neon-blue" 
        />
      )}
    </Link>
  );
});

export default function NavItems() {
  const location = useLocation();
  const { user } = useAuth();
  
  const contentRoutes = [
    '/content-builder',
    '/content-approval',
    '/glossary-builder',
    '/repository',
    '/drafts',
    '/content-type-selection',
    '/keywords'
  ];
  
  const isContentActive = contentRoutes.includes(location.pathname);
  
  const homeRoute = user ? '/dashboard' : '/';
  const isHomeActive = user ? location.pathname === '/dashboard' : location.pathname === '/';
  
  return (
    <div className="flex flex-row gap-1">
      <NavItem to={homeRoute} icon={<Home className="h-4 w-4" />} label="Home" active={isHomeActive} />
      
      {/* Content Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors h-auto',
              isContentActive 
                ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md' 
                : 'hover:bg-white/10 text-white/60 hover:text-white'
            )}
          >
            <Puzzle className="h-4 w-4" />
            Content
            <ChevronDown className="h-3 w-3" />
            {isContentActive && (
              <motion.span 
                layoutId="nav-highlight-content"
                transition={{
                  type: "spring",
                  duration: 0.3,
                  bounce: 0.2
                }} 
                className="absolute inset-0 rounded-lg border-2 border-gradient-to-r from-neon-purple to-neon-blue" 
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-card border border-white/10">
          <DropdownMenuItem asChild>
            <Link 
              to="/content-type-selection" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/content-type-selection' && 'bg-accent text-accent-foreground'
              )}
            >
              <Puzzle className="h-4 w-4" />
              Builder
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/content-approval" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/content-approval' && 'bg-accent text-accent-foreground'
              )}
            >
              <CheckCircle className="h-4 w-4" />
              Approval
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/repository" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                (location.pathname === '/repository' || location.pathname === '/drafts') && 'bg-accent text-accent-foreground'
              )}
            >
              <FileText className="h-4 w-4" />
              Repository
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/keywords" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/keywords' && 'bg-accent text-accent-foreground'
              )}
            >
              <Search className="h-4 w-4" />
              Keywords
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Research Hub - Direct Navigation */}
      <NavItem 
        to="/research/research-hub" 
        icon={<Search className="h-4 w-4" />} 
        label="Research" 
        active={location.pathname === '/research/research-hub'} 
      />
      
      {/* Content Strategy - Direct Navigation */}
      <NavItem 
        to="/research/content-strategy" 
        icon={<Target className="h-4 w-4" />} 
        label="Strategy" 
        active={location.pathname === '/research/content-strategy'} 
      />
      
      {/* Personalization */}
      <NavItem 
        to="/personalization" 
        icon={<Sparkles className="h-4 w-4" />} 
        label="AI Personalization" 
        active={location.pathname === '/personalization'} 
      />
      
      <NavItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" active={location.pathname === '/analytics'} />
    </div>
  );
}