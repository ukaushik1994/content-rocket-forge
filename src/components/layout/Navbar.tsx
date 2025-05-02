
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings,
  LogOut,
  User,
  FileText,
  Search,
  Layout,
  BarChart3,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className="w-full border-b border-white/10 backdrop-blur-lg bg-background/70 sticky top-0 z-40">
      <div className="container flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-gradient">ContentRocketForge</Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/content" className="px-3 py-2 text-sm rounded-md hover:bg-white/5 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </Link>
          <Link to="/settings" className="px-3 py-2 text-sm rounded-md hover:bg-white/5 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="rounded-full w-8 h-8 p-0 bg-neon-purple/20" 
                onClick={() => navigate('/settings')}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button 
              className="bg-gradient-to-r from-neon-purple to-neon-blue" 
              size="sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-3 border-t border-white/5 bg-background">
          <div className="container space-y-1">
            <Link 
              to="/content" 
              className="block px-3 py-2 rounded-md hover:bg-white/5 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              Content
            </Link>
            
            <Link 
              to="/settings" 
              className="block px-3 py-2 rounded-md hover:bg-white/5 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            
            {user ? (
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                className="w-full justify-start px-3 py-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue w-full mt-2" 
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
