
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';

export function DraftsHeader() {
  const navigate = useNavigate();
  
  const handleCreateContent = () => {
    navigate('/content-builder');
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
          Content Drafts
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and edit your content drafts and published articles
        </p>
      </div>
      
      <Button 
        onClick={handleCreateContent}
        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all shadow-lg"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Content
      </Button>
    </div>
  );
}
