import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Search,
  ArrowRight
} from 'lucide-react';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';

interface InsightMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
}

interface ActionableInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'urgent' | 'soon' | 'later';
  category: 'content' | 'seo' | 'strategy' | 'performance';
  action: string;
  estimatedROI?: string;
}

export const AdvancedInsightsPanel: React.FC = () => {
  const { currentStrategy, aiProposals, selectedProposals, contentItems, insights } = useContentStrategy();
  const [selectedInsight, setSelectedInsight] = useState<ActionableInsight | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate advanced metrics
  const metrics: InsightMetric[] = [
    {
      label: 'Content Velocity',
      value: contentItems.length > 0 ? `${Math.round(contentItems.length / 30)} pieces/month` : 'No data',
      change: 12,
      trend: 'up',
      icon: TrendingUp
    },
    {
      label: 'Strategy Coverage',
      value: aiProposals.length > 0 ? `${Math.round((Object.values(selectedProposals).filter(Boolean).length / aiProposals.length) * 100)}%` : '0%',
      change: 8,
      trend: 'up',
      icon: Target
    },
    {
      label: 'SEO Opportunities',
      value: insights.length,
      change: insights.length > 5 ? 15 : -3,
      trend: insights.length > 5 ? 'up' : 'down',
      icon: Search
    },
    {
      label: 'Engagement Score',
      value: '8.4/10',
      change: 5,
      trend: 'up',
      icon: Users
    }
  ];

  // Generate actionable insights
  const actionableInsights: ActionableInsight[] = [
    {
      id: '1',
      title: 'Optimize Long-tail Keywords',
      description: 'Focus on long-tail keywords with lower competition but high intent for your niche.',
      impact: 'high',
      urgency: 'urgent',
      category: 'seo',
      action: 'Create 5 pieces targeting long-tail variants',
      estimatedROI: '+35% organic traffic'
    },
    {
      id: '2', 
      title: 'Expand Content Clusters',
      description: 'Your pillar content is performing well. Create supporting content around these topics.',
      impact: 'medium',
      urgency: 'soon',
      category: 'content',
      action: 'Add 3 cluster articles per pillar',
      estimatedROI: '+20% topical authority'
    },
    {
      id: '3',
      title: 'Competitor Gap Analysis',
      description: 'Competitors are ranking for keywords you haven\'t targeted yet.',
      impact: 'high',
      urgency: 'soon',
      category: 'strategy',
      action: 'Target 10 competitor keywords',
      estimatedROI: '+25% market share'
    },
    {
      id: '4',
      title: 'Content Refresh Needed',
      description: 'Some of your older content is losing rankings and needs updating.',
      impact: 'medium',
      urgency: 'later',
      category: 'performance',
      action: 'Update and republish 8 articles',
      estimatedROI: '+15% ranking recovery'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-white/60 border-white/20';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'soon': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'later': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Clock className="h-4 w-4 text-white/60" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl glass-panel border border-white/20">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI-Powered Insights</h2>
            <p className="text-white/60">Advanced analytics and strategic recommendations</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          <Zap className="h-3 w-3 mr-1" />
          Live Analysis
        </Badge>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="glass-card border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="h-5 w-5 text-primary" />
                  {metric.change && (
                    <Badge variant="outline" className={`text-xs ${metric.trend === 'up' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-white/60">{metric.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actionable Insights */}
      <Card className="glass-card border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-primary" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionableInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="p-4 rounded-lg glass-panel border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedInsight(insight);
                setShowDetails(true);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    {getUrgencyIcon(insight.urgency)}
                    <h3 className="font-medium text-white">{insight.title}</h3>
                    <Badge variant="outline" className={`text-xs ${getImpactColor(insight.impact)}`}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm">{insight.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>Action: {insight.action}</span>
                    {insight.estimatedROI && (
                      <span className="text-green-400">Est. ROI: {insight.estimatedROI}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40" />
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {showDetails && selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg glass-card border border-white/20 rounded-xl shadow-2xl"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {getUrgencyIcon(selectedInsight.urgency)}
                  {selectedInsight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">{selectedInsight.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Impact Level:</span>
                    <Badge variant="outline" className={getImpactColor(selectedInsight.impact)}>
                      {selectedInsight.impact}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/60">Recommended Action:</span>
                    <span className="text-white text-sm">{selectedInsight.action}</span>
                  </div>
                  
                  {selectedInsight.estimatedROI && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Estimated ROI:</span>
                      <span className="text-green-400 font-medium">{selectedInsight.estimatedROI}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => setShowDetails(false)}
                    variant="outline"
                    className="flex-1 glass-panel border-white/20"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      // Implement insight action
                      console.log('Implementing insight:', selectedInsight.id);
                      setShowDetails(false);
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Take Action
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};