
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Puzzle, CheckCircle, Repeat, ChevronDown, Search, Target, Users, Network, MessageSquare, Globe, Book, CalendarDays, GitBranch, FileSearch, MoreHorizontal, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
          layoutId={`nav-highlight-${to}`} // Unique layoutId per item
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
  
  // Content-related routes
  const contentRoutes = [
    '/content-builder',
    '/content-repurposing', 
    '/content-approval',
    '/glossary-builder',
    '/repository',
    '/drafts'
  ];
  
  // Research-related routes
  const researchRoutes = [
    '/research/content-strategy',
    '/research/opportunities',
    '/research/keyword-research',
    '/research/answer-the-people',
    '/research/topic-clusters'
  ];
  
  // More-related routes
  const moreRoutes = [
    '/research/content-gaps',
    '/research/calendar',
    '/research/pipeline',
    '/keywords'
  ];
  
  const isContentActive = contentRoutes.includes(location.pathname);
  const isResearchActive = researchRoutes.includes(location.pathname);
  const isMoreActive = moreRoutes.includes(location.pathname);
  
  return <div className="flex flex-row gap-1">
      <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Dashboard" active={location.pathname === '/'} />
      
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
              to="/content-builder" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/content-builder' && 'bg-accent text-accent-foreground'
              )}
            >
              <Puzzle className="h-4 w-4" />
              Builder
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/content-repurposing" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/content-repurposing' && 'bg-accent text-accent-foreground'
              )}
            >
              <Repeat className="h-4 w-4" />
              Repurpose
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
              to="/glossary-builder" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/glossary-builder' && 'bg-accent text-accent-foreground'
              )}
            >
              <Book className="h-4 w-4" />
              Glossary Builder
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Research Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors h-auto',
              isResearchActive 
                ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md' 
                : 'hover:bg-white/10 text-white/60 hover:text-white'
            )}
          >
            <Search className="h-4 w-4" />
            Research
            <ChevronDown className="h-3 w-3" />
            {isResearchActive && (
              <motion.span 
                layoutId="nav-highlight-research"
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
              to="/research/content-strategy" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/content-strategy' && 'bg-accent text-accent-foreground'
              )}
            >
              <Target className="h-4 w-4" />
              Content Strategy
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/research/keyword-research" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/keyword-research' && 'bg-accent text-accent-foreground'
              )}
            >
              <Search className="h-4 w-4" />
              Keyword Research
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/research/opportunities" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/opportunities' && 'bg-accent text-accent-foreground'
              )}
            >
              <Target className="h-4 w-4" />
              Opportunities
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/research/answer-the-people" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/answer-the-people' && 'bg-accent text-accent-foreground'
              )}
            >
              <Users className="h-4 w-4" />
              Answer the People
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/research/topic-clusters" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/topic-clusters' && 'bg-accent text-accent-foreground'
              )}
            >
              <Network className="h-4 w-4" />
              Topic Clusters
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* More Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors h-auto',
              isMoreActive 
                ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-md' 
                : 'hover:bg-white/10 text-white/60 hover:text-white'
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
            More
            <ChevronDown className="h-3 w-3" />
            {isMoreActive && (
              <motion.span 
                layoutId="nav-highlight-more"
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
        <DropdownMenuContent align="start" className="w-52 bg-card border border-white/10 z-50">
          <DropdownMenuItem asChild>
            <Link 
              to="/research/content-gaps" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/content-gaps' && 'bg-accent text-accent-foreground'
              )}
            >
              <FileSearch className="h-4 w-4" />
              Content Gaps
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/research/calendar" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/calendar' && 'bg-accent text-accent-foreground'
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
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
              <Hash className="h-4 w-4" />
              Keyword Library
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              to="/research/pipeline" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/research/pipeline' && 'bg-accent text-accent-foreground'
              )}
            >
              <GitBranch className="h-4 w-4" />
              Pipeline
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NavItem to="/solutions" icon={<Puzzle className="h-4 w-4" />} label="Solutions" active={location.pathname === '/solutions'} />
      <NavItem to="/ai-chat" icon={<MessageSquare className="h-4 w-4" />} label="AI Chat" active={location.pathname === '/ai-chat'} />
      <NavItem to="/aio-geo" icon={<Globe className="h-4 w-4" />} label="AIO/GEO" active={location.pathname === '/aio-geo'} />
      <NavItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" active={location.pathname === '/analytics'} />
    </div>;
}
