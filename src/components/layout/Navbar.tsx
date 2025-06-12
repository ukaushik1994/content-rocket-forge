
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, X, PanelRight, LogOut, UserCircle, User, MessageSquarePlus, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { toast } from 'sonner';
import { navItems } from './NavItems';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  
  const isContentPageActive = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => location.pathname === subItem.href);
    }
    return location.pathname === item.href;
  };
  
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
              <span className="font-bold text-gradient">CRF</span>
            </Link>
          </div>
          
          <Button variant="outline" size="icon" className="lg:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              item.subItems ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent/50",
                        isContentPageActive(item)
                          ? "bg-accent text-accent-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {item.subItems.map((subItem: any) => (
                      <DropdownMenuItem key={subItem.href} asChild>
                        <Link to={subItem.href} className="flex items-center gap-2">
                          <subItem.icon className="h-4 w-4" />
                          {subItem.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent/50",
                      location.pathname === item.href 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              )
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings button as icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full overflow-hidden border border-border"
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Feedback button as icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full overflow-hidden border border-border"
            onClick={() => document.dispatchEvent(new CustomEvent('open-feedback'))}
            title="Feedback"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>

          {/* User profile dropdown - keeping as is */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border border-border">
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
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close Menu</span>
              </Button>
            </div>

            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.subItems ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      {item.subItems.map((subItem: any) => (
                        <Link key={subItem.href} to={subItem.href} onClick={() => setShowMobileMenu(false)}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex items-center justify-start gap-3 px-8 py-2 w-full rounded-md hover:bg-accent/50",
                              location.pathname === subItem.href 
                                ? "bg-accent text-accent-foreground" 
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.title}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link to={item.href} onClick={() => setShowMobileMenu(false)}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center justify-start gap-3 px-4 py-2 w-full rounded-md hover:bg-accent/50",
                          location.pathname === item.href 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile menu buttons - keep text versions for better usability on mobile */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 items-center justify-center gap-2" 
                  onClick={() => {
                    navigate('/settings');
                    setShowMobileMenu(false);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 items-center justify-center gap-2"
                  onClick={() => {
                    document.dispatchEvent(new CustomEvent('open-feedback'));
                    setShowMobileMenu(false);
                  }}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Feedback
                </Button>
              </div>
              
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
