import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

interface WorkflowState {
  id: string;
  userId: string;
  userName: string;
  conversationId: string;
  currentStep: string;
  progress: number;
  context: Record<string, any>;
  lastUpdated: Date;
}

interface WorkflowUpdate {
  type: 'progress' | 'step_change' | 'context_update' | 'completion';
  userId: string;
  userName: string;
  step?: string;
  progress?: number;
  context?: Record<string, any>;
  timestamp: Date;
}

interface TeamWorkflowPanelProps {
  teamWorkflowStates: WorkflowState[];
  workflowUpdates: WorkflowUpdate[];
  averageProgress: number;
  isConnected: boolean;
  className?: string;
}

export const TeamWorkflowPanel: React.FC<TeamWorkflowPanelProps> = ({
  teamWorkflowStates,
  workflowUpdates,
  averageProgress,
  isConnected,
  className = ""
}) => {
  const getStatusColor = (progress: number) => {
    if (progress >= 100) return 'text-success';
    if (progress >= 75) return 'text-primary';
    if (progress >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getUpdateIcon = (type: WorkflowUpdate['type']) => {
    switch (type) {
      case 'completion':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
        <span className={isConnected ? 'text-success' : 'text-destructive'}>
          {isConnected ? 'Connected to team' : 'Disconnected'}
        </span>
      </div>

      {/* Team Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Progress</span>
              <Badge variant={averageProgress >= 75 ? 'default' : 'secondary'}>
                {Math.round(averageProgress)}%
              </Badge>
            </div>
            <Progress value={averageProgress} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{teamWorkflowStates.length} team members active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Team Member States */}
      {teamWorkflowStates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-3">
                {teamWorkflowStates.map((state) => (
                  <motion.div
                    key={state.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg border"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {state.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {state.userName}
                        </span>
                        <span className={`text-xs ${getStatusColor(state.progress)}`}>
                          {state.progress}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {state.currentStep}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(state.lastUpdated)}
                        </span>
                      </div>
                      
                      <Progress value={state.progress} className="h-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Updates */}
      {workflowUpdates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {workflowUpdates.slice(0, 5).map((update, index) => (
                  <motion.div
                    key={`${update.userId}-${update.timestamp}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-2 text-sm"
                  >
                    {getUpdateIcon(update.type)}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{update.userName}</span>
                      <span className="text-muted-foreground ml-1">
                        {update.type === 'progress' && `updated progress to ${update.progress}%`}
                        {update.type === 'completion' && `completed step: ${update.step}`}
                        {update.type === 'context_update' && 'updated workflow context'}
                        {update.type === 'step_change' && `moved to: ${update.step}`}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(new Date(update.timestamp))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};