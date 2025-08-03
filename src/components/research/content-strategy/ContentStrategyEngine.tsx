import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Send, 
  TrendingUp, 
  Calendar, 
  Target,
  BarChart3,
  Lightbulb,
  Trash2,
  Eye
} from 'lucide-react';
import { contentStrategyService, ContentCluster } from '@/services/contentStrategyService';
import { useToast } from '@/hooks/use-toast';

interface ContentStrategyEngineProps {
  serpMetrics?: any;
  goals?: any;
}

export function ContentStrategyEngine({ serpMetrics, goals }: ContentStrategyEngineProps) {
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      setLoading(true);
      const data = await contentStrategyService.getContentClusters();
      setClusters(data);
    } catch (error) {
      console.error('Error loading clusters:', error);
      toast({
        title: "Error",
        description: "Failed to load content clusters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateBlueprint = async () => {
    try {
      setGenerating(true);
      const result = await contentStrategyService.generateStrategyBlueprint();
      setClusters(prev => [...result.clusters, ...prev]);
      toast({
        title: "Strategy Generated",
        description: result.message
      });
    } catch (error) {
      console.error('Error generating blueprint:', error);
      toast({
        title: "Error",
        description: "Failed to generate strategy blueprint",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const refreshClusters = async () => {
    try {
      setLoading(true);
      const result = await contentStrategyService.refreshClusters();
      await loadClusters();
      toast({
        title: "Clusters Refreshed",
        description: result.message
      });
    } catch (error) {
      console.error('Error refreshing clusters:', error);
      toast({
        title: "Error",
        description: "Failed to refresh clusters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendToContentBuilder = async (cluster: ContentCluster) => {
    try {
      const result = await contentStrategyService.sendToContentBuilder(cluster.id);
      
      // Store payload in sessionStorage for Content Builder
      sessionStorage.setItem('contentBuilderPayload', JSON.stringify(result.payload));
      
      toast({
        title: "Sent to Content Builder",
        description: `${cluster.name} has been routed to Content Builder`
      });

      // Navigate to Content Builder
      window.location.href = result.redirect_url;
    } catch (error) {
      console.error('Error sending to content builder:', error);
      toast({
        title: "Error",
        description: "Failed to send to Content Builder",
        variant: "destructive"
      });
    }
  };

  const updateStatus = async (clusterId: string, status: string) => {
    try {
      await contentStrategyService.updateClusterStatus(clusterId, status);
      setClusters(prev => 
        prev.map(cluster => 
          cluster.id === clusterId ? { ...cluster, status: status as any } : cluster
        )
      );
      toast({
        title: "Status Updated",
        description: "Cluster status has been updated"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const deleteCluster = async (clusterId: string) => {
    try {
      await contentStrategyService.deleteCluster(clusterId);
      setClusters(prev => prev.filter(cluster => cluster.id !== clusterId));
      toast({
        title: "Cluster Deleted",
        description: "Content cluster has been deleted"
      });
    } catch (error) {
      console.error('Error deleting cluster:', error);
      toast({
        title: "Error",
        description: "Failed to delete cluster",
        variant: "destructive"
      });
    }
  };

  const ClusterCard = ({ cluster }: { cluster: ContentCluster }) => (
    <Card className="relative overflow-hidden border border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{cluster.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {cluster.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${contentStrategyService.getPriorityTagColor(cluster.priority_tag)}`}
            >
              {contentStrategyService.getPriorityTagLabel(cluster.priority_tag)}
            </Badge>
            <Badge 
              variant="outline"
              className={`text-xs ${contentStrategyService.getStatusColor(cluster.status)}`}
            >
              {cluster.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Traffic Estimation */}
        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <div>
            <div className="text-sm font-medium">Estimated Monthly Traffic</div>
            <div className="text-2xl font-bold text-green-600">
              {cluster.estimated_traffic.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Suggested Assets */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Recommended Content Assets
          </div>
          <div className="grid grid-cols-2 gap-2">
              {Object.entries(cluster.suggested_assets).map(([type, count]) => (
                <div key={type} className="flex justify-between text-xs p-2 bg-muted/50 rounded">
                  <span className="capitalize">{type}:</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>Suggested Timeline: {cluster.timeframe_weeks} weeks</span>
        </div>

        {/* Solution Mapping */}
        {cluster.solution_mapping.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Mapped Solutions
            </div>
            <div className="flex flex-wrap gap-1">
              {cluster.solution_mapping.slice(0, 3).map((solution, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {solution}
                </Badge>
              ))}
              {cluster.solution_mapping.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{cluster.solution_mapping.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Button
            onClick={() => sendToContentBuilder(cluster)}
            size="sm"
            className="flex-1 gap-2"
          >
            <Send className="h-4 w-4" />
            Send to Builder
          </Button>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextStatus = cluster.status === 'new' ? 'in_progress' : 
                                 cluster.status === 'in_progress' ? 'published' : 'new';
                updateStatus(cluster.id, nextStatus);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteCluster(cluster.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Strategy Engine</h2>
          <p className="text-muted-foreground">
            AI-powered strategic content planning with competitive intelligence
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={refreshClusters}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={generateBlueprint}
            disabled={generating}
            className="gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            {generating ? 'Generating...' : 'Generate Strategy'}
          </Button>
        </div>
      </div>

      {/* Strategy Overview */}
      {clusters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strategy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{clusters.length}</div>
                <div className="text-sm text-muted-foreground">Content Clusters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {clusters.reduce((sum, c) => sum + c.estimated_traffic, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Est. Monthly Traffic</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {clusters.reduce((sum, c) => sum + Object.values(c.suggested_assets).reduce((a: number, b: number) => a + b, 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Suggested Assets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(clusters.reduce((sum, c) => sum + c.timeframe_weeks, 0) / clusters.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Weeks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Clusters */}
      <div>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Clusters</TabsTrigger>
            <TabsTrigger value="quick_win">Quick Wins</TabsTrigger>
            <TabsTrigger value="high_return">High Return</TabsTrigger>
            <TabsTrigger value="evergreen">Evergreen</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-20 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : clusters.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No Content Clusters Yet</h3>
                    <p className="text-muted-foreground">
                      Generate your first strategic content blueprint to get started
                    </p>
                  </div>
                  <Button onClick={generateBlueprint} disabled={generating}>
                    {generating ? 'Generating...' : 'Generate Strategy Blueprint'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters.map((cluster) => (
                  <ClusterCard key={cluster.id} cluster={cluster} />
                ))}
              </div>
            )}
          </TabsContent>

          {['quick_win', 'high_return', 'evergreen'].map((tag) => (
            <TabsContent key={tag} value={tag} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters
                  .filter((cluster) => cluster.priority_tag === tag)
                  .map((cluster) => (
                    <ClusterCard key={cluster.id} cluster={cluster} />
                  ))}
              </div>
              {clusters.filter((cluster) => cluster.priority_tag === tag).length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No {tag.replace('_', ' ')} clusters found
                  </p>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}