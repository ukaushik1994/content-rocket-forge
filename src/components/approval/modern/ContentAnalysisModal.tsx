import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Eye,
  FileText,
  Search,
  BarChart3,
  Star,
  X,
  Loader2,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import type { SeoAiResult } from '@/types/seo-ai';
import { analyzeContentItem } from '@/services/seoAiService';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';

interface ContentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItemType | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onRequestChanges?: (id: string, reason: string) => void;
}

export const ContentAnalysisModal: React.FC<ContentAnalysisModalProps> = ({
  isOpen,
  onClose,
  content,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const [analysisResult, setAnalysisResult] = useState<SeoAiResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && content) {
      setAnalysisResult(null);
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, content?.id]);

  const runAnalysis = async () => {
    if (!content) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeContentItem(content);
      setAnalysisResult(result);
    } catch (e) {
      console.error('AI analysis failed', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIssueIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const tabConfig = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'seo', label: 'SEO Analysis', icon: Search },
    { id: 'issues', label: 'Issues', icon: AlertCircle },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
    { id: 'review', label: 'Review & Edit', icon: FileText },
  ];

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 border-none overflow-hidden">
        <div className="h-full bg-background flex">
          
          {/* Left Sidebar */}
          <div className="w-80 border-r border-border bg-card/50 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Content Analysis</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.title}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent p-0 space-y-1">
                  {tabConfig.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="w-full justify-start h-auto p-3 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                    >
                      <tab.icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Action Buttons */}
            {analysisResult && content.approval_status === 'pending_review' && (
              <div className="p-6 border-t border-border space-y-3">
                {onApprove && (
                  <Button
                    onClick={() => onApprove(content.id)}
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
                {onRequestChanges && (
                  <Button
                    variant="outline"
                    onClick={() => onRequestChanges(content.id, 'Improvements needed based on analysis')}
                    className="w-full"
                  >
                    Request Changes
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Bar */}
            <div className="h-16 border-b border-border bg-card/30 flex items-center px-6">
              {analysisResult && (
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Overall Score:</span>
                    <Badge variant="secondary" className={`${getScoreBgColor(analysisResult.overallScore)} ${getScoreColor(analysisResult.overallScore)} border-0`}>
                      {analysisResult.overallScore}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last analyzed: {new Date().toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {isAnalyzing ? (
                <div className="h-full flex items-center justify-center p-6">
                  <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                      <div className="flex justify-center mb-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Analyzing Content
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        AI is evaluating SEO performance, readability, and content quality...
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : analysisResult ? (
                <div className="h-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <div className="h-full overflow-y-auto p-6">
                        
                      {/* Overview Tab */}
                      <TabsContent value="overview" className="mt-0">
                        <div className="space-y-6">
                          {/* Overall Score */}
                          <Card>
                            <CardHeader className="text-center">
                              <CardTitle className="flex items-center justify-center gap-2">
                                <Target className="h-5 w-5" />
                                Overall Quality Score
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                              <div className={`text-6xl font-bold mb-4 ${getScoreColor(analysisResult.overallScore)}`}>
                                {analysisResult.overallScore}%
                              </div>
                              <Progress 
                                value={analysisResult.overallScore} 
                                className="h-3 mb-4"
                              />
                              <p className="text-sm text-muted-foreground">
                                Based on SEO, readability, and content quality metrics
                              </p>
                            </CardContent>
                          </Card>

                          {/* Score Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { label: 'SEO Score', score: analysisResult.scores.seo, icon: Search },
                              { label: 'Readability', score: analysisResult.scores.readability, icon: Eye },
                              { label: 'Quality', score: analysisResult.scores.quality, icon: Star },
                            ].map((item) => (
                              <Card key={item.label}>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <item.icon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">{item.label}</span>
                                    </div>
                                    <span className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                                      {item.score}%
                                    </span>
                                  </div>
                                  <Progress value={item.score} className="h-2" />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* SEO Tab */}
                      <TabsContent value="seo" className="mt-0">
                        <div className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                SEO Analysis
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {analysisResult.opportunities && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold mb-3">Growth Opportunities</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {[
                                        { title: 'Internal Links', items: analysisResult.opportunities.internalLinks || [] },
                                        { title: 'Entities to Add', items: analysisResult.opportunities.entitiesToAdd || [] }
                                      ].map((section) => (
                                        <div key={section.title} className="border rounded-lg p-4">
                                          <h5 className="font-medium mb-2">{section.title}</h5>
                                          <ul className="space-y-1">
                                            {section.items.slice(0, 5).map((item, i) => (
                                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                {item}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Issues Tab */}
                      <TabsContent value="issues" className="mt-0">
                        <div className="space-y-4">
                          {(analysisResult.issues || []).map((issue, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-muted rounded-lg">
                                    {getIssueIcon(issue.severity)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-semibold">{issue.message}</h4>
                                      <Badge 
                                        variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                      >
                                        {issue.severity.toUpperCase()}
                                      </Badge>
                                    </div>
                                    {issue.evidence && (
                                      <p className="text-sm text-muted-foreground">{issue.evidence}</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Suggestions Tab */}
                      <TabsContent value="suggestions" className="mt-0">
                        <div className="space-y-4">
                          {(analysisResult.recommendations || []).map((rec, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <h4 className="font-semibold">
                                        {rec.action.replace(/_/g, ' ')} · 
                                        <span className="text-muted-foreground font-normal"> {rec.target}</span>
                                      </h4>
                                      {rec.estimatedImpact && (
                                        <Badge variant="outline">
                                          <TrendingUp className="h-3 w-3 mr-1" />
                                          {rec.estimatedImpact}
                                        </Badge>
                                      )}
                                    </div>
                                    {rec.rationale && (
                                      <p className="text-sm text-muted-foreground mb-3">{rec.rationale}</p>
                                    )}
                                    {rec.snippet && (
                                      <div className="bg-muted rounded-lg p-3 border">
                                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{rec.snippet}</pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      {/* Review & Edit Tab */}
                      <TabsContent value="review" className="mt-0 h-full">
                        <div className="h-full border rounded-lg overflow-hidden">
                          <ContentApprovalEditor content={content} />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No analysis available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};