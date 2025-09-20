import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  Lightbulb,
  Target,
  Eye,
  Search,
  BarChart3,
  Star,
  X,
  Loader2,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import type { SeoAiResult } from '@/types/seo-ai';
import { useContentAnalysis } from '@/hooks/useContentAnalysis';
import { getScoreTextClass, getScoreBgClass } from '@/lib/score';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItemType | null;
}

export const AIReportModal: React.FC<AIReportModalProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  const [analysisResult, setAnalysisResult] = useState<SeoAiResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const { data, loading, analyzeOnce, reanalyze, refresh } = useContentAnalysis(content?.id);

  useEffect(() => {
    if (isOpen && content) {
      setAnalysisResult(null);
      setIsAnalyzing(true);
      (async () => {
        await refresh();
        if (!data) {
          const res = await analyzeOnce(content);
          if (res?.analysis) {
            setAnalysisResult(res.analysis as SeoAiResult);
          }
        } else if (data?.analysis) {
          setAnalysisResult(data.analysis as SeoAiResult);
        }
        setIsAnalyzing(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, content?.id]);

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

  const sections = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'seo', label: 'SEO Analysis', icon: Search },
    { id: 'issues', label: 'Issues', icon: AlertCircle },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 border-none overflow-hidden">
        <div className="h-full bg-background flex flex-col">
          
          {/* Header */}
          <div className="flex-shrink-0 border-b border-border bg-card/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">AI Report</h2>
                {analysisResult && (
                  <Badge variant="secondary" className={`${getScoreBgClass(analysisResult.overallScore)} ${getScoreTextClass(analysisResult.overallScore)} border-0 text-lg px-3 py-1`}>
                    {analysisResult.overallScore}%
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Last analyzed: {data?.analyzed_at ? new Date(data.analyzed_at).toLocaleString() : '—'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => { 
                    if (content) { 
                      setIsAnalyzing(true); 
                      const res = await reanalyze(content); 
                      if (res?.analysis) setAnalysisResult(res.analysis as SeoAiResult); 
                      setIsAnalyzing(false); 
                    } 
                  }}
                  disabled={loading || !content}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reanalyze
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 line-clamp-2">{content.title}</p>

            {/* Mini Navigation */}
            {analysisResult && (
              <div className="flex gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-2"
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
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
              <div className="p-6 space-y-8">
                
                {/* Overview Section */}
                <section id="section-overview" className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Overview
                  </h3>
                  
                  {/* Overall Score */}
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Target className="h-5 w-5" />
                        Overall Quality Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className={`text-6xl font-bold mb-4 ${getScoreTextClass(analysisResult.overallScore)}`}>
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
                      { label: 'SEO Score', score: analysisResult.scores?.seo || 0, icon: Search },
                      { label: 'Readability', score: analysisResult.scores?.readability || 0, icon: Eye },
                      { label: 'Quality', score: analysisResult.scores?.quality || 0, icon: Star },
                    ].map((item) => (
                      <Card key={item.label}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            <span className={`text-xl font-bold ${getScoreTextClass(item.score)}`}>
                              {item.score}%
                            </span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* SEO Analysis Section */}
                <section id="section-seo" className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SEO Analysis
                  </h3>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Growth Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.opportunities && (
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
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Issues Section */}
                <section id="section-issues" className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Issues
                  </h3>
                  
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
                    {(!analysisResult.issues || analysisResult.issues.length === 0) && (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 bg-green-100 rounded-full">
                              <Star className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <h4 className="font-semibold text-green-600 mb-2">No Issues Found</h4>
                          <p className="text-sm text-muted-foreground">
                            Your content passes all quality checks!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>

                {/* Suggestions Section */}
                <section id="section-suggestions" className="space-y-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Suggestions
                  </h3>
                  
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
                    {(!analysisResult.recommendations || analysisResult.recommendations.length === 0) && (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="flex justify-center mb-4">
                            <div className="p-3 bg-green-100 rounded-full">
                              <Star className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <h4 className="font-semibold text-green-600 mb-2">Content Optimized</h4>
                          <p className="text-sm text-muted-foreground">
                            No immediate improvements needed - your content is well optimized!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </section>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                  <CardContent className="pt-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click "Reanalyze" to generate a fresh AI report for this content.
                    </p>
                    <Button 
                      onClick={async () => {
                        if (content) {
                          setIsAnalyzing(true);
                          const res = await analyzeOnce(content);
                          if (res?.analysis) setAnalysisResult(res.analysis as SeoAiResult);
                          setIsAnalyzing(false);
                        }
                      }}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};