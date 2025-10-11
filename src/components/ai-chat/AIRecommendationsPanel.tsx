import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  ChevronRight,
  Brain,
  Target,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AIInsights {
  predictions?: string[];
  anomalies?: Array<{ 
    type: string; 
    description: string; 
    severity: 'low' | 'medium' | 'high' 
  }>;
  recommendations?: Array<{ 
    title: string; 
    description: string; 
    impact: string 
  }>;
  trends?: string[];
}

interface AIRecommendationsPanelProps {
  insights: AIInsights;
  onClose: () => void;
  onApplyRecommendation?: (recommendation: any) => void;
  analysisId?: string | null;
}

const severityColors = {
  low: 'text-blue-500 bg-blue-500/10',
  medium: 'text-yellow-500 bg-yellow-500/10',
  high: 'text-red-500 bg-red-500/10'
};

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  insights,
  onClose,
  onApplyRecommendation,
  analysisId
}) => {
  // Track when insights are viewed
  useEffect(() => {
    const trackInsightView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Track each type of insight
        const trackPromises = [];
        
        if (insights.predictions?.length) {
          trackPromises.push(
            supabase.from('chart_insight_analytics').insert({
              user_id: user.id,
              analysis_id: analysisId,
              insight_type: 'prediction',
              insight_content: `${insights.predictions.length} predictions viewed`,
              action_taken: 'viewed',
              interaction_data: { count: insights.predictions.length }
            })
          );
        }

        if (insights.recommendations?.length) {
          trackPromises.push(
            supabase.from('chart_insight_analytics').insert({
              user_id: user.id,
              analysis_id: analysisId,
              insight_type: 'recommendation',
              insight_content: `${insights.recommendations.length} recommendations viewed`,
              action_taken: 'viewed',
              interaction_data: { count: insights.recommendations.length }
            })
          );
        }

        await Promise.all(trackPromises);
      } catch (error) {
        console.error('Error tracking insight view:', error);
      }
    };

    trackInsightView();
  }, [insights, analysisId]);

  // Track when user applies a recommendation
  const handleApplyRecommendation = async (rec: any, index: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('chart_insight_analytics').insert({
          user_id: user.id,
          analysis_id: analysisId,
          insight_type: 'recommendation',
          insight_content: rec.title,
          action_taken: 'applied',
          chart_index: index,
          interaction_data: { recommendation: rec }
        });
      }
    } catch (error) {
      console.error('Error tracking recommendation application:', error);
    }

    if (onApplyRecommendation) {
      onApplyRecommendation(rec);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Header */}
      <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent analysis and recommendations
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>

      {/* Predictions */}
      {insights.predictions && insights.predictions.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Predictive Insights</h4>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </Badge>
          </div>
          <div className="space-y-2">
            {insights.predictions.map((prediction, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{prediction}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Anomalies */}
      {insights.anomalies && insights.anomalies.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold">Detected Anomalies</h4>
          </div>
          <div className="space-y-2">
            {insights.anomalies.map((anomaly, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 rounded-lg border-l-4 bg-muted/50"
                style={{
                  borderLeftColor: anomaly.severity === 'high' 
                    ? 'rgb(239, 68, 68)' 
                    : anomaly.severity === 'medium' 
                    ? 'rgb(234, 179, 8)' 
                    : 'rgb(59, 130, 246)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{anomaly.type}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", severityColors[anomaly.severity])}
                  >
                    {anomaly.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{anomaly.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h4 className="font-semibold">Smart Recommendations</h4>
          </div>
          <div className="space-y-3">
            {insights.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 hover:border-accent/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-accent" />
                      <h5 className="font-semibold text-sm">{rec.title}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                        {rec.impact}
                      </Badge>
                    </div>
                  </div>
                  {onApplyRecommendation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleApplyRecommendation(rec, idx)}
                      >
                      Apply
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Trends */}
      {insights.trends && insights.trends.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <h4 className="font-semibold">Trend Analysis</h4>
          </div>
          <div className="space-y-2">
            {insights.trends.map((trend, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="text-primary mt-0.5">▸</span>
                <span>{trend}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};
