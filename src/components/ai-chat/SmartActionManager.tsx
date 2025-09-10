import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ContextualAction } from '@/services/aiService';
import { actionAnalyticsService } from '@/services/actionAnalyticsService';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Activity,
  Star,
  Target
} from 'lucide-react';
import { LineChart } from '@/components/ui/chart';

interface SmartActionManagerProps {
  actions: ContextualAction[];
  userId: string;
  conversationId?: string;
  onActionTrigger: (action: ContextualAction) => void;
  showAnalytics?: boolean;
}

export const SmartActionManager: React.FC<SmartActionManagerProps> = ({
  actions,
  userId,
  conversationId,
  onActionTrigger,
  showAnalytics = true
}) => {
  const [recommendations, setRecommendations] = useState<ContextualAction[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (showAnalytics && userId) {
      loadAnalyticsData();
      loadRecommendations();
    }
  }, [userId, showAnalytics]);

  const loadAnalyticsData = async () => {
    try {
      const data = await actionAnalyticsService.getAnalyticsDashboard(userId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await actionAnalyticsService.generateSmartActionRecommendations(userId, {});
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleActionClick = async (action: ContextualAction) => {
    setIsLoading(true);
    
    try {
      // Track the action trigger
      const analyticsId = await actionAnalyticsService.trackActionTrigger(
        action,
        userId,
        conversationId
      );

      // Execute the action
      onActionTrigger(action);

      // Simulate action completion tracking (in real app, this would be triggered by the actual action completion)
      setTimeout(async () => {
        if (analyticsId) {
          await actionAnalyticsService.trackActionCompletion(
            analyticsId,
            true, // Assume success for demo
            Math.random() * 100 // Random effectiveness score
          );
          
          // Refresh analytics
          loadAnalyticsData();
        }
      }, 2000);

      toast({
        title: "Action Triggered",
        description: `${action.label} has been executed successfully.`,
      });

    } catch (error) {
      console.error('Error executing action:', error);
      toast({
        title: "Action Failed",
        description: "There was an error executing the action.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionCard = (action: ContextualAction, isRecommendation = false) => (
    <motion.div
      key={action.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      {isRecommendation && (
        <div className="absolute -inset-1 bg-gradient-to-r from-warning/20 to-success/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
      )}
      
      <Card className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
        isRecommendation 
          ? 'border-warning/30 bg-gradient-to-br from-warning/5 to-success/5' 
          : 'border-white/10 bg-glass hover:border-primary/30'
      }`}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isRecommendation 
                  ? 'bg-gradient-to-br from-warning/20 to-success/20' 
                  : 'bg-gradient-to-br from-primary/20 to-primary/5'
              }`}>
                {isRecommendation ? (
                  <Star className="w-4 h-4 text-warning" />
                ) : (
                  <Zap className="w-4 h-4 text-primary" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-sm">{action.label}</h4>
                {action.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                )}
              </div>
            </div>

            {isRecommendation && action.data?.successRate && (
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                {Math.round(action.data.successRate)}%
              </Badge>
            )}
          </div>

          <Button
            onClick={() => handleActionClick(action)}
            disabled={isLoading}
            variant={action.variant === 'primary' ? 'default' : (action.variant || (isRecommendation ? 'outline' : 'default'))}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                Executing...
              </div>
            ) : (
              action.label
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderAnalytics = () => {
    if (!analyticsData) return null;

    const chartData = analyticsData.trendData.map((day: any) => ({
      date: new Date(day.date).toLocaleDateString(),
      total: day.total,
      successful: day.successful,
      'Success Rate': day.total > 0 ? (day.successful / day.total) * 100 : 0
    }));

    return (
      <Card className="glass-panel bg-glass border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-info/20 to-info/5">
            <BarChart3 className="w-5 h-5 text-info" />
          </div>
          <h3 className="text-lg font-semibold">Action Analytics</h3>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {analyticsData.totalActions}
            </div>
            <div className="text-sm text-muted-foreground">Total Actions</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {analyticsData.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-info">
              {analyticsData.topActions.length}
            </div>
            <div className="text-sm text-muted-foreground">Action Types</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {recommendations.length}
            </div>
            <div className="text-sm text-muted-foreground">Recommendations</div>
          </div>
        </div>

        {/* Trend Chart */}
        {chartData.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Activity Trend (Last 7 Days)
            </h4>
            <div className="bg-white/5 rounded-lg p-4">
              <LineChart
                data={chartData}
                categories={['total', 'successful']}
                colors={['hsl(var(--primary))', 'hsl(var(--success))']}
                valueFormatter={(value) => `${value} actions`}
                className="h-[200px]"
              />
            </div>
          </div>
        )}

        {/* Top Actions */}
        {analyticsData.topActions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Top Performing Actions
            </h4>
            <div className="space-y-2">
              {analyticsData.topActions.slice(0, 3).map((action: any, index: number) => (
                <div
                  key={action.action_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">{action.action_label}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.total_triggers} uses
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-success">
                        {action.success_rate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">success</div>
                    </div>
                    <Progress
                      value={action.success_rate}
                      className="w-16 h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {showAnalytics && renderAnalytics()}

      {/* Recommended Actions */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-warning" />
            <h3 className="font-medium">Recommended Actions</h3>
            <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
              AI Powered
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <AnimatePresence>
              {recommendations.map(action => renderActionCard(action, true))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Regular Actions */}
      {actions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4" />
            <h3 className="font-medium">Available Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {actions.map(action => renderActionCard(action))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {actions.length === 0 && recommendations.length === 0 && (
        <Card className="text-center p-8 glass-panel bg-glass border border-white/10">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="font-medium mb-2">No Actions Available</h3>
          <p className="text-sm text-muted-foreground">
            Continue the conversation to discover contextual actions.
          </p>
        </Card>
      )}
    </div>
  );
};