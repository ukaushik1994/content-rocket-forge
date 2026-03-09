
import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, FileText, Target, Calendar, BarChart3, Users, Lightbulb, ArrowRight, Plus, MousePointerClick, Eye
} from 'lucide-react';
import { TopicCluster } from '@/types/topicCluster';
import { motion } from 'framer-motion';
import { useTopicPerformance } from '@/hooks/useResearchIntelligence';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ClusterDetailsModalProps {
  cluster: TopicCluster | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateContent?: (clusterId: string) => void;
}

export function ClusterDetailsModal({ cluster, isOpen, onClose, onCreateContent }: ClusterDetailsModalProps) {
  const contentOpportunities = useMemo(() => {
    if (!cluster) return [];
    const opps = [
      `How-to guide for ${cluster.mainKeyword}`,
      `Best practices for ${cluster.mainKeyword}`,
      `Common mistakes with ${cluster.mainKeyword}`,
      `${cluster.mainKeyword} vs alternatives comparison`,
      `Complete beginner's guide to ${cluster.mainKeyword}`,
    ];
    cluster.keywords.forEach(kw => {
      opps.push(`Ultimate guide to ${kw}`);
      opps.push(`${kw} tips and tricks`);
    });
    return opps.slice(0, 8);
  }, [cluster]);

  if (!cluster) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const formatTraffic = (traffic: number) => {
    if (traffic >= 1000000) return `${(traffic / 1000000).toFixed(1)}M`;
    if (traffic >= 1000) return `${(traffic / 1000).toFixed(0)}K`;
    return traffic.toString();
  };

  const handleCreateContent = () => {
    if (onCreateContent) onCreateContent(cluster.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${cluster.color}`}></div>
                <DialogTitle className="text-xl">{cluster.name}</DialogTitle>
                <Badge className={getStatusColor(cluster.status)}>{cluster.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>{cluster.mainKeyword}</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(cluster.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Button onClick={handleCreateContent} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Cluster Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><span>Completion</span><span className="font-semibold">{cluster.completion}%</span></div>
                  <Progress value={cluster.completion} className="h-3" />
                  {cluster.description && (<div className="mt-4"><h4 className="font-medium mb-2">Description</h4><p className="text-muted-foreground">{cluster.description}</p></div>)}
                  {cluster.targetAudience && (<div><h4 className="font-medium mb-2 flex items-center gap-2"><Users className="h-4 w-4" />Target Audience</h4><p className="text-muted-foreground">{cluster.targetAudience}</p></div>)}
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center"><FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" /><div className="text-2xl font-bold">{cluster.articles}</div><div className="text-sm text-muted-foreground">Articles</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" /><div className="text-2xl font-bold">{formatTraffic(cluster.totalTraffic)}</div><div className="text-sm text-muted-foreground">Monthly Traffic</div></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><Target className="h-8 w-8 text-purple-500 mx-auto mb-2" /><div className="text-2xl font-bold">{cluster.avgPosition.toFixed(1)}</div><div className="text-sm text-muted-foreground">Avg Position</div></CardContent></Card>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Related Keywords ({cluster.keywords.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {cluster.keywords.map((keyword, index) => (
                    <motion.div key={keyword} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{keyword}</span>
                      <Badge variant="outline">Keyword</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {cluster.contentPillars && cluster.contentPillars.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Content Pillars</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {cluster.contentPillars.map((pillar, index) => (
                      <motion.div key={pillar} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{pillar}</span>
                        <Badge variant="secondary">Pillar</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />Content Opportunities</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {contentOpportunities.map((opportunity, index) => (
                    <motion.div key={opportunity} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors group">
                      <span className="font-medium">{opportunity}</span>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCreateContent}><ArrowRight className="h-4 w-4" /></Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Monthly Traffic</div>
                      <div className="text-2xl font-bold text-green-500">{formatTraffic(cluster.totalTraffic)}</div>
                      <div className="text-sm text-muted-foreground">visitors/month</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Average Position</div>
                      <div className="text-2xl font-bold text-blue-500">{cluster.avgPosition.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">search ranking</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-sm">Articles Published</span><span className="font-medium">{cluster.articles}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm">Keywords Covered</span><span className="font-medium">{cluster.keywords.length}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm">Last Updated</span><span className="font-medium">{cluster.lastUpdated}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm">Status</span><Badge className={getStatusColor(cluster.status)}>{cluster.status}</Badge></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
