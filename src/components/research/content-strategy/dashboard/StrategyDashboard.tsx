
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, FileText, Calendar, Users, BarChart3 } from 'lucide-react';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { useStrategyIntegration } from '@/hooks/useStrategyIntegration';
import { StrategyWorkflowActions } from '../StrategyWorkflowActions';

interface StrategyDashboardProps {
  serpMetrics?: any;
  goals: {
    monthlyTraffic: string;
    contentPieces: string;
    timeline: string;
    mainKeyword: string;
  };
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({ serpMetrics, goals }) => {
  const { currentStrategy, contentItems, calendarItems, pipelineItems } = useContentStrategy();
  const { context, crossToolActions, isLoading } = useStrategyIntegration();

  const calculateProgress = () => {
    if (!currentStrategy || !goals.contentPieces) return 0;
    const target = parseInt(goals.contentPieces);
    const current = contentItems.length;
    return Math.min((current / target) * 100, 100);
  };

  const getUpcomingDeadlines = () => {
    return calendarItems
      .filter(item => new Date(item.scheduled_date) > new Date())
      .slice(0, 3)
      .map(item => ({
        title: item.title,
        date: new Date(item.scheduled_date).toLocaleDateString(),
        status: item.status
      }));
  };

  const getRecentActivity = () => {
    const recentContent = contentItems.slice(0, 3);
    const recentPipeline = pipelineItems.slice(0, 2);
    
    return [
      ...recentContent.map(item => ({
        type: 'content',
        title: item.title,
        status: item.status,
        date: new Date(item.updated_at).toLocaleDateString()
      })),
      ...recentPipeline.map(item => ({
        type: 'pipeline',
        title: item.title,
        status: item.stage,
        date: new Date(item.updated_at).toLocaleDateString()
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-white/60">Monthly Goal</p>
                <p className="text-lg font-semibold text-white">{goals.monthlyTraffic}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-white/60">Content Progress</p>
                <p className="text-lg font-semibold text-white">
                  {contentItems.length}/{goals.contentPieces}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-white/60">Scheduled</p>
                <p className="text-lg font-semibold text-white">{calendarItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-white/60">In Pipeline</p>
                <p className="text-lg font-semibold text-white">{pipelineItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Strategy Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Content Creation</span>
              <span className="text-white">{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          {currentStrategy && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Strategy Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Main Keyword:</span>
                    <Badge variant="outline">{currentStrategy.main_keyword || 'Not set'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Timeline:</span>
                    <span className="text-white">{currentStrategy.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Target Audience:</span>
                    <span className="text-white">{currentStrategy.target_audience || 'Not set'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {getRecentActivity().map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-white/80">{activity.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Actions */}
      <StrategyWorkflowActions />

      {/* Quick Actions from Cross-Tool Integration */}
      {crossToolActions.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {crossToolActions.slice(0, 4).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="justify-start border-white/20 text-white hover:bg-white/10 h-auto p-3"
                  onClick={action.action}
                >
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    {action.priority === 'high' && (
                      <Badge variant="destructive" className="mt-1 text-xs">High Priority</Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
