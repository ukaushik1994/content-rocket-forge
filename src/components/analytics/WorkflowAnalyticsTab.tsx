import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  TrendingUp,
  BarChart3,
  PlayCircle,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkflowAnalyticsTabProps {
  workflowMetrics: any;
  executions: any[];
}

export const WorkflowAnalyticsTab: React.FC<WorkflowAnalyticsTabProps> = ({ 
  workflowMetrics, 
  executions 
}) => {
  const navigate = useNavigate();

  const recentExecutions = executions?.slice(0, 5) || [];
  const successRate = workflowMetrics?.systemHealth || 0.85;
  const avgResponseTime = workflowMetrics?.avgResponseTime || 2500;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <PlayCircle className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'running': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Workflow Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-xl border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {Math.round(successRate * 100)}%
                </h3>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
            <Progress value={successRate * 100} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {(avgResponseTime / 1000).toFixed(1)}s
                </h3>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-lg">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {executions?.length || 0}
                </h3>
                <p className="text-sm text-muted-foreground">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workflow Executions */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-foreground">Recent Workflow Executions</CardTitle>
              <CardDescription>Latest intelligent workflow activities</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/workflows/history')}
              className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExecutions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No workflow executions yet</p>
                <p className="text-sm">Start using AI workflows to see analytics here</p>
              </div>
            ) : (
              recentExecutions.map((execution: any, index: number) => (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-card/30 to-card/10 border border-border/30 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h4 className="font-medium text-foreground">
                        {execution.execution_name || 'Workflow Execution'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(execution.created_at).toLocaleDateString()} • 
                        {execution.ai_model || 'Unknown Model'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                    {execution.completed_at && (
                      <div className="text-sm text-muted-foreground">
                        {Math.round((new Date(execution.completed_at).getTime() - new Date(execution.created_at).getTime()) / 1000)}s
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Pattern Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur-xl border-border/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm font-medium text-emerald-400">+12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium text-blue-400">-8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="text-sm font-medium text-green-400">-15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-border/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Workflow Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Content Creation</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Keyword Research</span>
                <span className="text-sm font-medium">32%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Strategy Analysis</span>
                <span className="text-sm font-medium">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Workflow Intelligence</h3>
              <p className="text-muted-foreground">Explore advanced workflow analytics and patterns</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/workflows/history')}
                className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View History
              </Button>
              <Button 
                onClick={() => navigate('/ai-chat')}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Workflow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};