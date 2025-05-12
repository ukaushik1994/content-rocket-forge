
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';

export function DraftsHeader() {
  const navigate = useNavigate();
  const { contentItems } = useContent();
  
  // Count drafts and published content
  const draftsCount = contentItems.filter(item => item.status === 'draft').length;
  const publishedCount = contentItems.filter(item => item.status === 'published').length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Manage your content drafts and explore your keyword usage across content
          </p>
        </div>
        <Button onClick={() => navigate('/content-builder')}>
          <Plus className="mr-2 h-4 w-4" /> New Content
        </Button>
      </div>
      
      <div className="flex gap-3 text-sm mt-1">
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{draftsCount}</span> drafts
        </div>
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{publishedCount}</span> published
        </div>
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">{contentItems.filter(item => item.metadata?.mainKeyword).length}</span> with keywords
        </div>
      </div>
    </div>
  );
}
