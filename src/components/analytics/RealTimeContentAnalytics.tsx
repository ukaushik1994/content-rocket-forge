import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  Activity,
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ConversationMetrics {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessageLength: number;
  conversationDuration: number;
  actionsTriggered: number;
  engagementScore: number;
  featuresUsed: string[];
}

interface RealTimeContentAnalyticsProps {
  conversationId?: string;
  onGetAnalytics?: () => Promise<ConversationMetrics>;
  isOpen: boolean;
  onClose: () => void;
}

export const RealTimeContentAnalytics: React.FC<RealTimeContentAnalyticsProps> = ({
  conversationId,
  onGetAnalytics,
  isOpen,
  onClose
}) => {
  const [analytics, setAnalytics] = useState<ConversationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadAnalytics = async () => {
    if (!onGetAnalytics) return;
    
    setIsLoading(true);
    try {
      const data = await onGetAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      loadAnalytics();
    }
  }, [isOpen, conversationId]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const calculateEngagementScore = (metrics: ConversationMetrics) => {
    if (!metrics) return 0;
    
    const messageScore = Math.min(metrics.totalMessages * 2, 40);
    const actionScore = Math.min(metrics.actionsTriggered * 5, 30);
    const lengthScore = Math.min(metrics.averageMessageLength / 10, 20);
    const featureScore = Math.min(metrics.featuresUsed.length * 2, 10);
    
    return Math.round(messageScore + actionScore + lengthScore + featureScore);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Real-Time Analytics
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overview Metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <Badge variant="secondary">{analytics.totalMessages}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">User</span>
                      <span className="text-sm font-medium">{analytics.userMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Assistant</span>
                      <span className="text-sm font-medium">{analytics.assistantMessages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Length</span>
                      <span className="text-sm font-medium">{Math.round(analytics.averageMessageLength)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Engagement Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {calculateEngagementScore(analytics)}
                        </div>
                        <p className="text-sm text-muted-foreground">out of 100</p>
                      </div>
                      <Progress 
                        value={calculateEngagementScore(analytics)} 
                        className="h-2"
                      />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium">{analytics.actionsTriggered}</div>
                          <div className="text-muted-foreground">Actions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{analytics.featuresUsed.length}</div>
                          <div className="text-muted-foreground">Features</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Session Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm font-medium">
                        {formatDuration(analytics.conversationDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actions Triggered</span>
                      <Badge variant="outline">{analytics.actionsTriggered}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Features Used</span>
                      <Badge variant="outline">{analytics.featuresUsed.length}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Usage */}
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Feature Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analytics.featuresUsed.length > 0 ? (
                        analytics.featuresUsed.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No advanced features used yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Real-time Actions */}
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={loadAnalytics}>
                        <Activity className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Export Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        Share Insights
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground mb-4">
                  Start a conversation to see real-time analytics
                </p>
                <Button onClick={loadAnalytics}>Load Analytics</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};