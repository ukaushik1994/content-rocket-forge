import React, { useState } from 'react';
import { useWorkflowData } from '@/hooks/useWorkflowData';
import { CrossWorkflowIntelligence } from '@/services/crossWorkflowIntelligence';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Download, 
  Filter,
  TrendingUp,
  BarChart3,
  Workflow,
  Search,
  Calendar,
  FileText,
  Share2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const WorkflowHistoryPage: React.FC = () => {
  const { executions, templates, isLoading } = useWorkflowData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  // Filter executions
  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = execution.execution_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         execution.workflow_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    const matchesType = typeFilter === 'all' || execution.workflow_id.includes(typeFilter);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'running': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'failed': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Play className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Export execution results
  const handleExportResults = async (executionId: string) => {
    try {
      const execution = executions.find(e => e.id === executionId);
      if (!execution) return;

      const exportData = {
        execution_id: executionId,
        execution_name: execution.execution_name,
        workflow_type: execution.workflow_id,
        status: execution.status,
        results: execution.output_results,
        performance: execution.performance_metrics,
        created_at: execution.created_at,
        completed_at: execution.completed_at
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `workflow-execution-${executionId}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Performance statistics
  const performanceStats = React.useMemo(() => {
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const total = executions.length;
    
    return {
      successRate: total > 0 ? (completed / total) * 100 : 0,
      totalExecutions: total,
      avgDuration: executions
        .filter(e => e.started_at && e.completed_at)
        .reduce((sum, e) => {
          const duration = new Date(e.completed_at!).getTime() - new Date(e.started_at!).getTime();
          return sum + duration;
        }, 0) / Math.max(completed, 1)
    };
  }, [executions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading workflow history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workflow History</h1>
        <p className="text-muted-foreground">
          Track and analyze your intelligent workflow executions
        </p>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Success Rate</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-primary">
                {performanceStats.successRate.toFixed(1)}%
              </div>
              <Progress 
                value={performanceStats.successRate} 
                className="mt-2 h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Workflow className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Executions</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-blue-600">
                {performanceStats.totalExecutions}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All time workflows
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold">Avg Duration</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round(performanceStats.avgDuration / 60000)}m
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Per execution
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search executions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Workflow Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="keyword">Keyword Analysis</SelectItem>
                  <SelectItem value="content">Content Creation</SelectItem>
                  <SelectItem value="seo">SEO Optimization</SelectItem>
                  <SelectItem value="competitor">Competitor Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Execution History
          </CardTitle>
          <CardDescription>
            {filteredExecutions.length} executions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              <AnimatePresence>
                {filteredExecutions.map((execution) => (
                  <motion.div
                    key={execution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {execution.execution_name || `Execution ${execution.id.slice(0, 8)}`}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(execution.status)}
                          >
                            {getStatusIcon(execution.status)}
                            <span className="ml-1 capitalize">{execution.status}</span>
                          </Badge>
                          {execution.ai_model && (
                            <Badge variant="secondary">
                              {execution.ai_model}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(execution.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                          {execution.completed_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Duration: {Math.round(
                                (new Date(execution.completed_at).getTime() - 
                                 new Date(execution.started_at || execution.created_at).getTime()) / 60000
                              )}m
                            </span>
                          )}
                          {execution.progress && (
                            <span className="flex items-center gap-1">
                              Progress: {execution.progress.completed_steps.length}/{execution.progress.total_steps}
                            </span>
                          )}
                        </div>

                        {execution.progress && execution.status === 'running' && (
                          <Progress 
                            value={(execution.progress.completed_steps.length / execution.progress.total_steps) * 100}
                            className="h-2 w-full max-w-[300px]"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedExecution(
                            selectedExecution === execution.id ? null : execution.id
                          )}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportResults(execution.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedExecution === execution.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <Tabs defaultValue="results" className="w-full">
                            <TabsList>
                              <TabsTrigger value="results">Results</TabsTrigger>
                              <TabsTrigger value="performance">Performance</TabsTrigger>
                              <TabsTrigger value="context">Context</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="results" className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4">
                                <pre className="text-sm overflow-auto max-h-[200px]">
                                  {JSON.stringify(execution.output_results, null, 2)}
                                </pre>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="performance" className="mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Performance Metrics</h4>
                                  <div className="bg-muted/30 rounded-lg p-3 text-sm">
                                    {execution.performance_metrics ? (
                                      <pre>{JSON.stringify(execution.performance_metrics, null, 2)}</pre>
                                    ) : (
                                      <p className="text-muted-foreground">No performance data available</p>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Error Details</h4>
                                  <div className="bg-muted/30 rounded-lg p-3 text-sm">
                                    {execution.error_details ? (
                                      <pre className="text-red-600">{JSON.stringify(execution.error_details, null, 2)}</pre>
                                    ) : (
                                      <p className="text-muted-foreground">No errors reported</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="context" className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4">
                                <pre className="text-sm overflow-auto max-h-[200px]">
                                  {JSON.stringify(execution.input_context, null, 2)}
                                </pre>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredExecutions.length === 0 && (
                <div className="text-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No executions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'Start creating workflows to see execution history'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowHistoryPage;