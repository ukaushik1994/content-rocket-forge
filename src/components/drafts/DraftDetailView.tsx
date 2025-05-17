
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DraftDetailView({ draft, open, onClose }: { 
  draft: any | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  
  if (!draft) return null;
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get metadata from draft
  const getMetadata = () => {
    if (!draft.metadata) return { metaTitle: null, metaDescription: null };
    
    try {
      // Handle both string and object metadata formats
      const metadata = typeof draft.metadata === 'string' ? JSON.parse(draft.metadata) : draft.metadata;
      
      return {
        metaTitle: metadata.metaTitle || null,
        metaDescription: metadata.metaDescription || null
      };
    } catch (error) {
      console.error("Failed to parse metadata:", error);
      return { metaTitle: null, metaDescription: null };
    }
  };
  
  const { metaTitle, metaDescription } = getMetadata();
  
  const handleEdit = () => {
    navigate(`/content-builder`, { state: { contentId: draft.id } });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl">{draft.title}</span>
            <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
              {draft.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Last updated: {formatDate(draft.updated_at)}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Meta information section */}
          {(metaTitle || metaDescription) && (
            <div className="p-3 rounded-md bg-secondary/10 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                <span>SEO Meta Information</span>
              </div>
              {metaTitle && (
                <div className="mb-2">
                  <span className="text-xs font-medium">Meta Title:</span>
                  <p className="text-sm mt-1">{metaTitle}</p>
                </div>
              )}
              {metaDescription && (
                <div>
                  <span className="text-xs font-medium">Meta Description:</span>
                  <p className="text-sm mt-1">{metaDescription}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Keywords section */}
          {draft.keywords && draft.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-1">
                {draft.keywords.map((keyword: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Content section */}
          <div>
            <h3 className="text-sm font-medium mb-2">Content</h3>
            <div className="p-4 rounded-md border bg-card/30 prose prose-invert max-w-none overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: draft.content || 'No content available' }} />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
