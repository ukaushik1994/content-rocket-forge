import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { CheckCircle2, Edit2, FileText, Tag, Clock, BarChart2, Search, Puzzle, FileCode, ChevronDown, ChevronUp, Plus, Eye, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [expandedSections, setExpandedSections] = useState({
    serp: false,
    solution: false,
    structure: false,
    keywords: false,
    questions: false,
    entities: false,
    gaps: false
  });
  
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

  const renderDetailedSerpAnalysis = () => {
    if (!serpData) {
      return (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">SERP Analysis</h3>
            </div>
            <p className="text-muted-foreground">No SERP data available for analysis</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">SERP Analysis Details</h3>
          </div>
          
          <div className="space-y-4">
            {/* Keywords Section */}
            {serpData.keywords && serpData.keywords.length > 0 && (
              <Collapsible open={expandedSections.keywords} onOpenChange={() => toggleSection('keywords')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">Target Keywords ({serpData.keywords.length})</span>
                  </div>
                  {expandedSections.keywords ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {serpData.keywords.map((keyword, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border">
                        <span className="font-medium text-foreground">{keyword.keyword}</span>
                        <div className="flex gap-2">
                          {keyword.volume && (
                            <Badge variant="secondary" className="text-xs">
                              {keyword.volume} searches
                            </Badge>
                          )}
                          {keyword.difficulty && (
                            <Badge variant="outline" className="text-xs">
                              Difficulty: {keyword.difficulty}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Questions Section */}
            {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
              <Collapsible open={expandedSections.questions} onOpenChange={() => toggleSection('questions')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-foreground">People Also Ask ({serpData.peopleAlsoAsk.length})</span>
                  </div>
                  {expandedSections.questions ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {serpData.peopleAlsoAsk.map((question, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-md border border-border">
                        <p className="font-medium text-foreground mb-2">{question.question}</p>
                        {question.answer && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{question.answer}</p>
                        )}
                        {question.source && (
                          <p className="text-xs text-muted-foreground mt-2">Source: {question.source}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Entities Section */}
            {serpData.entities && serpData.entities.length > 0 && (
              <Collapsible open={expandedSections.entities} onOpenChange={() => toggleSection('entities')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-foreground">Key Entities ({serpData.entities.length})</span>
                  </div>
                  {expandedSections.entities ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {serpData.entities.map((entity, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-md border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{entity.title || entity.name}</span>
                            {entity.type && (
                              <Badge variant="outline" className="text-xs">{entity.type}</Badge>
                            )}
                          </div>
                          {entity.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{entity.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Content Gaps Section */}
            {serpData.contentGaps && serpData.contentGaps.length > 0 && (
              <Collapsible open={expandedSections.gaps} onOpenChange={() => toggleSection('gaps')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-foreground">Content Opportunities ({serpData.contentGaps.length})</span>
                  </div>
                  {expandedSections.gaps ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {serpData.contentGaps.map((gap, idx) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-md border border-border">
                        <h4 className="font-medium text-foreground mb-2">{gap.topic}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                        {gap.recommendation && (
                          <p className="text-xs text-muted-foreground italic">💡 {gap.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailedSolutionIntegration = () => {
    const selectedSolution = draft.metadata?.selectedSolution;
    
    if (!selectedSolution) {
      return (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Puzzle className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Solution Integration</h3>
            </div>
            <p className="text-muted-foreground">No solution selected for this content</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Puzzle className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Solution Integration Analysis</h3>
          </div>
          
          <div className="space-y-6">
            {/* Solution Overview */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-3">{selectedSolution.name}</h4>
              <p className="text-muted-foreground mb-3">{selectedSolution.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedSolution.category}</Badge>
                {selectedSolution.targetAudience && selectedSolution.targetAudience.length > 0 && (
                  <Badge variant="outline">
                    {selectedSolution.targetAudience.slice(0, 2).join(', ')}
                    {selectedSolution.targetAudience.length > 2 && ` +${selectedSolution.targetAudience.length - 2}`}
                  </Badge>
                )}
              </div>
            </div>

            {/* Integration Metrics */}
            {solutionMetrics && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-medium text-foreground mb-4">Integration Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-md border border-border">
                    <div className="text-2xl font-bold text-primary">{solutionMetrics.featureIncorporation}%</div>
                    <div className="text-sm text-muted-foreground">Feature Integration</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md border border-border">
                    <div className="text-2xl font-bold text-primary">{solutionMetrics.positioningScore}%</div>
                    <div className="text-sm text-muted-foreground">Positioning Score</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md border border-border">
                    <div className="text-2xl font-bold text-primary">{solutionMetrics.nameMentions}</div>
                    <div className="text-sm text-muted-foreground">Name Mentions</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md border border-border">
                    <div className="text-2xl font-bold text-primary">{solutionMetrics.audienceAlignment}%</div>
                    <div className="text-sm text-muted-foreground">Audience Alignment</div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Analysis */}
            {selectedSolution.features && selectedSolution.features.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-medium text-foreground mb-4">Features ({selectedSolution.features.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedSolution.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
                      <CheckCircle2 className={`h-4 w-4 ${
                        solutionMetrics?.mentionedFeatures?.includes(feature) 
                          ? 'text-green-500' 
                          : 'text-muted-foreground'
                      }`} />
                      <span className={`text-sm ${
                        solutionMetrics?.mentionedFeatures?.includes(feature) 
                          ? 'text-foreground' 
                          : 'text-muted-foreground'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pain Points Addressed */}
            {selectedSolution.painPoints && selectedSolution.painPoints.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <h4 className="font-medium text-foreground mb-4">Pain Points Addressed</h4>
                <div className="space-y-2">
                  {selectedSolution.painPoints.map((painPoint, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md border border-border">
                      <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{painPoint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailedDocumentStructure = () => {
    if (!documentStructure) {
      return (
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileCode className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Document Structure</h3>
            </div>
            <p className="text-muted-foreground">No structure analysis available</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileCode className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Document Structure Analysis</h3>
          </div>
          
          <div className="space-y-6">
            {/* Structure Validation */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-4">Structure Validation</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex items-center gap-2 p-3 rounded-md border ${
                  documentStructure.hasSingleH1 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                }`}>
                  {documentStructure.hasSingleH1 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    documentStructure.hasSingleH1 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    Single H1 Tag
                  </span>
                </div>
                
                <div className={`flex items-center gap-2 p-3 rounded-md border ${
                  documentStructure.hasLogicalHierarchy ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                }`}>
                  {documentStructure.hasLogicalHierarchy ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    documentStructure.hasLogicalHierarchy ? 'text-green-500' : 'text-red-500'
                  }`}>
                    Logical Hierarchy
                  </span>
                </div>
              </div>
            </div>

            {/* Heading Statistics */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-4">Content Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                  <div className="text-2xl font-bold text-primary">{documentStructure.h1?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H1 Tags</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                  <div className="text-2xl font-bold text-primary">{documentStructure.h2?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H2 Tags</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                  <div className="text-2xl font-bold text-primary">{documentStructure.h3?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">H3 Tags</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                  <div className="text-2xl font-bold text-primary">{documentStructure.metadata?.wordCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Words</div>
                </div>
              </div>
            </div>

            {/* Detailed Headings */}
            <Collapsible open={expandedSections.structure} onOpenChange={() => toggleSection('structure')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">View All Headings</span>
                </div>
                {expandedSections.structure ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-muted/30 rounded-lg p-4 space-y-4 border border-border">
                  {documentStructure.h1?.length > 0 && (
                    <div>
                      <Badge variant="secondary" className="mb-2">H1 Headings</Badge>
                      <div className="space-y-2">
                        {documentStructure.h1.map((heading, idx) => (
                          <div key={idx} className="p-2 bg-muted/50 rounded-md text-foreground font-medium border border-border">
                            {heading}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {documentStructure.h2?.length > 0 && (
                    <div>
                      <Badge variant="secondary" className="mb-2">H2 Headings</Badge>
                      <div className="space-y-2">
                        {documentStructure.h2.map((heading, idx) => (
                          <div key={idx} className="p-2 bg-muted/50 rounded-md text-foreground border border-border">
                            {heading}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {documentStructure.h3?.length > 0 && (
                    <div>
                      <Badge variant="secondary" className="mb-2">H3 Headings</Badge>
                      <div className="space-y-2">
                        {documentStructure.h3.map((heading, idx) => (
                          <div key={idx} className="p-2 bg-muted/50 rounded-md text-foreground border border-border">
                            {heading}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
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
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <span className="ml-4 text-lg text-muted-foreground">Loading detailed analysis...</span>
                </div>
              )}
              
              {!isLoadingAnalysis && (
                <>
                  {/* Detailed Analysis Sections */}
                  <div className="space-y-6">
                    {renderDetailedSerpAnalysis()}
                    {renderDetailedSolutionIntegration()}
                    {renderDetailedDocumentStructure()}
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
                </>
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
