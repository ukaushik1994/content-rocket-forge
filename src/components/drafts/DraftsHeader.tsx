
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { useContent } from '@/contexts/content';
import { RefreshButton } from '@/components/ui/refresh-button';

export function DraftsHeader() {
  const navigate = useNavigate();
  const { contentItems, refreshContent } = useContent();
  
  // Filter drafts from content items
  const drafts = contentItems.filter(item => item.status === 'draft');
  
  const handleCreateNew = () => {
    navigate('/ai-chat');
  };
  
  return (
    <div className="space-y-6 mb-8">
      {/* Title section with gradient */}
      <div className="relative">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 animate-fade-in">
          <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2 rounded-lg shadow-neon">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <span className="text-gradient">Content Drafts</span>
          <Sparkles className="h-5 w-5 text-neon-purple animate-pulse-glow" />
        </h1>
        <p className="text-muted-foreground max-w-2xl animate-fade-in">
          Manage your content drafts and published pieces. Create, edit, and repurpose your content with ease.
        </p>
      </div>
      
      {/* Stats and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-card/60 shadow-sm border border-border/50 rounded-lg px-4 py-2 backdrop-blur-sm animate-fade-in">
            <p className="text-sm font-medium">
              <span className="text-xl font-semibold text-primary">{drafts.length}</span>{' '}
              <span className="text-muted-foreground">draft{drafts.length !== 1 ? 's' : ''} available</span>
            </p>
          </div>
          
          <RefreshButton 
            onClick={() => refreshContent()}
            className="backdrop-blur-sm animate-fade-in"
          />
        </div>
        
        <Button 
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple shadow-lg hover:shadow-neon-purple/20 transition-all duration-300 animate-fade-in"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Content
        </Button>
      </div>
      
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2" />
    </div>
  );
}
