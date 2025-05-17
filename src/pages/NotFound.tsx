
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10 text-center space-y-6 max-w-xl">
        <div className="relative mx-auto">
          <div className="h-24 w-24 rounded-full bg-neon-blue opacity-20 blur-xl absolute inset-0 m-auto"></div>
          <div className="h-20 w-20 rounded-full bg-glass flex items-center justify-center border border-neon-blue relative mx-auto">
            <Search className="h-10 w-10 text-neon-blue opacity-80" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gradient">404 - Page Not Found</h1>
        
        <p className="text-muted-foreground text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button asChild className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/content">
              Go to Content
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
