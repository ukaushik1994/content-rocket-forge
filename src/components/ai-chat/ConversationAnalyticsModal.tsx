import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  User, 
  Bot, 
  Clock, 
  Zap, 
  Eye,
  TrendingUp
} from 'lucide-react';

interface ConversationAnalytics {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessageLength: number;
  conversationDuration: number;
  actionsTriggered: number;
  hasVisualData: boolean;
  hasWorkflowData: boolean;
}

interface ConversationAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetAnalytics: () => Promise<ConversationAnalytics>;
}

export const ConversationAnalyticsModal: React.FC<ConversationAnalyticsModalProps> = ({
  isOpen,
  onClose,
  onGetAnalytics
}) => {
  const [analytics, setAnalytics] = useState<ConversationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      onGetAnalytics()
        .then(setAnalytics)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, onGetAnalytics]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const calculateEngagementScore = () => {
    if (!analytics) return 0;
    
    const { totalMessages, actionsTriggered, averageMessageLength } = analytics;
    
    // Simple engagement score calculation
    const messageScore = Math.min(totalMessages / 50, 1) * 40;
    const actionScore = Math.min(actionsTriggered / 10, 1) * 30;
    const lengthScore = Math.min(averageMessageLength / 100, 1) * 30;
    
    return Math.round(messageScore + actionScore + lengthScore);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversation Analytics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : analytics ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{analytics.totalMessages}</div>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total Messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{analytics.userMessages}</div>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Your Messages</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{analytics.assistantMessages}</div>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">AI Responses</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {formatDuration(analytics.conversationDuration)}
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Duration</p>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Engagement Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{calculateEngagementScore()}%</span>
                    <Badge variant={calculateEngagementScore() > 70 ? "default" : "secondary"}>
                      {calculateEngagementScore() > 70 ? "High" : calculateEngagementScore() > 40 ? "Medium" : "Low"}
                    </Badge>
                  </div>
                  <Progress value={calculateEngagementScore()} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    Based on message frequency, actions triggered, and message depth
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Message Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Length</span>
                    <span className="text-sm font-medium">
                      {Math.round(analytics.averageMessageLength)} chars
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actions Triggered</span>
                    <span className="text-sm font-medium">{analytics.actionsTriggered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Response Ratio</span>
                    <span className="text-sm font-medium">
                      {analytics.totalMessages > 0 
                        ? `${((analytics.assistantMessages / analytics.totalMessages) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Features Used</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Visual Data</span>
                    <Badge variant={analytics.hasVisualData ? "default" : "outline"}>
                      {analytics.hasVisualData ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Workflows</span>
                    <Badge variant={analytics.hasWorkflowData ? "default" : "outline"}>
                      {analytics.hasWorkflowData ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Interactive Actions</span>
                    <Badge variant={analytics.actionsTriggered > 0 ? "default" : "outline"}>
                      {analytics.actionsTriggered > 0 ? "Yes" : "No"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No analytics data available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};