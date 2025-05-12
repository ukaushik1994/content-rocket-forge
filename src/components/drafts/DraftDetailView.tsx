
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { CheckCircle2, Edit2, FileText, Tag, Clock, Heading, FileSearch, Box, Layers, Target, PencilRuler } from 'lucide-react';

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

  // Extract headings from metadata or directly from content
  const getHeadings = () => {
    // First check if headings are stored in metadata
    if (draft.metadata?.headings) {
      return draft.metadata.headings;
    }
    
    // Otherwise extract from content
    if (!draft.content) return { h1: [], h2: [] };
    
    const h1Regex = /^# (.+)$/gm;
    const h2Regex = /^## (.+)$/gm;
    
    const h1 = [...(draft.content.match(h1Regex) || [])].map(match => match.replace(/^# /, ''));
    const h2 = [...(draft.content.match(h2Regex) || [])].map(match => match.replace(/^## /, ''));
    
    return { h1, h2 };
  };

  const headings = getHeadings();

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
                    <Heading className="w-4 h-4 mr-2" /> 
                    Document Headings
                  </h3>
                  <div className="mt-2 space-y-3">
                    {headings.h1.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">H1 Headings</h4>
                        <ul className="space-y-1">
                          {headings.h1.map((heading, index) => (
                            <li key={`h1-${index}`} className="text-sm">{heading}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {headings.h2.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">H2 Headings</h4>
                        <ul className="space-y-1">
                          {headings.h2.map((heading, index) => (
                            <li key={`h2-${index}`} className="text-sm">{heading}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {headings.h1.length === 0 && headings.h2.length === 0 && (
                      <p className="text-sm text-muted-foreground">No headings found in content</p>
                    )}
                  </div>
                </div>
                
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
                
                {/* Content Type Information */}
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center">
                    <PencilRuler className="w-4 h-4 mr-2" /> 
                    Content Format
                  </h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Content Type:</span>
                      <Badge variant="outline">{draft.metadata?.contentType || 'Not specified'}</Badge>
                    </div>
                    {draft.metadata?.contentFormat && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Format:</span>
                        <Badge variant="outline">{draft.metadata.contentFormat}</Badge>
                      </div>
                    )}
                    {draft.metadata?.contentIntent && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Intent:</span>
                        <Badge variant="outline">{draft.metadata.contentIntent}</Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Solution Information */}
                {draft.metadata?.solutionInfo && (
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="font-medium flex items-center">
                      <Box className="w-4 h-4 mr-2" /> 
                      Solution Information
                    </h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Solution:</span>
                        <span>{draft.metadata.solutionInfo.name}</span>
                      </div>
                      {draft.metadata.solutionInfo.category && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span>{draft.metadata.solutionInfo.category}</span>
                        </div>
                      )}
                      {draft.metadata.solutionMetrics && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <h4 className="text-xs font-medium mb-1">Integration Metrics</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {draft.metadata.solutionMetrics.overallScore && (
                              <div className="flex justify-between col-span-2">
                                <span className="text-muted-foreground">Overall Score:</span>
                                <Badge variant={draft.metadata.solutionMetrics.overallScore > 70 ? "default" : "outline"}>
                                  {draft.metadata.solutionMetrics.overallScore}%
                                </Badge>
                              </div>
                            )}
                            {draft.metadata.solutionMetrics.nameMentions !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Name Mentions:</span>
                                <span>{draft.metadata.solutionMetrics.nameMentions}</span>
                              </div>
                            )}
                            {draft.metadata.solutionMetrics.featureIncorporation !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Feature Coverage:</span>
                                <span>{draft.metadata.solutionMetrics.featureIncorporation}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
                        {draft.status === 'draft' ? 'Draft' : 'Published'}
                      </Badge>
                    </div>
                    {draft.seo_score !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SEO Score:</span>
                        <Badge variant={draft.seo_score > 80 ? "secondary" : "outline"}>
                          {draft.seo_score}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Meta Information Section */}
              {(draft.metadata?.metaTitle || draft.metadata?.metaDescription) && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">Meta Information</h3>
                  {draft.metadata?.metaTitle && (
                    <div className="mb-2">
                      <div className="text-xs text-muted-foreground">Meta Title</div>
                      <div className="text-sm">{draft.metadata.metaTitle}</div>
                    </div>
                  )}
                  {draft.metadata?.metaDescription && (
                    <div>
                      <div className="text-xs text-muted-foreground">Meta Description</div>
                      <div className="text-sm">{draft.metadata.metaDescription}</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Outline Section */}
              {draft.metadata?.outline && draft.metadata.outline.length > 0 && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center mb-2">
                    <Layers className="h-4 w-4 mr-2" />
                    Content Outline
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {draft.metadata.outline.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm">{item}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* SERP Items Section */}
              {draft.metadata?.serpSelections && draft.metadata.serpSelections.length > 0 && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center mb-2">
                    <FileSearch className="h-4 w-4 mr-2" />
                    SERP Items Used
                  </h3>
                  <div className="space-y-2">
                    {draft.metadata.serpSelections
                      .filter((item: any) => item.selected)
                      .map((item: any, index: number) => (
                      <div key={index} className="border-t border-border pt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type || 'Item'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.source || 'Unknown source'}
                          </span>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{item.content}</p>
                      </div>
                    ))}
                    {!draft.metadata.serpSelections.some((item: any) => item.selected) && (
                      <p className="text-sm text-muted-foreground">No SERP items were selected</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional Instructions Section */}
              {draft.metadata?.additionalInstructions && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="font-medium flex items-center mb-2">
                    <Target className="h-4 w-4 mr-2" />
                    Additional Instructions
                  </h3>
                  <p className="text-sm whitespace-pre-wrap">{draft.metadata.additionalInstructions}</p>
                </div>
              )}
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
