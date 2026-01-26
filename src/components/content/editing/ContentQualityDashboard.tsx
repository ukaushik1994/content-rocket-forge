import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Layers, 
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  analyzeContentQuality, 
  ContentQualityMetrics,
  QualityRecommendation 
} from '@/services/contentQualityService';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentQualityDashboardProps {
  content: string;
  title: string;
  onAutoFix?: (recommendation: QualityRecommendation) => void;
  className?: string;
}

const metricConfig = [
  { key: 'readabilityScore', label: 'Readability', icon: BookOpen, color: 'text-blue-500' },
  { key: 'engagementScore', label: 'Engagement', icon: TrendingUp, color: 'text-emerald-500' },
  { key: 'seoScore', label: 'SEO', icon: Target, color: 'text-amber-500' },
  { key: 'structureScore', label: 'Structure', icon: Layers, color: 'text-purple-500' },
  { key: 'brandVoiceScore', label: 'Brand Voice', icon: MessageSquare, color: 'text-pink-500' },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-emerald-400';
  if (score >= 60) return 'from-amber-500 to-amber-400';
  return 'from-red-500 to-red-400';
};

export const ContentQualityDashboard: React.FC<ContentQualityDashboardProps> = ({
  content,
  title,
  onAutoFix,
  className
}) => {
  const [metrics, setMetrics] = useState<ContentQualityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fixingIds, setFixingIds] = useState<Set<string>>(new Set());

  const runAnalysis = useCallback(async () => {
    if (!content || content.length < 100) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeContentQuality(
        content,
        title,
        'Professional',
        'Competent'
      );
      if (result) {
        setMetrics(result);
      }
    } catch (error) {
      console.error('[ContentQualityDashboard] Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, title]);

  const handleAutoFix = async (rec: QualityRecommendation) => {
    if (!rec.autoFixable || fixingIds.has(rec.id)) return;
    
    setFixingIds(prev => new Set(prev).add(rec.id));
    try {
      await onAutoFix?.(rec);
    } finally {
      setFixingIds(prev => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      });
    }
  };

  const criticalCount = metrics?.recommendations.filter(r => r.type === 'critical').length || 0;
  const majorCount = metrics?.recommendations.filter(r => r.type === 'major').length || 0;
  const autoFixableCount = metrics?.recommendations.filter(r => r.autoFixable).length || 0;

  return (
    <Card className={cn("border-border/50 bg-card/80 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Content Quality</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={runAnalysis}
          disabled={isAnalyzing || content.length < 100}
          className="h-7 text-xs"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* No analysis yet */}
        {!metrics && !isAnalyzing && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Click Analyze to check content quality</p>
          </div>
        )}

        {/* Overall Score */}
        <AnimatePresence>
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Big Score Circle */}
              <div className="flex items-center gap-4">
                <div className={cn(
                  "relative w-16 h-16 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  getScoreGradient(metrics.overallScore)
                )}>
                  <div className="absolute inset-1 rounded-full bg-card flex items-center justify-center">
                    <span className={cn("text-xl font-bold", getScoreColor(metrics.overallScore))}>
                      {metrics.overallScore}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Overall Score</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.overallScore >= 80 ? 'Excellent quality' :
                     metrics.overallScore >= 60 ? 'Good, needs improvements' :
                     'Needs significant work'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Individual Metrics */}
              <div className="space-y-3">
                {metricConfig.map(({ key, label, icon: Icon, color }) => {
                  const score = metrics[key as keyof ContentQualityMetrics] as number;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn("h-3.5 w-3.5", color)} />
                          <span>{label}</span>
                        </div>
                        <span className={getScoreColor(score)}>{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  );
                })}
              </div>

              {/* Recommendations Summary */}
              {metrics.recommendations.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommendations</span>
                      <div className="flex items-center gap-1.5">
                        {criticalCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">
                            {criticalCount} critical
                          </Badge>
                        )}
                        {majorCount > 0 && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {majorCount} major
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Auto-fix all button */}
                    {autoFixableCount > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs h-8"
                        onClick={() => {
                          metrics.recommendations
                            .filter(r => r.autoFixable)
                            .forEach(r => handleAutoFix(r));
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-fix {autoFixableCount} issues
                      </Button>
                    )}

                    {/* Recommendation list */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {metrics.recommendations.slice(0, 5).map((rec) => (
                        <div 
                          key={rec.id}
                          className={cn(
                            "flex items-start gap-2 p-2 rounded-md text-xs",
                            "bg-muted/50 hover:bg-muted transition-colors",
                            rec.type === 'critical' && "border-l-2 border-red-500",
                            rec.type === 'major' && "border-l-2 border-amber-500"
                          )}
                        >
                          {rec.type === 'critical' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{rec.title}</p>
                            <p className="text-muted-foreground line-clamp-2">{rec.description}</p>
                          </div>
                          {rec.autoFixable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs shrink-0"
                              onClick={() => handleAutoFix(rec)}
                              disabled={fixingIds.has(rec.id)}
                            >
                              {fixingIds.has(rec.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>Fix<ChevronRight className="h-3 w-3 ml-0.5" /></>
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
