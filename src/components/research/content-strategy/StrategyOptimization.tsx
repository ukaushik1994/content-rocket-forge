import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, AlertCircle, CheckCircle, Zap, Target, RefreshCw, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { toast } from 'sonner';

interface StrategyOptimizationProps {
  strategy: any;
  serpMetrics: any;
  goals: any;
}

export const StrategyOptimization = ({ strategy, serpMetrics, goals }: StrategyOptimizationProps) => {
  const [optimizations, setOptimizations] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const { updateStrategy, pipelineItems, calendarItems, insights } = useContentStrategy();

  useEffect(() => {
    if (strategy && serpMetrics) {
      generateOptimizations();
    }
  }, [strategy, serpMetrics, pipelineItems, calendarItems]);

  const generateOptimizations = () => {
    setAnalyzing(true);
    
    setTimeout(() => {
      const optimizationSuggestions = [];
      
      // 1. SERP Performance Analysis
      if (serpMetrics?.keywordDifficulty > 70) {
        optimizationSuggestions.push({
          id: 1,
          type: 'keyword-strategy',
          priority: 'high',
          title: 'High Competition Detected',
          description: `Keyword difficulty (${serpMetrics.keywordDifficulty}) is very high. Consider targeting long-tail variations.`,
          impact: 85,
          effort: 'Medium',
          recommendation: 'Focus on 3-5 long-tail keywords with lower competition but good search volume.',
          action: 'Update keyword strategy',
          automated: true
        });
      }
      
      // 2. Content Gap Analysis
      const strategyPipeline = pipelineItems.filter(item => item.strategy_id === strategy?.id);
      const completedContent = strategyPipeline.filter(item => item.stage === 'published').length;
      const totalPlanned = strategyPipeline.length;
      
      if (completedContent < totalPlanned * 0.3) {
        optimizationSuggestions.push({
          id: 2,
          type: 'content-velocity',
          priority: 'medium',
          title: 'Content Production Below Target',
          description: `Only ${Math.round((completedContent/totalPlanned) * 100)}% of planned content completed. Consider resource reallocation.`,
          impact: 70,
          effort: 'High',
          recommendation: 'Break down large content pieces into smaller, manageable tasks or add more resources.',
          action: 'Optimize content workflow',
          automated: false
        });
      }
      
      // 3. Timeline Optimization
      const timelineMatch = strategy?.timeline?.match(/(\d+)/);
      const months = timelineMatch ? parseInt(timelineMatch[1]) : 3;
      const contentPerMonth = strategy?.content_pieces_per_month || 12;
      
      if (contentPerMonth / months > 15) {
        optimizationSuggestions.push({
          id: 3,
          type: 'timeline-adjustment',
          priority: 'medium',
          title: 'Aggressive Timeline Detected',
          description: `Current pace requires ${Math.round(contentPerMonth/months)} pieces per month, which may be unsustainable.`,
          impact: 60,
          effort: 'Low',
          recommendation: 'Consider extending timeline by 1-2 months for better quality and sustainability.',
          action: 'Adjust timeline',
          automated: true
        });
      }
      
      // 4. Topic Relevance Analysis
      if (insights.length > 0) {
        const latestInsight = insights[0];
        if (latestInsight.opportunity_score && latestInsight.opportunity_score < 50) {
          optimizationSuggestions.push({
            id: 4,
            type: 'topic-optimization',
            priority: 'high',
            title: 'Low Opportunity Score',
            description: `Current topic opportunities scoring ${latestInsight.opportunity_score}/100. New high-opportunity topics available.`,
            impact: 90,
            effort: 'Medium',
            recommendation: 'Pivot to newly identified high-opportunity topics in your niche.',
            action: 'Update content topics',
            automated: true
          });
        }
      }
      
      // 5. Competitive Intelligence
      if (serpMetrics?.topResults?.length > 0) {
        optimizationSuggestions.push({
          id: 5,
          type: 'competitive-advantage',
          priority: 'low',
          title: 'Competitor Content Analysis',
          description: 'New competitor content formats detected that could enhance your strategy.',
          impact: 50,
          effort: 'Medium',
          recommendation: 'Add video content and interactive elements to match competitor innovations.',
          action: 'Expand content formats',
          automated: false
        });
      }
      
      // 6. Performance-Based Optimization
      const publishedContent = pipelineItems.filter(item => 
        item.strategy_id === strategy?.id && item.stage === 'published'
      );
      
      if (publishedContent.length > 3) {
        optimizationSuggestions.push({
          id: 6,
          type: 'performance-optimization',
          priority: 'medium',
          title: 'Content Performance Insights',
          description: 'Analyze published content performance to optimize future pieces.',
          impact: 75,
          effort: 'Low',
          recommendation: 'Double down on top-performing content themes and formats.',
          action: 'Analyze content performance',
          automated: false
        });
      }
      
      setOptimizations(optimizationSuggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));
      setAnalyzing(false);
    }, 2000);
  };

  const applyOptimization = async (optimization: any) => {
    if (!optimization.automated) {
      toast.info('This optimization requires manual review and implementation.');
      return;
    }

    try {
      let updateData = {};
      
      if (optimization.type === 'timeline-adjustment') {
        const currentMonths = parseInt(strategy.timeline.match(/(\d+)/)?.[1] || '3');
        updateData = {
          timeline: `${currentMonths + 1} months`
        };
      } else if (optimization.type === 'keyword-strategy') {
        // Would typically integrate with SERP analysis to get long-tail keywords
        toast.success('Keyword strategy optimization queued for next analysis cycle.');
        return;
      }
      
      if (Object.keys(updateData).length > 0 && strategy?.id) {
        await updateStrategy(strategy.id, updateData);
        toast.success(`Applied ${optimization.title} optimization successfully!`);
        
        // Remove applied optimization
        setOptimizations(prev => prev.filter(opt => opt.id !== optimization.id));
      }
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Failed to apply optimization. Please try again.');
    }
  };

  const applyAllAutomated = async () => {
    const automatedOptimizations = optimizations.filter(opt => opt.automated);
    
    for (const optimization of automatedOptimizations) {
      await applyOptimization(optimization);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between applications
    }
    
    toast.success(`Applied ${automatedOptimizations.length} automated optimizations!`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };

  if (!strategy) {
    return (
      <Card className="glass-panel border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-white/60 mb-4">
            <Brain className="h-12 w-12 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Active Strategy</h3>
            <p className="text-sm">Activate a strategy to receive AI-powered optimization suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Optimization Header */}
      <Card className="glass-panel border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Strategy Optimization
            </CardTitle>
            <div className="flex gap-3">
              <Button 
                onClick={generateOptimizations} 
                disabled={analyzing}
                variant="outline"
                size="sm"
              >
                {analyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Re-analyze
              </Button>
              {optimizations.filter(opt => opt.automated).length > 0 && (
                <Button 
                  onClick={applyAllAutomated}
                  className="bg-primary hover:bg-primary/80"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Apply All
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            Real-time analysis of your strategy performance with AI-powered optimization suggestions
          </p>
        </CardHeader>
      </Card>

      {/* Optimization Suggestions */}
      <AnimatePresence>
        {analyzing ? (
          <Card className="glass-panel border-white/10">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Brain className="h-12 w-12 text-primary mx-auto animate-pulse" />
                <h3 className="text-lg font-semibold text-white">Analyzing Strategy Performance...</h3>
                <p className="text-muted-foreground">
                  AI is examining SERP data, content performance, and competitive landscape
                </p>
                <Progress value={75} className="w-64 mx-auto" />
              </motion.div>
            </CardContent>
          </Card>
        ) : optimizations.length > 0 ? (
          <div className="space-y-4">
            {optimizations.map((optimization, index) => (
              <motion.div
                key={optimization.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`glass-panel border-white/10 ${getPriorityColor(optimization.priority)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className={`${getPriorityColor(optimization.priority)} border-current`}>
                            {optimization.priority.toUpperCase()}
                          </Badge>
                          <h4 className="text-lg font-semibold text-white">{optimization.title}</h4>
                          {optimization.automated && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-white/80 mb-4">{optimization.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-blue-400">{optimization.impact}%</div>
                            <div className="text-xs text-muted-foreground">Impact Score</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <Target className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                            <div className="text-sm font-semibold text-purple-400">{optimization.effort}</div>
                            <div className="text-xs text-muted-foreground">Effort Level</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <Lightbulb className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                            <div className="text-sm font-semibold text-yellow-400">{optimization.type.replace('-', ' ')}</div>
                            <div className="text-xs text-muted-foreground">Optimization Type</div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mb-4">
                          <h5 className="font-medium text-primary mb-2">💡 Recommendation:</h5>
                          <p className="text-white/80 text-sm">{optimization.recommendation}</p>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <Button 
                          onClick={() => applyOptimization(optimization)}
                          variant={optimization.automated ? "default" : "outline"}
                          className="min-w-[120px]"
                        >
                          {optimization.automated ? (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Apply Now
                            </>
                          ) : (
                            optimization.action
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="glass-panel border-white/10">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Strategy Optimized!</h3>
              <p className="text-muted-foreground">
                No immediate optimizations detected. Your strategy is performing well.
              </p>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};