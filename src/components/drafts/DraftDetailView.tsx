
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { 
  CheckCircle2, Edit2, FileText, Tag, Clock, BarChart2, 
  Globe, Search, FileQuestion, Code, FileCode, Pencil,
  Undo, ExternalLink, Link2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'repurposed'>('content');
  const navigate = useNavigate();
  
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

  const handleEdit = () => {
    navigate(`/content-builder`, { state: { contentId: draft.id } });
    onClose();
  };

  const handleCreateRepurposed = () => {
    navigate(`/content-repurposing?id=${draft.id}`);
    onClose();
  };

  // Check if SERP selections exist in the metadata
  const hasSerpSelections = draft.metadata?.serpSelections && 
    Array.isArray(draft.metadata.serpSelections) && 
    draft.metadata.serpSelections.length > 0;

  // Get count of selected SERP items
  const selectedSerpCount = hasSerpSelections 
    ? draft.metadata.serpSelections.filter((item: SerpSelection) => item.selected).length 
    : 0;

  // Check if draft has any repurposed content (based on metadata or related items)
  const hasRepurposedContent = draft.metadata?.repurposed || 
    (draft.related_content && draft.related_content.length > 0);

  // Get repurposed content items if available
  const repurposedItems = draft.related_content || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{draft.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>Created: {formatDate(draft.created_at)}</span>
                {draft.contentType && (
                  <Badge variant="secondary" className="ml-2">
                    {draft.contentType}
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
              {draft.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </div>
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
            Metadata {hasSerpSelections && <span className="ml-1 text-xs">({selectedSerpCount})</span>}
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'repurposed' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('repurposed')}
          >
            <Undo className="w-4 h-4 inline mr-2" />
            Repurposed {repurposedItems.length > 0 && <span className="ml-1 text-xs">({repurposedItems.length})</span>}
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
              {/* Meta Information Card */}
              {(draft.metaTitle || draft.metaDescription) && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center mb-3">
                    <Globe className="w-4 h-4 mr-2" /> 
                    Meta Information
                  </h3>
                  {draft.metaTitle && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground">Meta Title</div>
                      <div className="text-sm font-medium mt-1 p-2 bg-muted/40 rounded">{draft.metaTitle}</div>
                    </div>
                  )}
                  {draft.metaDescription && (
                    <div>
                      <div className="text-xs text-muted-foreground">Meta Description</div>
                      <div className="text-sm mt-1 p-2 bg-muted/40 rounded">{draft.metaDescription}</div>
                    </div>
                  )}
                </div>
              )}

              {/* SERP Selections */}
              {hasSerpSelections && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center mb-3">
                    <Search className="w-4 h-4 mr-2" /> 
                    SERP Selections ({selectedSerpCount})
                  </h3>
                  <div className="space-y-3">
                    {draft.metadata.serpSelections
                      .filter((item: SerpSelection) => item.selected)
                      .map((item: SerpSelection, idx: number) => (
                        <div key={idx} className="border border-border/50 rounded-md p-3 bg-muted/30">
                          <div className="flex items-center gap-2 mb-2">
                            {item.type === 'question' && <FileQuestion className="w-4 h-4 text-blue-400" />}
                            {item.type === 'snippet' && <Code className="w-4 h-4 text-green-400" />}
                            {item.type === 'entity' && <FileCode className="w-4 h-4 text-amber-400" />}
                            {item.type === 'heading' && <Pencil className="w-4 h-4 text-purple-400" />}
                            <span className="text-xs font-medium capitalize">{item.type}</span>
                            {item.source && (
                              <span className="text-xs text-muted-foreground ml-auto">{item.source}</span>
                            )}
                          </div>
                          <p className="text-sm">{item.content}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

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

              {/* Outline if available */}
              {draft.metadata?.outline && draft.metadata.outline.length > 0 && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2" /> 
                    Content Outline
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {draft.metadata.outline.map((section: string, idx: number) => (
                      <li key={idx} className="text-sm">{section}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Repurposed Content Tab */}
          {activeTab === 'repurposed' && (
            <div className="space-y-4">
              {repurposedItems.length > 0 ? (
                <div className="space-y-4">
                  {repurposedItems.map((item: any, idx: number) => (
                    <div key={idx} className="bg-card p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-base">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.contentType || 'Repurposed content'} • {formatDate(item.created_at)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigate(`/content-builder`, { state: { contentId: item.id } });
                          onClose();
                        }}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                      {item.content && (
                        <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          <div dangerouslySetInnerHTML={{ __html: item.content.substring(0, 150) + '...' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Undo className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No repurposed content yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Repurpose this content into different formats to reach wider audiences
                  </p>
                  <Button onClick={handleCreateRepurposed}>
                    <Undo className="h-4 w-4 mr-2" />
                    Repurpose this content
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
