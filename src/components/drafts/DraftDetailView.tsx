
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { CheckCircle2, Edit2, FileText, Tag, Clock, BarChart2, Link2, Layers, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'repurposed'>('content');
  const navigate = useNavigate();
  const { contentItems } = useContent();
  const [repurposedContent, setRepurposedContent] = useState<any[]>([]);
  
  // Find repurposed content related to this draft
  useEffect(() => {
    if (draft && contentItems.length > 0) {
      const related = contentItems.filter(item => 
        item.metadata?.originalContentId === draft.id || 
        (item.metadata?.repurposedFrom && item.title.includes(draft.title))
      );
      setRepurposedContent(related);
    }
  }, [draft, contentItems]);
  
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
    onClose();
    navigate(`/content-builder`, { state: { contentId: draft.id } });
  };
  
  const handleRepurpose = () => {
    onClose();
    navigate(`/content-repurposing?id=${draft.id}`);
  };

  // Extract metadata values safely
  const metaTitle = draft.metaTitle || draft.metadata?.metaTitle || '';
  const metaDescription = draft.metaDescription || draft.metadata?.metaDescription || '';
  const mainKeyword = draft.metadata?.mainKeyword || '';
  const secondaryKeywords = draft.metadata?.secondaryKeywords || [];
  const serpSelections = draft.metadata?.serpSelections || [];
  const outline = draft.metadata?.outline || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{draft.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={draft.status === 'draft' ? 'outline' : 'default'} className="text-xs">
                {draft.status === 'draft' ? 'Draft' : draft.status === 'published' ? 'Published' : 'Approved'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                SEO: {draft.seo_score || 0}%
              </Badge>
            </div>
          </div>
          <DialogDescription className="flex items-center gap-2 text-sm mt-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Created: {formatDate(draft.created_at)} 
            {draft.created_at !== draft.updated_at && (
              <span className="ml-2">(Updated: {formatDate(draft.updated_at)})</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center gap-2">
              <Tag className="h-4 w-4" /> Metadata
            </TabsTrigger>
            <TabsTrigger value="repurposed" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Repurposed
              {repurposedContent.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {repurposedContent.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto pr-1">
            <TabsContent value="content" className="mt-0 h-full">
              <div className="prose prose-invert max-w-none">
                {draft.content ? (
                  <div dangerouslySetInnerHTML={{ __html: draft.content }} />
                ) : (
                  <p className="text-muted-foreground italic">No content available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="metadata" className="mt-0 space-y-6">
              {/* Keywords & SEO Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Tag className="w-4 h-4 mr-2" /> Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mainKeyword && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Main Keyword</h4>
                        <Badge className="bg-primary/20 text-primary-foreground hover:bg-primary/30 border border-primary/30">
                          {mainKeyword}
                        </Badge>
                      </div>
                    )}
                    
                    {secondaryKeywords && secondaryKeywords.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Secondary Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {secondaryKeywords.map((keyword: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    {draft.keywords && draft.keywords.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Content Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {draft.keywords.map((keyword: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <BarChart2 className="w-4 h-4 mr-2" /> SEO Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">SEO Score</h4>
                        <div className="flex items-center">
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
                      
                      {(metaTitle || metaDescription) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-2">Meta Information</h4>
                            {metaTitle && (
                              <div className="mb-2">
                                <div className="text-xs text-muted-foreground">Meta Title</div>
                                <div className="text-sm font-medium">{metaTitle}</div>
                              </div>
                            )}
                            {metaDescription && (
                              <div>
                                <div className="text-xs text-muted-foreground">Meta Description</div>
                                <div className="text-sm">{metaDescription}</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* SERP Data & Outline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serpSelections && serpSelections.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Link2 className="w-4 h-4 mr-2" /> SERP Selections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-auto">
                      <div className="space-y-3">
                        {serpSelections
                          .filter((item: any) => item.selected)
                          .map((item: any, idx: number) => (
                            <div key={idx} className="border border-border rounded-md p-2 text-sm">
                              <div className="font-medium">{item.type}</div>
                              <div className="text-muted-foreground">{item.content}</div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {outline && outline.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <FileText className="w-4 h-4 mr-2" /> Content Outline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-auto">
                      <ol className="list-decimal pl-5 space-y-1">
                        {outline.map((section: string, idx: number) => (
                          <li key={idx} className="text-sm">{section}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="repurposed" className="mt-0">
              <div className="space-y-4">
                {repurposedContent.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium">Repurposed Content ({repurposedContent.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {repurposedContent.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{item.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {item.metadata?.repurposedType || 'Repurposed'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="line-clamp-3 text-sm opacity-80">
                              {item.content ? (
                                <div dangerouslySetInnerHTML={{ 
                                  __html: item.content?.substring(0, 120) + '...'
                                }} />
                              ) : (
                                <span className="text-muted-foreground italic">No content</span>
                              )}
                            </div>
                          </CardContent>
                          <div className="p-3 border-t flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                onClose();
                                navigate(`/content-builder`, { state: { contentId: item.id } });
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(item.content || '');
                                toast.success('Content copied to clipboard');
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Repurposed Content</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      This content hasn't been repurposed yet. Create different versions like carousels or memes from this content.
                    </p>
                    <Button onClick={handleRepurpose}>
                      <Layers className="h-4 w-4 mr-2" />
                      Repurpose This Content
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleRepurpose}>
            <Layers className="h-4 w-4 mr-2" />
            Repurpose
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
