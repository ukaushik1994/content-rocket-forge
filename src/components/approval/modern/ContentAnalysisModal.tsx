import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  Target,
  Eye,
  FileText,
  Zap,
  Brain,
  Search,
  BarChart3
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import type { SeoAiResult } from '@/types/seo-ai';
import { analyzeContentItem } from '@/services/seoAiService';

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
  onRequestChanges
}) => {
  const [analysisResult, setAnalysisResult] = useState<SeoAiResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && content && !analysisResult) {
      runAnalysis();
    }
  }, [isOpen, content]);

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
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-orange-600';
  };

  const getIssueIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'low': return <Lightbulb className="h-4 w-4 text-blue-400" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Brain className="h-6 w-6 text-primary" />
            AI Content Analysis: {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isAnalyzing ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-96 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
                <div className="relative p-6 bg-background/80 rounded-full">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
              </motion.div>
              
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold">Analyzing Content Quality</h3>
                <p className="text-muted-foreground">AI is evaluating SEO, readability, and content optimization...</p>
              </div>
              
              <motion.div 
                className="flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          ) : analysisResult ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>

              <div className="h-[500px] overflow-y-auto">
                <TabsContent value="overview" className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Overall Quality Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-4">
                        <motion.div
                          className={`text-6xl font-bold ${getScoreColor(analysisResult.overallScore)}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          {analysisResult.overallScore}%
                        </motion.div>
                        <div className="w-full bg-background/40 rounded-full h-3">
                          <motion.div
                            className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(analysisResult.overallScore)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${analysisResult.overallScore}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'SEO', score: analysisResult.scores.seo, icon: Search },
                      { label: 'Readability', score: analysisResult.scores.readability, icon: Eye },
                      { label: 'Content Quality', score: analysisResult.scores.quality, icon: FileText }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 * index }}
                      >
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <span className={`font-bold ${getScoreColor(item.score)}`}>
                                {item.score}%
                              </span>
                            </div>
                            <Progress value={item.score} className="h-2" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        SEO Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(analysisResult.seoInsights).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={getScoreColor(value)}>{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  {analysisResult.issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            {getIssueIcon(issue.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{issue.title}</h4>
                                <Badge variant={issue.impact === 'high' ? 'destructive' : issue.impact === 'medium' ? 'default' : 'secondary'}>
                                  {issue.impact} impact
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-4 w-4 text-yellow-400 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{suggestion.title}</h4>
                                <Badge variant={suggestion.priority === 'high' ? 'default' : 'secondary'}>
                                  {suggestion.priority} priority
                                </Badge>
                                <Badge variant="outline" className="text-green-400 border-green-400/30">
                                  {suggestion.estimatedImpact}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </div>

        {/* Action Buttons */}
        {analysisResult && (
          <motion.div 
            className="flex gap-3 pt-4 border-t border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            
            {content.approval_status === 'pending_review' && (
              <>
                {onRequestChanges && (
                  <Button
                    variant="outline"
                    onClick={() => onRequestChanges(content.id, 'AI analysis suggests improvements needed')}
                    className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    Request Changes
                  </Button>
                )}
                
                {onApprove && (
                  <Button
                    onClick={() => onApprove(content.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve & Publish
                  </Button>
                )}
              </>
            )}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};