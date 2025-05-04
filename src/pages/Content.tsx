
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ContentRepository } from '@/components/content/ContentRepository';
import { useContent } from '@/contexts/content';
import { PlusCircle, Loader2, Inbox } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Content = () => {
  const { contentItems, loading } = useContent();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateContent = () => {
    setIsCreating(true);
    // Navigate to the content builder
    navigate('/content-builder');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background bg-slate-950">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Content Library</h1>
            <p className="text-muted-foreground">
              {loading 
                ? 'Loading your content library...' 
                : `You have ${contentItems.length} content ${contentItems.length === 1 ? 'item' : 'items'}`}
            </p>
          </div>
          
          <Button 
            onClick={handleCreateContent}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Content
              </>
            )}
          </Button>
        </div>
        
        {!loading && contentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg border-muted">
            <div className="bg-muted/20 p-4 rounded-full mb-4">
              <Inbox className="h-12 w-12 text-muted-foreground/70" />
            </div>
            <h2 className="text-xl font-medium mb-2">No content items yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md text-center">
              Create your first content piece to start building your content library.
            </p>
            <Button 
              onClick={handleCreateContent}
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Content
            </Button>
          </div>
        ) : (
          <ContentRepository />
        )}
      </main>
    </div>
  );
};

export default Content;
