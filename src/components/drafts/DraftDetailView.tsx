
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, FileText, Calendar, Tag } from 'lucide-react';
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
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl border border-white/20 shadow-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{draft.title}</span>
            <Badge variant={draft.status === 'draft' ? 'outline' : 'default'} className={draft.status === 'draft' ? 'border-white/30 bg-white/5' : 'bg-neon-blue'}>
              {draft.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </DialogTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-primary/70" />
              {formatDate(draft.updated_at)}
            </div>
            {draft.keywords && draft.keywords.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-primary/70" />
                {draft.keywords.length} keywords
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Meta information section */}
          {(metaTitle || metaDescription) && (
            <div className="p-4 rounded-xl bg-secondary/15 border border-secondary/30 shadow-inner">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                <span>SEO Meta Information</span>
              </div>
              {metaTitle && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Meta Title:</span>
                  <p className="text-sm mt-1 font-medium">{metaTitle}</p>
                </div>
              )}
              {metaDescription && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Meta Description:</span>
                  <p className="text-sm mt-1">{metaDescription}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Keywords section */}
          {draft.keywords && draft.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">Keywords</h3>
              <div className="flex flex-wrap gap-1.5">
                {draft.keywords.map((keyword: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="bg-secondary/20 text-white border border-secondary/30">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Content section */}
          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Content</h3>
            <div className="p-6 rounded-xl border bg-card/30 prose prose-invert max-w-none overflow-auto shadow-inner">
              <div dangerouslySetInnerHTML={{ __html: draft.content || 'No content available' }} />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="border-white/20 bg-white/5 hover:bg-white/10">
              Close
            </Button>
            <Button onClick={handleEdit} className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
