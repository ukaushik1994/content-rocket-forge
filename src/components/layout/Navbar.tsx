import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, LogOut, UserCircle, User, Settings, Puzzle, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import NavItems from './NavItems';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ActiveProviderIndicator } from '@/components/ai/ActiveProviderIndicator';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSettings } = useSettings();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  
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
  
  const userFullName = user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` : user?.email || 'User';
  const userEmail = user?.email || '';
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
      <header className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="mr-4 hidden lg:flex">
            <Link to="/ai-chat">
              <CreAiterLogo showText={true} size="md" />
            </Link>
          </div>
          
          <Button variant="outline" size="icon" className="lg:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <nav className="hidden lg:flex items-center space-x-1">
            <NavItems />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Active AI Provider Indicator */}
          <ActiveProviderIndicator />
          
          {/* Notifications bell replaces Feedback icon */}
          <NotificationBell />

          {/* AI Chat icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full overflow-hidden border border-border"
            onClick={() => navigate('/ai-chat')}
            title="AI Chat"
          >
            <Bot className="h-4 w-4" />
          </Button>

          {/* User profile dropdown - keeping as is */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border border-border/20 z-50">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{userFullName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/offerings')}>
                <Puzzle className="mr-2 h-4 w-4" />
                <span>Offerings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSettings()}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
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
              <Link to="/ai-chat" onClick={() => setShowMobileMenu(false)}>
                <CreAiterLogo showText={true} size="md" />
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>

            <nav className="flex flex-col space-y-4">
              <NavItems />
              
              {/* Mobile menu buttons removed */}
              
              <Button variant="ghost" className="flex items-center justify-start gap-3 px-4 py-2 w-full rounded-md hover:bg-accent/50" onClick={handleSignOut}>
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
