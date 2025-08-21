import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  RefreshCw, 
  Send, 
  TrendingUp, 
  Calendar, 
  Target,
  BarChart3,
  Lightbulb,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { contentStrategyService, ContentCluster } from '@/services/contentStrategyService';
import { useToast } from '@/hooks/use-toast';
import { StrategyGenerationModal, GenerationStep } from './StrategyGenerationModal';
import { StrategySessionManager } from './StrategySessionManager';
import { StrategyBuilderDialog } from './StrategyBuilderDialog';
import { ProposalCard } from './ProposalCard';

interface ContentStrategyEngineProps {
  serpMetrics?: any;
  goals?: any;
}

export function ContentStrategyEngine({ serpMetrics, goals }: ContentStrategyEngineProps) {
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
const { toast } = useToast();

  // Generation modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([
    { label: 'Preparing company and market context', status: 'pending' },
    { label: 'Generating candidate keywords (AI)', status: 'pending' },
    { label: 'Fetching SERP metrics', status: 'pending' },
    { label: 'Assembling strategy proposals (AI)', status: 'pending' },
    { label: 'Finalizing', status: 'pending' },
  ]);
  const timersRef = useRef<number[]>([] as unknown as number[]);

  const startProgress = () => {
    setShowGenModal(true);
    setGenSteps((prev) => prev.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })));
    const t1 = window.setTimeout(() => setGenSteps((prev) => prev.map((s, i) => ({ ...s, status: i < 1 ? 'done' : i === 1 ? 'active' : 'pending' }))), 600);
    const t2 = window.setTimeout(() => setGenSteps((prev) => prev.map((s, i) => ({ ...s, status: i < 2 ? 'done' : i === 2 ? 'active' : 'pending' }))), 1300);
    const t3 = window.setTimeout(() => setGenSteps((prev) => prev.map((s, i) => ({ ...s, status: i < 3 ? 'done' : i === 3 ? 'active' : 'pending' }))), 2000);
    timersRef.current = [t1, t2, t3];
  };

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [] as unknown as number[];
  };

  const finishProgress = () => {
    clearTimers();
    setGenSteps((prev) => prev.map((s) => ({ ...s, status: 'done' })));
    window.setTimeout(() => setShowGenModal(false), 700);
  };

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
    startProgress();
    
    const result = await contentStrategyService.generateAIStrategy({ 
      goals: goals || {}, 
      location: 'United States' 
    });
    
    setProposals(result.proposals || []);
    
    toast({ 
      title: 'Strategy Proposals Ready', 
      description: result.message || 'Select a proposal to continue.' 
    });
    
    finishProgress();
  } catch (error) {
    console.error('❌ Error generating AI strategy:', error);
    clearTimers();
    setShowGenModal(false);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI strategy';
    
    toast({ 
      title: 'Strategy Generation Failed', 
      description: errorMessage.includes('API key') 
        ? 'Please configure your OpenAI and SERP API keys in Settings'
        : errorMessage,
      variant: 'destructive' 
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

// Strategy Builder Dialog state
const [showStrategyBuilder, setShowStrategyBuilder] = useState(false);
const [selectedProposal, setSelectedProposal] = useState<any>(null);

// Direct handoff to Strategy Builder Dialog for a proposal
const sendProposalToContentBuilder = async (proposal: any) => {
  setSelectedProposal(proposal);
  setShowStrategyBuilder(true);
};

const sendToContentBuilder = async (cluster: ContentCluster) => {
  try {
    const result = await contentStrategyService.sendToContentBuilder(cluster.id);
    sessionStorage.setItem('contentBuilderPayload', JSON.stringify(result.payload));
    toast({ title: 'Sent to Content Builder', description: `${cluster.name} has been routed to Content Builder` });
    window.location.href = result.redirect_url;
  } catch (error) {
    console.error('Error sending to content builder:', error);
    toast({ title: 'Error', description: 'Failed to send to Content Builder', variant: 'destructive' });
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
    <Card className="relative overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-white">{cluster.name}</CardTitle>
            <CardDescription className="text-sm text-white/60">
              {cluster.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs border-white/20 ${
                cluster.priority_tag === 'quick_win' ? 'text-green-400 bg-green-500/10' :
                cluster.priority_tag === 'high_return' ? 'text-blue-400 bg-blue-500/10' :
                cluster.priority_tag === 'evergreen' ? 'text-purple-400 bg-purple-500/10' :
                'text-white/80 bg-white/10'
              }`}
            >
              {contentStrategyService.getPriorityTagLabel(cluster.priority_tag)}
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs text-white/80 border-white/20 bg-white/10"
            >
              {cluster.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Traffic Estimation */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <div>
            <div className="text-sm font-medium text-white/80">Estimated Monthly Traffic</div>
            <div className="text-2xl font-bold text-white">
              {cluster.estimated_traffic.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Suggested Assets */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2 text-white/80">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            Recommended Content Assets
          </div>
          <div className="grid grid-cols-2 gap-2">
              {Object.entries(cluster.suggested_assets).map(([type, count]) => (
                <div key={type} className="flex justify-between text-xs p-2 bg-white/10 rounded border border-white/20">
                  <span className="capitalize text-white/80">{type}:</span>
                  <span className="font-medium text-white">{count as number}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Calendar className="h-4 w-4 text-orange-400" />
          <span>Suggested Timeline: {cluster.timeframe_weeks} weeks</span>
        </div>

        {/* Solution Mapping */}
        {cluster.solution_mapping.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2 text-white/80">
              <Target className="h-4 w-4 text-purple-400" />
              Mapped Solutions
            </div>
            <div className="flex flex-wrap gap-1">
              {cluster.solution_mapping.slice(0, 3).map((solution, index) => (
                <Badge key={index} variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                  {solution}
                </Badge>
              ))}
              {cluster.solution_mapping.length > 3 && (
                <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                  +{cluster.solution_mapping.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/20">
          <Button
            onClick={() => sendToContentBuilder(cluster)}
            size="sm"
            className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
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
              className="border-white/20 text-white/80 hover:bg-white/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteCluster(cluster.id)}
                className="border-red-400/30 text-red-400 hover:bg-red-500/10"
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
        
        <Button
          onClick={generateBlueprint}
          disabled={generating}
          className="gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          {generating ? 'Generating...' : 'Generate Strategy'}
        </Button>
      </div>

      {/* Strategy Session Manager */}
      <StrategySessionManager 
        onStrategyGenerated={setProposals} 
        goals={goals}
      />

      {/* Strategy Proposals or Clusters Display */}
      {/* Strategy Overview */}
      {(clusters.length > 0 || proposals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {proposals.length > 0 ? 'Strategy Proposals' : 'Content Clusters'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {proposals.length > 0 ? proposals.length : clusters.length}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Available options
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {proposals.length > 0 ? 'Est. Monthly Impressions' : 'Est. Monthly Traffic'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {proposals.length > 0 
                    ? proposals.reduce((sum, p) => {
                        const primaryKw = p.primary_keyword;
                        const metrics = p.serp_data?.[primaryKw] || {};
                        const est = p.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
                        return sum + est;
                      }, 0).toLocaleString()
                    : clusters.reduce((sum, c) => sum + c.estimated_traffic, 0).toLocaleString()
                  }
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Potential reach
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {proposals.length > 0 ? 'Related Keywords' : 'Suggested Assets'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {proposals.length > 0 
                    ? proposals.reduce((sum, p) => sum + (p.related_keywords?.length || 0), 0)
                    : clusters.reduce((sum, c) => sum + Object.values(c.suggested_assets).reduce((a: number, b: number) => a + b, 0), 0)
                  }
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Total opportunities
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {proposals.length > 0 ? 'Quick Wins' : 'Avg Timeline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {proposals.length > 0 
                    ? proposals.filter(p => p.priority_tag === 'quick_win').length
                    : `${Math.round(clusters.reduce((sum, c) => sum + c.timeframe_weeks, 0) / Math.max(clusters.length, 1))}w`
                  }
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {proposals.length > 0 ? 'High-impact options' : 'Average duration'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Content Clusters or Proposals */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Content Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                {proposals.length > 0 ? 'All Proposals' : 'All Clusters'}
              </TabsTrigger>
              <TabsTrigger 
                value="quick_win"
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 text-white/70"
              >
                Quick Wins
              </TabsTrigger>
              <TabsTrigger 
                value="high_return"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/70"
              >
                High Return
              </TabsTrigger>
              <TabsTrigger 
                value="evergreen"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70"
              >
                Evergreen
              </TabsTrigger>
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
            ) : proposals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map((proposal, idx) => (
                  <ProposalCard 
                    key={proposal.primary_keyword || idx}
                    proposal={proposal}
                    onSendToBuilder={sendProposalToContentBuilder}
                  />
                ))}
              </div>
            ) : clusters.length === 0 ? (
              <div className="p-12 text-center">
                <div className="space-y-4">
                  <Lightbulb className="h-12 w-12 text-white/40 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">No Content Clusters Yet</h3>
                    <p className="text-white/60">
                      Generate your first AI strategy to get started
                    </p>
                  </div>
                  <Button onClick={generateBlueprint} disabled={generating}>
                    {generating ? 'Generating...' : 'Generate AI Strategy'}
                  </Button>
                </div>
              </div>
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
                {proposals.length > 0 ? (
                  proposals
                    .filter((proposal) => (proposal.priority_tag || 'evergreen') === tag)
                    .map((proposal, idx) => (
                      <ProposalCard 
                        key={proposal.primary_keyword || idx}
                        proposal={proposal}
                        onSendToBuilder={sendProposalToContentBuilder}
                      />
                    ))
                ) : (
                  clusters
                    .filter((cluster) => cluster.priority_tag === tag)
                    .map((cluster) => (
                      <ClusterCard key={cluster.id} cluster={cluster} />
                    ))
                )}
              </div>
              {(proposals.length > 0 
                ? proposals.filter((proposal) => (proposal.priority_tag || 'evergreen') === tag).length === 0
                : clusters.filter((cluster) => cluster.priority_tag === tag).length === 0
              ) && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No {tag.replace('_', ' ')} {proposals.length > 0 ? 'proposals' : 'clusters'} found
                  </p>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
        </CardContent>
      </Card>
      <StrategyGenerationModal open={showGenModal} steps={genSteps} onCancel={() => { if (!generating) setShowGenModal(false); }} />
      <StrategyBuilderDialog 
        open={showStrategyBuilder} 
        onOpenChange={setShowStrategyBuilder}
        proposal={selectedProposal}
      />
    </div>
  );
}