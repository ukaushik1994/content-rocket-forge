
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { CheckCircle2, Edit2, FileText, Tag, Clock, BarChart2, Search, Puzzle, FileCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');
  const [serpData, setSerpData] = useState(null);
  const [documentStructure, setDocumentStructure] = useState(null);
  const [solutionMetrics, setSolutionMetrics] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  // Load analysis data when metadata tab is selected
  useEffect(() => {
    if (activeTab === 'metadata' && draft && draft.content) {
      loadAnalysisData();
    }
  }, [activeTab, draft]);

  const loadAnalysisData = async () => {
    if (!draft || !draft.content) return;
    
    setIsLoadingAnalysis(true);
    
    try {
      // Extract document structure
      const structure = extractDocumentStructure(draft.content);
      setDocumentStructure(structure);
      
      // Analyze SERP data if keywords available
      if (draft.keywords && draft.keywords.length > 0) {
        const mainKeyword = draft.keywords[0];
        const serpAnalysis = await analyzeKeywordSerp(mainKeyword);
        setSerpData(serpAnalysis);
      }
      
      // Analyze solution integration if solution data is available
      if (draft.metadata?.selectedSolution) {
        const solutionAnalysis = analyzeSolutionIntegration(draft.content, draft.metadata.selectedSolution);
        setSolutionMetrics(solutionAnalysis);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };
  
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

  const renderSerpAnalysis = () => {
    if (!serpData) {
      return (
        <Card className="bg-card/50 border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium">SERP Analysis</h3>
            </div>
            <p className="text-xs text-muted-foreground">No SERP data available</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/50 border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium">SERP Analysis</h3>
          </div>
          
          <div className="space-y-3">
            {serpData.keywords && serpData.keywords.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Keywords ({serpData.keywords.length})</p>
                <div className="flex flex-wrap gap-1">
                  {serpData.keywords.slice(0, 5).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword.keyword}
                    </Badge>
                  ))}
                  {serpData.keywords.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{serpData.keywords.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Questions Covered ({serpData.peopleAlsoAsk.length})</p>
                <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                  {serpData.peopleAlsoAsk.slice(0, 3).map((question, idx) => (
                    <div key={idx} className="truncate">{question.question}</div>
                  ))}
                </div>
              </div>
            )}
            
            {serpData.entities && serpData.entities.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Entities ({serpData.entities.length})</p>
                <div className="flex flex-wrap gap-1">
                  {serpData.entities.slice(0, 4).map((entity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {entity.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDocumentStructure = () => {
    if (!documentStructure) {
      return (
        <Card className="bg-card/50 border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-medium">Document Structure</h3>
            </div>
            <p className="text-xs text-muted-foreground">No structure analysis available</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/50 border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileCode className="h-4 w-4 text-green-400" />
            <h3 className="text-sm font-medium">Document Structure</h3>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">H1 Tags:</span>
                <span className={documentStructure.h1?.length === 1 ? 'text-green-500' : 'text-amber-500'}>
                  {documentStructure.h1?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H2 Tags:</span>
                <span>{documentStructure.h2?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">H3 Tags:</span>
                <span>{documentStructure.h3?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Word Count:</span>
                <span>{documentStructure.metadata?.wordCount || 0}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${documentStructure.hasSingleH1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Single H1 Tag</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${documentStructure.hasLogicalHierarchy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Logical Hierarchy</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSolutionIntegration = () => {
    const selectedSolution = draft.metadata?.selectedSolution;
    
    if (!selectedSolution) {
      return (
        <Card className="bg-card/50 border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Puzzle className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-medium">Solution Integration</h3>
            </div>
            <p className="text-xs text-muted-foreground">No solution selected</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/50 border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Puzzle className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium">Solution Integration</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium">{selectedSolution.name}</p>
              <p className="text-xs text-muted-foreground">{selectedSolution.category}</p>
            </div>
            
            {solutionMetrics && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Feature Integration:</span>
                  <span className={solutionMetrics.featureIncorporation >= 50 ? 'text-green-500' : 'text-amber-500'}>
                    {solutionMetrics.featureIncorporation}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Positioning Score:</span>
                  <span className={solutionMetrics.positioningScore >= 50 ? 'text-green-500' : 'text-amber-500'}>
                    {solutionMetrics.positioningScore}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Name Mentions:</span>
                  <span>{solutionMetrics.nameMentions}</span>
                </div>
              </div>
            )}
            
            {selectedSolution.features && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Key Features</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSolution.features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {selectedSolution.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedSolution.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
              {isLoadingAnalysis && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  <span className="ml-3 text-sm text-muted-foreground">Loading analysis...</span>
                </div>
              )}
              
              {/* SERP Analysis, Solution Integration, and Document Structure */}
              <div className="grid grid-cols-1 gap-4">
                {renderSerpAnalysis()}
                {renderSolutionIntegration()}
                {renderDocumentStructure()}
              </div>
              
              {/* Original metadata information */}
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
