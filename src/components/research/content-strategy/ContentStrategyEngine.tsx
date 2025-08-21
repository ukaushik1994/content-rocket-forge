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
  FileText,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { contentStrategyService, ContentCluster } from '@/services/contentStrategyService';
import { aiStrategyService } from '@/services/aiStrategyService';
import { useToast } from '@/hooks/use-toast';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyGenerationModal, GenerationStep } from './StrategyGenerationModal';
import { StrategySessionManager } from './StrategySessionManager';
import { StrategyBuilderDialog } from './StrategyBuilderDialog';
import { ProposalCard } from './ProposalCard';
import { ProposalSelectionTracker } from './ProposalSelectionTracker';

interface ContentStrategyEngineProps {
  serpMetrics?: any;
  goals?: any;
}

export const ContentStrategyEngine = ({ serpMetrics, goals }: ContentStrategyEngineProps) => {
  const ctx = useContentStrategy();
  const { aiProposals, setAiProposals, selectedProposals, setSelectedProposals } = ctx;
  
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [proposals, setProposals] = useState<any[]>(aiProposals || []);
  const [selected, setSelected] = useState<Record<string, boolean>>(selectedProposals || {});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  // Sync with context and calculate metrics
  useEffect(() => {
    setProposals(aiProposals);
    setSelected(selectedProposals);
  }, [aiProposals, selectedProposals]);

  // Calculate selection metrics
  const targetCount = parseInt(goals?.contentPieces) || 0;
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const targetTraffic = parseInt(goals?.monthlyTraffic) || 0;
  const estimatedTraffic = proposals
    .filter((_, index) => selected[index])
    .reduce((sum, proposal) => {
      const primaryKw = proposal.primary_keyword;
      const metrics = proposal.serp_data?.[primaryKw] || {};
      const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
      return sum + est;
    }, 0);

  const handleSelectAllProposals = () => {
    const newSelected = proposals.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelected(newSelected);
    setSelectedProposals(newSelected);
  };

  const handleClearSelection = () => {
    setSelected({});
    setSelectedProposals({});
  };

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
  if (!goals?.contentPieces) {
    toast({
      title: "Set Your Goals First",
      description: "Please set your content goals in the Goal Setting section before generating proposals.",
      variant: "destructive"
    });
    return;
  }

  try {
    setGenerating(true);
    startProgress();
    
    const targetCount = parseInt(goals.contentPieces) || 5;
    const result = await contentStrategyService.generateAIStrategy({ 
      goals: {
        monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
        contentPieces: targetCount,
        timeline: goals.timeline || '3 months',
        mainKeyword: goals.mainKeyword || ''
      }, 
      location: 'United States' 
    });
    
    // Take exactly the number of proposals matching the goal
    const limitedProposals = result.proposals?.slice(0, targetCount) || [];
    setProposals(limitedProposals);
    setAiProposals(limitedProposals);
    
    toast({ 
      title: `${limitedProposals.length} Strategy Proposals Ready`, 
      description: `Generated ${limitedProposals.length} proposals to match your ${targetCount} content pieces goal.` 
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

const loadMoreProposals = async () => {
  console.log('🔄 Starting loadMoreProposals');
  
  if (!goals?.contentPieces) {
    console.warn('❌ No goals.contentPieces found');
    toast({
      title: "Goals Required",
      description: "Please set your content goals first to load more targeted proposals.",
      variant: "destructive"
    });
    return;
  }

  try {
    setLoadingMore(true);
    console.log('📊 Current state:', {
      currentProposalsCount: proposals.length,
      targetContentPieces: goals.contentPieces,
      goals: goals
    });
    
    const targetCount = parseInt(goals.contentPieces);
    const remainingNeeded = targetCount - proposals.length;
    
    if (remainingNeeded <= 0) {
      console.log('🎯 Goal already reached, generating extra proposals');
      toast({
        title: "Goal Reached!",
        description: `You already have ${proposals.length} proposals matching your ${targetCount} content pieces goal. Generate extra proposals?`,
      });
      // Still allow generating extra proposals beyond the goal
    }
    
    // Extract keywords from existing proposals to exclude them
    const existingKeywords = proposals.flatMap(proposal => {
      const keywords = [proposal.primary_keyword];
      if (proposal.related_keywords && Array.isArray(proposal.related_keywords)) {
        keywords.push(...proposal.related_keywords);
      }
      return keywords.filter(Boolean);
    });
    
    console.log('🔍 Excluding existing keywords:', existingKeywords.length);
    
    // Generate new proposals excluding existing keywords
    console.log('🤖 Calling aiStrategyService.generateNewStrategy...');
    const result = await aiStrategyService.generateNewStrategy({
      goals: {
        monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
        contentPieces: Math.max(remainingNeeded, 3), // Generate at least 3 more
        timeline: goals.timeline || '3 months',
        mainKeyword: goals.mainKeyword || ''
      },
      location: 'United States',
      excludeKeywords: existingKeywords
    });
    
    console.log('✅ Generated new strategy result:', {
      proposalCount: result.proposals?.length || 0,
      message: result.message
    });
    
    if (result.proposals && result.proposals.length > 0) {
      // Append new proposals to existing ones
      const updatedProposals = [...proposals, ...result.proposals];
      console.log('📈 Updating proposals:', {
        before: proposals.length,
        after: updatedProposals.length,
        new: result.proposals.length
      });
      
      setProposals(updatedProposals);
      setAiProposals(updatedProposals);
      
      toast({
        title: 'New Proposals Generated',
        description: `Found ${result.proposals.length} additional strategy proposals`
      });
    } else {
      console.warn('⚠️ No proposals returned from generateNewStrategy');
      toast({
        title: 'No New Proposals',
        description: 'No additional unique proposals could be generated at this time. Try adjusting your goals or clearing strategy history.',
        variant: 'default'
      });
    }
  } catch (error) {
    console.error('❌ Error in loadMoreProposals:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to load more proposals';
    
    // Enhanced error messaging
    let userFriendlyMessage = errorMessage;
    let title = 'Load More Failed';
    
    if (errorMessage.includes('API key')) {
      userFriendlyMessage = 'Please configure your OpenAI and SERP API keys in Settings';
      title = 'API Configuration Required';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      userFriendlyMessage = 'API rate limit reached. Please try again in a few minutes.';
      title = 'Rate Limit Reached';
    } else if (errorMessage.includes('All generated keywords have been used')) {
      userFriendlyMessage = 'All keywords have been used. Try different goals or clear your strategy history to generate fresh proposals.';
      title = 'No New Keywords Available';
    } else if (errorMessage.includes('Failed to generate final strategy')) {
      userFriendlyMessage = 'Strategy generation failed. Please check your API keys and try again.';
      title = 'Generation Failed';
    }
    
    toast({
      title,
      description: userFriendlyMessage,
      variant: 'destructive'
    });
  } finally {
    setLoadingMore(false);
    console.log('🏁 loadMoreProposals completed');
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
      {/* No Goals Warning */}
      {!goals?.contentPieces && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-yellow-500/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div>
                  <h3 className="text-yellow-400 font-medium">Set Your Goals First</h3>
                  <p className="text-yellow-400/80 text-sm">
                    Configure your content goals in the section above to generate targeted AI proposals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Proposal Selection Tracker */}
      {proposals.length > 0 && targetCount > 0 && (
        <ProposalSelectionTracker
          totalProposals={proposals.length}
          selectedCount={selectedCount}
          targetCount={targetCount}
          estimatedTraffic={estimatedTraffic}
          targetTraffic={targetTraffic}
          onSelectAll={handleSelectAllProposals}
          onClearSelection={handleClearSelection}
          onLoadMore={loadMoreProposals}
          loadingMore={loadingMore}
        />
      )}

      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 border border-white/10 p-6 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-xl" />
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Content Strategy Engine
            </h2>
            <p className="text-white/60 text-lg">
              AI-powered strategic content planning with competitive intelligence
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={generateBlueprint}
              disabled={generating}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-6 py-3 text-base"
              size="lg"
            >
              <Lightbulb className="h-5 w-5" />
              {generating ? 'Generating Strategy...' : 'Generate AI Strategy'}
            </Button>
          </motion.div>
        </div>
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-96 bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 bg-white/10 rounded"></div>
                          <div className="h-3 bg-white/10 rounded w-3/4"></div>
                          <div className="h-20 bg-white/10 rounded"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-white/10 rounded"></div>
                            <div className="h-3 bg-white/10 rounded w-2/3"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : proposals.length > 0 ? (
              <>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {proposals.map((proposal, idx) => (
                    <motion.div
                      key={proposal.primary_keyword || idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                       <ProposalCard 
                         proposal={proposal}
                         index={idx}
                         isSelected={selected[idx] || false}
                         onSelectionChange={(index, isSelected) => {
                           const newSelected = { ...selected, [index]: isSelected };
                           setSelected(newSelected);
                           setSelectedProposals(newSelected);
                         }}
                         onSendToBuilder={sendProposalToContentBuilder}
                       />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Load More Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center mt-8"
                >
                  <Button
                    onClick={loadMoreProposals}
                    disabled={loadingMore}
                    variant="outline"
                    className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-3"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingMore ? 'animate-spin' : ''}`} />
                    {loadingMore ? 'Finding New Proposals...' : 'Load More Proposals'}
                  </Button>
                </motion.div>
              </>
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
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {clusters.map((cluster, idx) => (
                  <motion.div
                    key={cluster.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ClusterCard cluster={cluster} />
                  </motion.div>
                ))}
              </motion.div>
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
                         index={proposals.findIndex(p => p.primary_keyword === proposal.primary_keyword)}
                         isSelected={selected[proposals.findIndex(p => p.primary_keyword === proposal.primary_keyword)] || false}
                         onSelectionChange={(index, isSelected) => {
                           const newSelected = { ...selected, [index]: isSelected };
                           setSelected(newSelected);
                           setSelectedProposals(newSelected);
                         }}
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