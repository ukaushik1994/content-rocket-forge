
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  X,
  PanelRight,
  LogOut,
  UserCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { toast } from 'sonner';
import { navItems, NavItem } from './NavItems';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, signOut } = useAuth();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const userFullName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'User';

  const userEmail = user?.email || '';

  return (
    <div className="relative z-10 bg-background/80 backdrop-blur-md">
      <header className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="mr-4 hidden lg:flex">
            <Link to="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-neon-blue opacity-40 blur-md absolute"></div>
                <div className="h-7 w-7 rounded-full bg-glass flex items-center justify-center border border-neon-blue relative">
                  <PanelRight className="h-3.5 w-3.5 text-neon-blue" />
                </div>
              </div>
              <span className="font-bold text-gradient">ContentRocketForge</span>
            </Link>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-1 px-3",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <FeedbackButton className="hidden md:flex" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full overflow-hidden border border-border"
              >
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{userFullName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-y-0 left-0 z-50 w-3/4 bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-neon-blue opacity-40 blur-md absolute"></div>
                  <div className="h-7 w-7 rounded-full bg-glass flex items-center justify-center border border-neon-blue relative">
                    <PanelRight className="h-3.5 w-3.5 text-neon-blue" />
                  </div>
                </div>
                <span className="font-bold text-gradient">ContentRocketForge</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>

            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)} 
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-md",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-2">
                <FeedbackButton className="w-full justify-center" />
              </div>
              
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-3 px-4 py-2 w-full rounded-md hover:bg-accent/50" 
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
