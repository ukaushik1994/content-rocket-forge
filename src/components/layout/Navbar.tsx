import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { X, LogOut, UserCircle, Settings, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ActiveProviderIndicator } from '@/components/ai/ActiveProviderIndicator';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSettings } = useSettings();
  const {
    user,
    signOut
  } = useAuth();
  
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
        {/* Left: Logo only */}
        <div className="flex items-center gap-2">
          <Link to="/ai-chat">
            <CreAiterLogo showText={true} size="md" />
          </Link>
        </div>

        {/* Right: Calendar, Provider, Notifications, User */}
        <div className="flex items-center gap-1.5">
          <ActiveProviderIndicator />

          {/* Calendar shortcut */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full border border-border/10 hover:border-border/30 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/research/calendar')}
            title="Content Calendar"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
          
          

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border/10 hover:border-border/30">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border border-border/20 z-50">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-medium">{userFullName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
    </div>
  );
};

export default Navbar;
