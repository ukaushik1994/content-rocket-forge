
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Search,
  Target,
  PenTool,
  CheckCircle,
  Archive,
  Globe,
  Layers,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NavItems = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isContentActive = () => {
    return location.pathname.startsWith('/content');
  };

  const isSerpActive = () => {
    return location.pathname.startsWith('/serp');
  };

  const contentRoutes = [
    { path: '/content/approval', label: 'Approval Queue', icon: CheckCircle },
    { path: '/content/drafts', label: 'Drafts', icon: FileText },
    { path: '/content/published', label: 'Published', icon: Globe },
    { path: '/content/topic-clusters', label: 'Topic Clusters', icon: Layers },
    { path: '/content/seo-optimization', label: 'SEO Optimization', icon: Zap }
  ];

  const serpRoutes = [
    { path: '/serp/data', label: 'SERP Data', icon: Search },
    { path: '/serp/analysis', label: 'SERP Analysis', icon: Target }
  ];

  return (
    <nav className="space-y-2">
      {/* Dashboard */}
      <Link
        to="/"
        className={cn(
          "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive('/') 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <BarChart3 className="h-5 w-5" />
        <span>Dashboard</span>
      </Link>

      {/* Content Builder */}
      <Link
        to="/content-builder"
        className={cn(
          "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive('/content-builder') 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <PenTool className="h-5 w-5" />
        <span>Content Builder</span>
      </Link>

      {/* Content Section */}
      <div>
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Content
        </div>
        <div className="space-y-1">
          {contentRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ml-2",
                  isActive(route.path) 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{route.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SERP Section */}
      <div>
        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          SERP
        </div>
        <div className="space-y-1">
          {serpRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ml-2",
                  isActive(route.path) 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{route.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Analytics */}
      <Link
        to="/analytics"
        className={cn(
          "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive('/analytics') 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        <BarChart3 className="h-5 w-5" />
        <span>Analytics</span>
      </Link>
    </nav>
  );
};

export default NavItems;
