
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { CheckCircle2, Edit2, FileText, Tag, Clock, BarChart2 } from 'lucide-react';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');
  
  if (!draft) return null;

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{draft.title}</DialogTitle>
            <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
              {draft.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </div>
          <DialogDescription>
            Created: {formatDate(draft.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'content' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('content')}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Content
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'metadata' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('metadata')}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Metadata
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'content' && (
            <div className="prose prose-invert max-w-none">
              {draft.content ? (
                <div dangerouslySetInnerHTML={{ __html: draft.content }} />
              ) : (
                <p className="text-muted-foreground italic">No content available</p>
              )}
            </div>
          )}
          
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center">
                    <Tag className="w-4 h-4 mr-2" /> 
                    Keywords
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draft.keywords && draft.keywords.length > 0 ? draft.keywords.map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    )) : (
                      <span className="text-sm text-muted-foreground">No keywords</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2" /> 
                    SEO Score
                  </h3>
                  <div className="mt-2">
                    <div className="flex items-center mt-1">
                      <div className="bg-muted w-full h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            draft.seo_score >= 80 ? 'bg-green-500' : 
                            draft.seo_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${draft.seo_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium text-sm">{draft.seo_score || 0}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> 
                    Timestamps
                  </h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{formatDate(draft.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{formatDate(draft.updated_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> 
                    Status
                  </h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content Type:</span>
                      <span>{draft.contentType || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
                        {draft.status === 'draft' ? 'Draft' : 'Published'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {draft.metaTitle || draft.metaDescription ? (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Meta Information</h3>
                  {draft.metaTitle && (
                    <div className="mb-2">
                      <div className="text-xs text-muted-foreground">Meta Title</div>
                      <div className="text-sm">{draft.metaTitle}</div>
                    </div>
                  )}
                  {draft.metaDescription && (
                    <div>
                      <div className="text-xs text-muted-foreground">Meta Description</div>
                      <div className="text-sm">{draft.metaDescription}</div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
