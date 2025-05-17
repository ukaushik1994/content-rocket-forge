
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { useContent } from '@/contexts/content';

export function DraftsHeader() {
  const navigate = useNavigate();
  const { contentItems } = useContent();
  
  // Filter drafts from content items
  const drafts = contentItems.filter(item => item.status === 'draft');
  
  const handleCreateNew = () => {
    navigate('/content-builder');
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Content Drafts
        </h1>
        <p className="text-muted-foreground">
          Manage your content drafts and published pieces
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {drafts.length} draft{drafts.length !== 1 ? 's' : ''} available
        </p>
      </div>
      
      <Button 
        onClick={handleCreateNew}
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Content
      </Button>
    </div>
  );
}
