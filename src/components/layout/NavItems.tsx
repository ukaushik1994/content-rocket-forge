
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Puzzle, CheckCircle, Repeat, ChevronDown, Search, Target, Users, Network, MessageSquare, Globe } from 'lucide-react';
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
    }} className="absolute inset-0 rounded-lg border-2 border-gradient-to-r from-neon-purple to-neon-blue" />}
    </Link>;
};

export default function NavItems() {
  const location = useLocation();
  
  // Content-related routes
  const contentRoutes = [
    '/content-builder',
    '/content-repurposing', 
    '/content-approval',
    '/drafts'
  ];
  
  // Research-related routes
  const researchRoutes = [
    '/research/content-strategy',
    '/research/keyword-research',
    '/research/answer-the-people',
    '/research/topic-clusters'
  ];
  
  const isContentActive = contentRoutes.includes(location.pathname);
  const isResearchActive = researchRoutes.includes(location.pathname);
  
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
                layoutId="nav-highlight" 
                transition={{
                  type: "spring",
                  duration: 0.6
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
              to="/drafts" 
              className={cn(
                'flex items-center gap-2 w-full cursor-pointer',
                location.pathname === '/drafts' && 'bg-accent text-accent-foreground'
              )}
            >
              <FileText className="h-4 w-4" />
              Drafts
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
                layoutId="nav-highlight" 
                transition={{
                  type: "spring",
                  duration: 0.6
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
      
      <NavItem to="/solutions" icon={<Puzzle className="h-4 w-4" />} label="Solutions" active={location.pathname === '/solutions'} />
      <NavItem to="/ai-chat" icon={<MessageSquare className="h-4 w-4" />} label="AI Chat" active={location.pathname === '/ai-chat'} />
      <NavItem to="/aio-geo" icon={<Globe className="h-4 w-4" />} label="AIO/GEO" active={location.pathname === '/aio-geo'} />
      <NavItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" active={location.pathname === '/analytics'} />
    </div>;
}
