import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Puzzle, CheckCircle, Repeat, ChevronDown, Search, Target, Users, Network, MessageSquare, Zap, FileTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavItem({ to, icon, label, active }: NavItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={to}
        className={cn(
          "flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors",
          active ? "text-foreground" : "hover:bg-secondary"
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}

export function NavItems() {
  const location = useLocation();

  return <div className="flex items-center space-x-4">
      <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Home" active={location.pathname === '/'} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
            <FileText className="h-4 w-4" />
            <span>Content</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/content-builder" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Content Builder</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/templates" className="flex items-center space-x-2">
              <FileTemplate className="h-4 w-4" />
              <span>Content Templates</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/content-repurposing" className="flex items-center space-x-2">
              <Repeat className="h-4 w-4" />
              <span>Content Repurposing</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/content-analysis" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Content Analysis</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-md transition-colors">
            <Search className="h-4 w-4" />
            <span>SEO Tools</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/seo-tools" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>SEO Optimization</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/serp-analysis" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>SERP Analysis</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/competitor-analysis" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Competitor Analysis</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/link-building" className="flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <span>Link Building</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NavItem to="/solutions" icon={<Puzzle className="h-4 w-4" />} label="Solutions" active={location.pathname === '/solutions'} />
      <NavItem to="/ai-chat" icon={<MessageSquare className="h-4 w-4" />} label="AI Chat" active={location.pathname === '/ai-chat'} />
      <NavItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" active={location.pathname === '/analytics'} />
    </div>;
}
