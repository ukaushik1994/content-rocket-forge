
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RocketIcon, Search, BarChart3, Settings, Users, Activity, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const links = [
    { name: 'Dashboard', href: '/', icon: <RocketIcon className="h-4 w-4 mr-2" /> },
    { name: 'Keywords', href: '/keywords', icon: <Search className="h-4 w-4 mr-2" /> },
    { name: 'Content', href: '/content', icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { name: 'Solutions', href: '/solutions', icon: <Users className="h-4 w-4 mr-2" /> },
    { name: 'Analytics', href: '/analytics', icon: <Activity className="h-4 w-4 mr-2" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4 mr-2" /> },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10 bg-background/80">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center animate-pulse-glow">
            <RocketIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">ContentRocketForge</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors flex items-center",
                location.pathname === link.href 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="neon-border gap-1">
            <MessageCircle className="h-4 w-4" />
            Feedback
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple text-white">
            New Project
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
