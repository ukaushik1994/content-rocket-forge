import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  Eye,
  FileText,
  Brain,
  Search,
  BarChart3,
  TrendingUp,
  Zap,
  Users,
  Clock,
  Star,
  Settings,
  X,
  ArrowRight,
  Loader2,
  Shield,
  Rocket
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import type { SeoAiResult } from '@/types/seo-ai';
import { analyzeContentItem } from '@/services/seoAiService';
import { ContentApprovalEditor } from '@/components/approval/ContentApprovalEditor';
import { GlassCard } from '@/components/ui/GlassCard';

interface ContentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItemType | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onRequestChanges?: (id: string, reason: string) => void;
}

// Floating particle component for background animation
const FloatingParticle: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="absolute w-1 h-1 bg-primary/40 rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    animate={{
      y: [0, -200, 0],
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
    }}
    transition={{
      duration: 6 + Math.random() * 8,
      repeat: Infinity,
      delay: index * 0.5,
      ease: "easeInOut"
    }}
  />
);

// Animated gradient orb component
const GradientOrb: React.FC<{ className: string; delay?: number }> = ({ className, delay = 0 }) => (
  <motion.div 
    className={`absolute rounded-full blur-3xl ${className}`}
    animate={{ 
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.5, 0.2],
      x: [0, 50, 0],
      y: [0, -30, 0]
    }}
    transition={{ 
      duration: 12, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
  />
);

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
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 via-green-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 via-yellow-500 to-orange-500';
    return 'from-red-500 via-orange-500 to-pink-500';
  };

  const getIssueIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
      case 'low':
        return <Lightbulb className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const tabConfig = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'seo', label: 'SEO Intelligence', icon: Search },
    { id: 'issues', label: 'Issues', icon: AlertCircle },
    { id: 'suggestions', label: 'Recommendations', icon: Lightbulb },
    { id: 'review', label: 'Review & Edit', icon: FileText },
  ];

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 border-none bg-transparent overflow-hidden">
        {/* Full-screen dark background with animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-background to-slate-900 overflow-hidden">
          
          {/* Animated Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient Orbs */}
            <GradientOrb 
              className="top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-blue-500/20" 
              delay={0}
            />
            <GradientOrb 
              className="bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15" 
              delay={4}
            />
            <GradientOrb 
              className="top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10" 
              delay={8}
            />
            
            {/* Floating Particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <FloatingParticle key={i} index={i} />
            ))}
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          </div>

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-8 right-8 z-50 p-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:bg-background/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="h-5 w-5" />
          </motion.button>

          {/* Main Content */}
          <div className="relative z-10 h-full flex flex-col">
            
            {/* Hero Header */}
            <motion.div 
              className="relative px-12 pt-16 pb-8 text-center"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Status Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Content Intelligence</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </motion.div>

              {/* Main Title */}
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Content Analysis
              </motion.h1>
              
              <motion.p 
                className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {content.title}
              </motion.p>

              {/* Metrics Pills */}
              {analysisResult && (
                <motion.div 
                  className="flex justify-center gap-4 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {[
                    { label: 'Overall Score', value: `${analysisResult.overallScore}%`, icon: Target, color: getScoreColor(analysisResult.overallScore) },
                    { label: 'SEO', value: `${analysisResult.scores.seo}%`, icon: Search, color: getScoreColor(analysisResult.scores.seo) },
                    { label: 'Readability', value: `${analysisResult.scores.readability}%`, icon: Eye, color: getScoreColor(analysisResult.scores.readability) },
                    { label: 'Quality', value: `${analysisResult.scores.quality}%`, icon: Star, color: getScoreColor(analysisResult.scores.quality) }
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      className="flex items-center gap-2 px-4 py-2 bg-background/40 backdrop-blur-xl rounded-full border border-border/30"
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <metric.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className={`text-sm font-bold ${metric.color}`}>{metric.value}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 px-12 pb-12 overflow-hidden">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    className="h-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <GlassCard className="p-16 text-center max-w-2xl">
                      <motion.div
                        className="relative mb-8"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
                        <div className="relative p-8 bg-background/60 rounded-full">
                          <Sparkles className="h-16 w-16 text-primary" />
                        </div>
                      </motion.div>

                      <h3 className="text-3xl font-bold mb-4 text-gradient">
                        Analyzing Content Intelligence
                      </h3>
                      <p className="text-lg text-muted-foreground mb-8">
                        AI is evaluating SEO performance, readability metrics, and content optimization opportunities...
                      </p>
                      
                      {/* Progress dots */}
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2, 3, 4].map((i) => (
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
                      </div>
                    </GlassCard>
                  </motion.div>
                ) : analysisResult ? (
                  <motion.div
                    key="results"
                    className="h-full"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                      {/* Modern Tab Navigation */}
                      <motion.div 
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-background/40 backdrop-blur-xl border border-border/30 p-2">
                          {tabConfig.map((tab, index) => (
                            <TabsTrigger
                              key={tab.id}
                              value={tab.id}
                              className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium rounded-xl transition-all hover:bg-background/60 data-[state=active]:bg-background/80 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:scale-105"
                            >
                              <tab.icon className="h-4 w-4" />
                              {tab.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </motion.div>

                      {/* Tab Content */}
                      <div className="flex-1 overflow-hidden">
                        
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="h-full overflow-y-auto custom-scrollbar">
                          <div className="space-y-8">
                            {/* Overall Score Hero */}
                            <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <GlassCard className="p-8 text-center">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                  <Target className="h-6 w-6 text-primary" />
                                  <h3 className="text-2xl font-bold">Overall Quality Score</h3>
                                </div>
                                
                                <motion.div
                                  className={`text-8xl font-bold mb-6 ${getScoreColor(analysisResult.overallScore)}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                                >
                                  {analysisResult.overallScore}%
                                </motion.div>
                                
                                <div className="relative w-full h-4 bg-background/40 rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(analysisResult.overallScore)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${analysisResult.overallScore}%` }}
                                    transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                              </GlassCard>
                            </motion.div>

                            {/* Score Breakdown Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[
                                { label: 'SEO Optimization', score: analysisResult.scores.seo, icon: Search, description: 'Search engine visibility and ranking potential' },
                                { label: 'Readability Score', score: analysisResult.scores.readability, icon: Eye, description: 'Content clarity and user engagement' },
                                { label: 'Content Quality', score: analysisResult.scores.quality, icon: FileText, description: 'Overall content value and depth' },
                              ].map((item, index) => (
                                <motion.div
                                  key={item.label}
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 + (0.1 * index) }}
                                >
                                  <GlassCard className="p-6 h-full hover:scale-105 transition-transform">
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="p-2 bg-primary/20 rounded-lg">
                                        <item.icon className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold">{item.label}</h4>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right mb-3">
                                      <span className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                                        {item.score}%
                                      </span>
                                    </div>
                                    
                                    <div className="relative h-2 bg-background/40 rounded-full overflow-hidden">
                                      <motion.div
                                        className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(item.score)}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ duration: 1.5, delay: 0.8 + (0.2 * index) }}
                                      />
                                    </div>
                                  </GlassCard>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </TabsContent>

                        {/* SEO Tab */}
                        <TabsContent value="seo" className="h-full overflow-y-auto custom-scrollbar">
                          <div className="space-y-8">
                            <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <GlassCard className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                  <BarChart3 className="h-6 w-6 text-primary" />
                                  <h3 className="text-2xl font-bold">SEO Intelligence & Opportunities</h3>
                                </div>
                                
                                {analysisResult.opportunities && (
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-lg font-semibold mb-4 text-emerald-400">🚀 Growth Opportunities</h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                          { title: 'Internal Links', items: analysisResult.opportunities.internalLinks || [], icon: ArrowRight },
                                          { title: 'Entities to Add', items: analysisResult.opportunities.entitiesToAdd || [], icon: Users },
                                          { title: 'Questions to Answer', items: analysisResult.opportunities.questionsToAnswer || [], icon: Lightbulb }
                                        ].map((section) => (
                                          <div key={section.title} className="bg-background/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                              <section.icon className="h-4 w-4 text-primary" />
                                              <h5 className="font-medium">{section.title}</h5>
                                            </div>
                                            <ul className="space-y-2">
                                              {section.items.map((item, i) => (
                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
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

                                {analysisResult.risks && (
                                  <div className="mt-8">
                                    <h4 className="text-lg font-semibold mb-4 text-amber-400">⚠️ Risk Assessment</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(analysisResult.risks).map(([key, value]) => (
                                        <div key={key} className="bg-background/20 rounded-xl p-4">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium capitalize">{key}</span>
                                            <span className={`font-bold ${getScoreColor((value as number) || 0)}`}>
                                              {(value as number) || 0}%
                                            </span>
                                          </div>
                                          <div className="relative h-2 bg-background/40 rounded-full overflow-hidden">
                                            <motion.div
                                              className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient((value as number) || 0)}`}
                                              initial={{ width: 0 }}
                                              animate={{ width: `${(value as number) || 0}%` }}
                                              transition={{ duration: 1, delay: 0.3 }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </GlassCard>
                            </motion.div>
                          </div>
                        </TabsContent>

                        {/* Issues Tab */}
                        <TabsContent value="issues" className="h-full overflow-y-auto custom-scrollbar">
                          <div className="space-y-4">
                            {(analysisResult.issues || []).map((issue, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <GlassCard className="p-6 hover:scale-[1.02] transition-transform">
                                  <div className="flex items-start gap-4">
                                    <div className="p-2 bg-background/40 rounded-lg">
                                      {getIssueIcon(issue.severity)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-lg">{issue.message}</h4>
                                        <Badge 
                                          variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}
                                          className="font-bold"
                                        >
                                          {issue.severity.toUpperCase()}
                                        </Badge>
                                      </div>
                                      {issue.evidence && (
                                        <p className="text-muted-foreground">{issue.evidence}</p>
                                      )}
                                    </div>
                                  </div>
                                </GlassCard>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>

                        {/* Suggestions Tab */}
                        <TabsContent value="suggestions" className="h-full overflow-y-auto custom-scrollbar">
                          <div className="space-y-4">
                            {(analysisResult.recommendations || []).map((rec, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <GlassCard className="p-6 hover:scale-[1.02] transition-transform">
                                  <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/20 rounded-lg">
                                      <Lightbulb className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <h4 className="font-semibold text-lg">
                                          {rec.action.replace(/_/g, ' ')} · 
                                          <span className="text-muted-foreground font-normal"> {rec.target}</span>
                                        </h4>
                                        {rec.estimatedImpact && (
                                          <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            {rec.estimatedImpact}
                                          </Badge>
                                        )}
                                      </div>
                                      {rec.rationale && (
                                        <p className="text-muted-foreground mb-3">{rec.rationale}</p>
                                      )}
                                      {rec.snippet && (
                                        <div className="bg-background/40 rounded-lg p-4 border border-border/30">
                                          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{rec.snippet}</pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </GlassCard>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>

                        {/* Review & Edit Tab - Enhanced */}
                        <TabsContent value="review" className="h-full">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                          >
                            <GlassCard className="h-full p-0 overflow-hidden">
                              <ContentApprovalEditor content={content} />
                            </GlassCard>
                          </motion.div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            {analysisResult && activeTab !== 'review' && (
              <motion.div
                className="px-12 pb-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-medium">Analysis Complete</span>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-400/30">
                        Ready for Review
                      </Badge>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="bg-background/60 border-border/50 hover:bg-background/80"
                      >
                        Close Analysis
                      </Button>

                      {content.approval_status === 'pending_review' && (
                        <>
                          {onRequestChanges && (
                            <Button
                              variant="outline"
                              onClick={() => onRequestChanges(content.id, 'AI analysis suggests improvements needed')}
                              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-amber-500/5"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Request Changes
                            </Button>
                          )}

                          {onApprove && (
                            <Button
                              onClick={() => onApprove(content.id)}
                              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold"
                            >
                              <Rocket className="h-4 w-4 mr-2" />
                              Approve & Publish
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};