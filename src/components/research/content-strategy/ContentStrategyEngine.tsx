import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Send, TrendingUp, Calendar, Target, BarChart3, Lightbulb, Trash2, Eye, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentStrategyService, ContentCluster } from '@/services/contentStrategyService';
import { aiStrategyService } from '@/services/aiStrategyService';
import { useToast } from '@/hooks/use-toast';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyGenerationModal, GenerationStep } from './StrategyGenerationModal';
import { StrategyBuilderDialog } from './StrategyBuilderDialog';
import { ProposalCard } from './ProposalCard';
import { proposalKeywordSync } from '@/services/proposalKeywordSync';
import { smartCalendarScheduling } from '@/services/smartCalendarScheduling';

import { supabase } from '@/integrations/supabase/client';
import { contentCompletionTracking } from '@/services/contentCompletionTracking';
import { useContentReminders } from '@/hooks/useContentReminders';
import { ContentClustersSummary } from './ContentClustersSummary';

// Force rebuild to clear SelectedProposalsSidebar cache issue
interface ContentStrategyEngineProps {
  serpMetrics?: any;
  goals?: any;
  workflowMode?: 'estimated' | 'real';
  realAnalytics?: {
    metrics: any;
    contentAnalytics: any[];
    loading: boolean;
  };
}
export const ContentStrategyEngine = ({
  serpMetrics,
  goals,
  workflowMode = 'estimated',
  realAnalytics
}: ContentStrategyEngineProps) => {
  const ctx = useContentStrategy();
  const {
    aiProposals,
    setAiProposals,
    selectedProposals,
    setSelectedProposals
  } = ctx;
  const [clusters, setClusters] = useState<ContentCluster[]>([]);
  const [proposals, setProposals] = useState<any[]>(aiProposals || []);
  const [historicalProposals, setHistoricalProposals] = useState<any[]>([]);
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [completedProposalIds, setCompletedProposalIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>(selectedProposals || {});
  const [loading, setLoading] = useState(false);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Pagination states for each tab
  const [displayCounts, setDisplayCounts] = useState({
    all: 9,
    selected: 9,
    quick_win: 9,
    high_return: 9,
    evergreen: 9
  });
  const ITEMS_PER_PAGE = 9;

  // Track newly generated proposals with timestamps
  const [newProposalIds, setNewProposalIds] = useState<Set<string>>(new Set());
  const [newProposalTimestamps, setNewProposalTimestamps] = useState<Record<string, number>>({});
  const {
    toast
  } = useToast();

  // Initialize content reminders
  useContentReminders();

  // Sync with context and calculate metrics
  useEffect(() => {
    if (aiProposals && aiProposals.length > 0) {
      setProposals(aiProposals);
    }
  }, [aiProposals]);

  // Initialize selection state only if not already set
  useEffect(() => {
    if (selectedProposals && Object.keys(selected).length === 0) {
      setSelected(selectedProposals);
    }
  }, [selectedProposals]);

  // Calculate selection metrics using allProposals
  const targetCount = parseInt(goals?.contentPieces) || 0;
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const targetTraffic = parseInt(goals?.monthlyTraffic) || 0;
  const estimatedTraffic = allProposals.filter((_, index) => selected[index]).reduce((sum, proposal) => {
    const primaryKw = proposal.primary_keyword;
    const metrics = proposal.serp_data?.[primaryKw] || {};
    const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
    return sum + est;
  }, 0);
  const handleSelectAllProposals = () => {
    const newSelected = allProposals.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelected(newSelected);
    setSelectedProposals(newSelected);
  };
  const handleScheduleSelected = async () => {
    const selectedProposalsList = allProposals.filter((_, index) => selected[index]);
    if (selectedProposalsList.length === 0) {
      toast({
        title: "No Proposals Selected",
        description: "Please select at least one proposal to schedule.",
        variant: "destructive"
      });
      return;
    }
    try {
      const result = await smartCalendarScheduling.autoScheduleProposals(selectedProposalsList.map(proposal => ({
        id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-'),
        title: proposal.title,
        description: proposal.description,
        primary_keyword: proposal.primary_keyword,
        priority_tag: proposal.priority_tag,
        content_type: proposal.content_type,
        estimated_impressions: proposal.estimated_impressions
      })), {
        startDate: new Date(),
        timelineWeeks: 12,
        contentPiecesPerWeek: 2,
        avoidWeekends: true,
        spreadEvenly: true,
        priorityFirst: true
      });

      // Track scheduled proposals for completion monitoring
      if (result.scheduled > 0) {
        for (const proposal of selectedProposalsList) {
          const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
          try {
            // Since we don't have the exact calendar item ID from the result,
            // we'll track by searching for recent calendar items with this proposal data
            // This will be handled by the contentCompletionTracking service internally
            console.log('✅ Proposal scheduled for tracking:', proposalId);
          } catch (error) {
            console.error('Error tracking scheduled proposal:', error);
          }
        }
      }

      // Clear selections after scheduling
      if (result.scheduled > 0) {
        setSelected({});
        setSelectedProposals({});
      }
      toast({
        title: "Calendar Scheduling Complete",
        description: `Successfully scheduled ${result.scheduled} content pieces. ${result.errors > 0 ? `${result.errors} failed to schedule.` : ''}`,
        variant: result.scheduled > 0 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error scheduling to calendar:', error);
      toast({
        title: "Scheduling Failed",
        description: "Failed to schedule proposals to calendar. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleClearSelection = () => {
    setSelected({});
    setSelectedProposals({});
  };

  // Generation modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([{
    label: 'Preparing company and market context',
    status: 'pending'
  }, {
    label: 'Generating candidate keywords (AI)',
    status: 'pending'
  }, {
    label: 'Fetching SERP metrics',
    status: 'pending'
  }, {
    label: 'Assembling strategy proposals (AI)',
    status: 'pending'
  }, {
    label: 'Finalizing',
    status: 'pending'
  }]);
  const timersRef = useRef<number[]>([] as unknown as number[]);
  const startProgress = () => {
    setShowGenModal(true);
    setGenSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i === 0 ? 'active' : 'pending'
    })));
    const t1 = window.setTimeout(() => setGenSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i < 1 ? 'done' : i === 1 ? 'active' : 'pending'
    }))), 600);
    const t2 = window.setTimeout(() => setGenSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i < 2 ? 'done' : i === 2 ? 'active' : 'pending'
    }))), 1300);
    const t3 = window.setTimeout(() => setGenSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i < 3 ? 'done' : i === 3 ? 'active' : 'pending'
    }))), 2000);
    timersRef.current = [t1, t2, t3];
  };
  const clearTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [] as unknown as number[];
  };
  const finishProgress = () => {
    clearTimers();
    setGenSteps(prev => prev.map(s => ({
      ...s,
      status: 'done'
    })));
    window.setTimeout(() => setShowGenModal(false), 700);
  };
  useEffect(() => {
    loadClusters();
    loadHistoricalProposals();
    loadCompletedProposalIds();
  }, []);

  // Combine current and historical proposals, filtering out completed ones
  useEffect(() => {
    const combined = [...(proposals || []), ...(historicalProposals || [])];
    // Remove duplicates based on primary_keyword and title
    const unique = combined.filter((proposal, index, arr) => arr.findIndex(p => p.primary_keyword === proposal.primary_keyword && p.title === proposal.title) === index);

    // Filter out completed proposals
    const active = unique.filter(proposal => !completedProposalIds.includes(proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-')));
    setAllProposals(active);
  }, [proposals, historicalProposals, completedProposalIds]);

  // Cleanup old "new" flags periodically
  useEffect(() => {
    const interval = setInterval(cleanupOldNewFlags, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [newProposalIds, newProposalTimestamps]);
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
  const loadHistoricalProposals = async () => {
    try {
      setLoadingHistorical(true);
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all historical proposals from ai_strategy_proposals table
      const {
        data: proposalsData,
        error
      } = await supabase.from('ai_strategy_proposals').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error loading historical proposals:', error);
        return;
      }

      // Format proposals data for display
      const formattedProposals = (proposalsData || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        primary_keyword: item.primary_keyword,
        related_keywords: item.related_keywords || [],
        keywords: item.related_keywords || [],
        // Use related_keywords as keywords fallback
        priority_tag: item.priority_tag,
        content_type: item.content_type,
        estimated_impressions: item.estimated_impressions,
        serp_data: item.serp_data || {},
        suggested_outline: item.content_suggestions || [],
        // Use content_suggestions as outline fallback
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_historical: true
      }));
      setHistoricalProposals(formattedProposals);
      console.log(`✅ Loaded ${formattedProposals.length} historical proposals`);
    } catch (error) {
      console.error('Error loading historical proposals:', error);
    } finally {
      setLoadingHistorical(false);
    }
  };

  // Refresh completed proposal IDs when needed
  const refreshCompletedProposals = async () => {
    await loadCompletedProposalIds();
    toast({
      title: "Refreshed Content Status",
      description: "Updated content completion tracking"
    });
  };
  const loadCompletedProposalIds = async () => {
    try {
      const completedIds = await contentCompletionTracking.getCompletedProposalIds();
      setCompletedProposalIds(completedIds);
      console.log(`✅ Loaded ${completedIds.length} completed proposal IDs`);
    } catch (error) {
      console.error('Error loading completed proposal IDs:', error);
    }
  };
  const generateBlueprint = async () => {
    if (!goals?.monthlyTraffic) {
      toast({
        title: "Set Your Traffic Goal First",
        description: "Please set your monthly traffic goal before generating proposals.",
        variant: "destructive"
      });
      return;
    }
    try {
      setGenerating(true);
      startProgress();

      // Get keywords to exclude from previous proposals
      const {
        keywordDeduplicationService
      } = await import('@/services/keywordDeduplicationService');
      const excludeKeywords = await keywordDeduplicationService.getKeywordsToExclude();
      console.log('🔄 Excluding', excludeKeywords.length, 'previously used keywords');
      const result = await contentStrategyService.generateAIStrategy({
        goals: {
          monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
          contentPieces: 6,
          // Default batch size
          timeline: goals.timeline || '3 months',
          mainKeyword: goals.mainKeyword || ''
        },
        location: 'United States',
        excludeKeywords: excludeKeywords
      });

      // Take the generated proposals
      const generatedProposals = result.proposals || [];

      // Auto-save all keywords from proposals to library
      if (generatedProposals.length > 0) {
        try {
          console.log('🔄 Auto-saving keywords from proposals...');
          await proposalKeywordSync.autoSaveKeywordsFromProposals(generatedProposals);
        } catch (error) {
          console.error('⚠️ Error auto-saving keywords:', error);
          // Don't block the main flow for keyword saving errors
        }

        // Save proposals to history for future reference and ensure persistence
        try {
          console.log('📝 About to save proposals to history:', generatedProposals.length, 'proposals');
          
          // Save to ai_strategy_proposals table to ensure persistence
          await proposalKeywordSync.saveProposalsToHistory(generatedProposals);
          
          // Also ensure the proposals have proper IDs for tracking
          const proposalsWithIds = generatedProposals.map(proposal => ({
            ...proposal,
            id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
          }));
          
          // Update the local state with proper IDs
          setProposals(proposalsWithIds);
          setAiProposals(proposalsWithIds);
          
          console.log('✅ Successfully saved proposals to history with proper IDs');
        } catch (error) {
          console.error('❌ Error saving proposals to history:', error);
          // Don't block the main flow for history saving errors
          toast({
            title: "Warning",
            description: "Proposals generated but may not persist across sessions",
            variant: "default"
          });
        }
      }
      setProposals(generatedProposals);
      setAiProposals(generatedProposals);
      markProposalsAsNew(generatedProposals);
      toast({
        title: `${generatedProposals.length} Strategy Proposals Ready`,
        description: `Generated ${generatedProposals.length} proposals with auto-saved keywords to library`
      });
      finishProgress();
    } catch (error) {
      console.error('❌ Error generating AI strategy:', error);
      clearTimers();
      setShowGenModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI strategy';
      toast({
        title: 'Strategy Generation Failed',
        description: errorMessage.includes('API key') ? 'Please configure your OpenAI and SERP API keys in Settings' : errorMessage,
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Mark proposals as new when generated
  const markProposalsAsNew = (proposals: any[]) => {
    const timestamp = Date.now();
    const newIds = new Set(newProposalIds);
    const newTimestamps = { ...newProposalTimestamps };
    
    proposals.forEach(proposal => {
      const id = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
      newIds.add(id);
      newTimestamps[id] = timestamp;
    });
    
    setNewProposalIds(newIds);
    setNewProposalTimestamps(newTimestamps);
  };

  // Remove "new" status after 24 hours
  const cleanupOldNewFlags = () => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const newIds = new Set(newProposalIds);
    const newTimestamps = { ...newProposalTimestamps };
    
    Object.entries(newTimestamps).forEach(([id, timestamp]) => {
      if (now - timestamp > dayInMs) {
        newIds.delete(id);
        delete newTimestamps[id];
      }
    });
    
    setNewProposalIds(newIds);
    setNewProposalTimestamps(newTimestamps);
  };

  // Check if proposal is new
  const isProposalNew = (proposal: any) => {
    const id = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
    return newProposalIds.has(id);
  };
  const showMoreProposals = (tabType: string) => {
    setDisplayCounts(prev => ({
      ...prev,
      [tabType]: prev[tabType] + ITEMS_PER_PAGE
    }));
  };

  // Get filtered proposals for each tab
  const getFilteredProposals = (tabType: string) => {
    switch (tabType) {
      case 'selected':
        return allProposals.filter((_, idx) => selected[idx]);
      case 'quick_win':
        return allProposals.filter(proposal => (proposal.priority_tag || 'evergreen') === 'quick_win');
      case 'high_return':
        return allProposals.filter(proposal => (proposal.priority_tag || 'evergreen') === 'high_return');
      case 'evergreen':
        return allProposals.filter(proposal => (proposal.priority_tag || 'evergreen') === 'evergreen');
      default:
        return allProposals;
    }
  };

  // Get paginated proposals for display
  const getPaginatedProposals = (tabType: string) => {
    const filtered = getFilteredProposals(tabType);
    return filtered.slice(0, displayCounts[tabType]);
  };

  // Check if "Show More" button should be displayed
  const hasMoreProposals = (tabType: string) => {
    const filtered = getFilteredProposals(tabType);
    return filtered.length > displayCounts[tabType];
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
      toast({
        title: 'Sent to Content Builder',
        description: `${cluster.name} has been routed to Content Builder`
      });
      window.location.href = result.redirect_url;
    } catch (error) {
      console.error('Error sending to content builder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send to Content Builder',
        variant: 'destructive'
      });
    }
  };
  const updateStatus = async (clusterId: string, status: string) => {
    try {
      await contentStrategyService.updateClusterStatus(clusterId, status);
      setClusters(prev => prev.map(cluster => cluster.id === clusterId ? {
        ...cluster,
        status: status as any
      } : cluster));
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
  const ClusterCard = ({
    cluster
  }: {
    cluster: ContentCluster;
  }) => <Card className="relative overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-white">{cluster.name}</CardTitle>
            <CardDescription className="text-sm text-white/60">
              {cluster.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-xs border-white/20 ${cluster.priority_tag === 'quick_win' ? 'text-green-400 bg-green-500/10' : cluster.priority_tag === 'high_return' ? 'text-blue-400 bg-blue-500/10' : cluster.priority_tag === 'evergreen' ? 'text-purple-400 bg-purple-500/10' : 'text-white/80 bg-white/10'}`}>
              {contentStrategyService.getPriorityTagLabel(cluster.priority_tag)}
            </Badge>
            <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
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
              {Object.entries(cluster.suggested_assets).map(([type, count]) => <div key={type} className="flex justify-between text-xs p-2 bg-white/10 rounded border border-white/20">
                  <span className="capitalize text-white/80">{type}:</span>
                  <span className="font-medium text-white">{count as number}</span>
                </div>)}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Calendar className="h-4 w-4 text-orange-400" />
          <span>Suggested Timeline: {cluster.timeframe_weeks} weeks</span>
        </div>

        {/* Solution Mapping */}
        {cluster.solution_mapping.length > 0 && <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2 text-white/80">
              <Target className="h-4 w-4 text-purple-400" />
              Mapped Solutions
            </div>
            <div className="flex flex-wrap gap-1">
              {cluster.solution_mapping.slice(0, 3).map((solution, index) => <Badge key={index} variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                  {solution}
                </Badge>)}
              {cluster.solution_mapping.length > 3 && <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                  +{cluster.solution_mapping.length - 3} more
                </Badge>}
            </div>
          </div>}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/20">
          <Button onClick={() => sendToContentBuilder(cluster)} size="sm" className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
            <Send className="h-4 w-4" />
            Send to Builder
          </Button>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => {
            const nextStatus = cluster.status === 'new' ? 'in_progress' : cluster.status === 'in_progress' ? 'published' : 'new';
            updateStatus(cluster.id, nextStatus);
          }} className="border-white/20 text-white/80 hover:bg-white/10">
              <Eye className="h-4 w-4" />
            </Button>
            
              <Button variant="outline" size="sm" onClick={() => deleteCluster(cluster.id)} className="border-red-400/30 text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
  return <div className="space-y-6">
      {/* No Goals Warning */}
      {!goals?.contentPieces && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-6">
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
        </motion.div>}

      {/* Selection Summary & Actions */}
      {allProposals.length > 0 && <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-white">
                    <div className="text-lg font-semibold">Content Clusters</div>
                    <div className="text-sm text-white/60">
                      {allProposals.length} active proposals • {selectedCount} selected 
                      {completedProposalIds.length > 0 && ` • ${completedProposalIds.length} completed`}
                    </div>
                  </div>
                  {selectedCount > 0 && <div className="flex items-center gap-2 text-sm">
                      <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                        Est. Traffic: {estimatedTraffic.toLocaleString()}
                      </Badge>
                    </div>}
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={refreshCompletedProposals} variant="outline" size="sm" className="border-white/20 text-white/80 hover:bg-white/10" title="Refresh completion status">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSelectAllProposals} variant="outline" size="sm" className="border-white/20 text-white/80 hover:bg-white/10">
                    Select All
                  </Button>
                  <Button onClick={handleClearSelection} variant="outline" size="sm" className="border-white/20 text-white/80 hover:bg-white/10">
                    Clear
                  </Button>
                  {selectedCount > 0 && <Button onClick={handleScheduleSelected} className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                      <Calendar className="h-4 w-4" />
                      Add to Calendar ({selectedCount})
                    </Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>}

      {/* Content Clusters Summary */}
      {allProposals.length > 0 && <ContentClustersSummary totalProposals={allProposals.length + completedProposalIds.length} selectedCount={selectedCount} completedCount={completedProposalIds.length} estimatedTraffic={estimatedTraffic} />}

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
          
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.2
        }}>
            <Button onClick={generateBlueprint} disabled={generating} className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg px-6 py-3 text-base" size="lg">
              <Lightbulb className="h-5 w-5" />
              {generating ? 'Generating Strategy...' : 'Generate AI Strategy'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content Clusters Grid - Show ALL proposals as tiles */}
      {allProposals.length > 0 && <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">All Content Clusters</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-white/80 border-white/20">
                {allProposals.length} proposals
              </Badge>
              {loadingHistorical && <RefreshCw className="h-4 w-4 text-white/60 animate-spin" />}
            </div>
          </div>
          
          
        </div>}

      {/* Strategy Proposals or Clusters Display */}
      {/* Strategy Overview */}
      {(clusters.length > 0 || proposals.length > 0) && <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
            <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {proposals.length > 0 ? 'Strategy Proposals' : 'Content Clusters'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-white">
                   {allProposals.length > 0 ? allProposals.length : clusters.length}
                 </div>
                 <p className="text-xs text-white/60 mt-1">
                   Available content clusters
                 </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }}>
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {proposals.length > 0 ? 'Est. Monthly Impressions' : 'Est. Monthly Traffic'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-bold text-white">
                   {allProposals.length > 0 ? allProposals.reduce((sum, p) => {
                const primaryKw = p.primary_keyword;
                const metrics = p.serp_data?.[primaryKw] || {};
                const est = p.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
                return sum + est;
              }, 0).toLocaleString() : clusters.reduce((sum, c) => sum + c.estimated_traffic, 0).toLocaleString()}
                 </div>
                <p className="text-xs text-white/60 mt-1">
                  Potential reach
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {proposals.length > 0 ? 'Related Keywords' : 'Suggested Assets'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {proposals.length > 0 ? proposals.reduce((sum, p) => sum + (p.related_keywords?.length || 0), 0) : clusters.reduce((sum, c) => sum + Object.values(c.suggested_assets).reduce((a: number, b: number) => a + b, 0), 0)}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  Total opportunities
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }}>
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {proposals.length > 0 ? 'Quick Wins' : 'Avg Timeline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {proposals.length > 0 ? proposals.filter(p => p.priority_tag === 'quick_win').length : `${Math.round(clusters.reduce((sum, c) => sum + c.timeframe_weeks, 0) / Math.max(clusters.length, 1))}w`}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {proposals.length > 0 ? 'High-impact options' : 'Average duration'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>}

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
              <TabsTrigger value="all" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
                {proposals.length > 0 ? 'All Proposals' : 'All Clusters'}
              </TabsTrigger>
              <TabsTrigger value="selected" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300 text-white/70">
                Selected ({Object.values(selected).filter(Boolean).length})
              </TabsTrigger>
              <TabsTrigger value="quick_win" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 text-white/70">
                Quick Wins ({getFilteredProposals('quick_win').length})
              </TabsTrigger>
              <TabsTrigger value="high_return" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/70">
                High Return ({getFilteredProposals('high_return').length})
              </TabsTrigger>
              <TabsTrigger value="evergreen" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-white/70">
                Evergreen ({getFilteredProposals('evergreen').length})
              </TabsTrigger>
            </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <motion.div key={i} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: i * 0.1
              }}>
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
                  </motion.div>)}
              </div> : allProposals.length > 0 ? <>
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} transition={{
                staggerChildren: 0.1
              }}>
                  {getPaginatedProposals('all').map((proposal, idx) => {
                    const originalIndex = allProposals.findIndex(p => p.primary_keyword === proposal.primary_keyword);
                    return (
                      <motion.div key={proposal.primary_keyword || idx} initial={{
                        opacity: 0,
                        y: 20
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: idx * 0.1
                      }}>
                        <ProposalCard 
                          proposal={proposal} 
                          index={originalIndex} 
                          isSelected={selected[originalIndex] || false} 
                          onSelectionChange={(index, isSelected) => {
                            const newSelected = { ...selected, [index]: isSelected };
                            setSelected(newSelected);
                            setTimeout(() => setSelectedProposals(newSelected), 50);
                          }} 
                          onSendToBuilder={sendProposalToContentBuilder}
                          isNew={isProposalNew(proposal)}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                {/* Show More Button */}
                {hasMoreProposals('all') && (
                  <motion.div initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: 0.3
                  }} className="flex justify-center mt-8">
                    <Button 
                      onClick={() => showMoreProposals('all')} 
                      variant="outline" 
                      className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-3"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Show More ({getFilteredProposals('all').length - displayCounts.all} remaining)
                    </Button>
                  </motion.div>
                )}
              </> : clusters.length === 0 ? <div className="p-12 text-center">
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
              </div> : <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              staggerChildren: 0.1
            }}>
                {clusters.map((cluster, idx) => <motion.div key={cluster.id} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: idx * 0.1
              }}>
                    <ClusterCard cluster={cluster} />
                  </motion.div>)}
              </motion.div>}
          </TabsContent>

          <TabsContent value="selected" className="space-y-4">
            {Object.values(selected).filter(Boolean).length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedProposals('selected').map((proposal, filteredIdx) => {
                    const originalIndex = allProposals.findIndex(p => p.primary_keyword === proposal.primary_keyword);
                    return (
                      <ProposalCard 
                        key={proposal.primary_keyword || filteredIdx} 
                        proposal={proposal} 
                        index={originalIndex} 
                        isSelected={true} 
                        onSelectionChange={(index, isSelected) => {
                          const newSelected = { ...selected, [index]: isSelected };
                          setSelected(newSelected);
                          setTimeout(() => setSelectedProposals(newSelected), 50);
                        }} 
                        onSendToBuilder={sendProposalToContentBuilder}
                        isNew={isProposalNew(proposal)}
                      />
                    );
                  })}
                </div>
                
                {/* Show More Button for Selected */}
                {hasMoreProposals('selected') && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={() => showMoreProposals('selected')} 
                      variant="outline" 
                      className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-3"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Show More ({getFilteredProposals('selected').length - displayCounts.selected} remaining)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No proposals selected yet. Go to other tabs to select proposals.
                </p>
              </Card>
            )}
          </TabsContent>

          {['quick_win', 'high_return', 'evergreen'].map(tag => (
            <TabsContent key={tag} value={tag} className="space-y-4">
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedProposals(tag).map((proposal, idx) => {
                    const originalIndex = allProposals.findIndex(p => p.primary_keyword === proposal.primary_keyword);
                    return (
                      <ProposalCard 
                        key={proposal.primary_keyword || idx} 
                        proposal={proposal} 
                        index={originalIndex} 
                        isSelected={selected[originalIndex] || false} 
                        onSelectionChange={(index, isSelected) => {
                          const newSelected = { ...selected, [index]: isSelected };
                          setSelected(newSelected);
                          setTimeout(() => setSelectedProposals(newSelected), 50);
                        }} 
                        onSendToBuilder={sendProposalToContentBuilder}
                        isNew={isProposalNew(proposal)}
                      />
                    );
                  })}
                </div>
                
                {/* Show More Button for Priority Tabs */}
                {hasMoreProposals(tag) && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={() => showMoreProposals(tag)} 
                      variant="outline" 
                      className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 px-8 py-3"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Show More ({getFilteredProposals(tag).length - displayCounts[tag]} remaining)
                    </Button>
                  </div>
                )}
                
                {getFilteredProposals(tag).length === 0 && (
                  <Card className="p-8 text-center bg-white/5 border-white/20">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {tag === 'quick_win' && <Target className="h-12 w-12 text-green-400/40" />}
                        {tag === 'high_return' && <TrendingUp className="h-12 w-12 text-blue-400/40" />}
                        {tag === 'evergreen' && <BarChart3 className="h-12 w-12 text-purple-400/40" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {tag === 'quick_win' && 'No Quick Wins Found'}
                          {tag === 'high_return' && 'No High Return Opportunities'}
                          {tag === 'evergreen' && 'No Evergreen Content'}
                        </h3>
                        <p className="text-white/60 text-sm max-w-md mx-auto">
                          {tag === 'quick_win' && 'No low-competition, high-opportunity keywords found. Try generating more proposals or adjusting your strategy.'}
                          {tag === 'high_return' && 'No high-volume opportunities identified. Consider broadening your keyword targets or generating more proposals.'}
                          {tag === 'evergreen' && 'No steady, long-term content opportunities found. Generate more proposals to find consistent performers.'}
                        </p>
                      </div>
                      <Button 
                        onClick={generateBlueprint} 
                        disabled={generating}
                        variant="outline" 
                        className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        {generating ? 'Generating...' : 'Generate More Proposals'}
                      </Button>
                    </div>
                  </Card>
                )}
              </>
            </TabsContent>
          ))}
        </Tabs>
        </CardContent>
      </Card>
      <StrategyGenerationModal open={showGenModal} steps={genSteps} onCancel={() => {
      if (!generating) setShowGenModal(false);
    }} />
      <StrategyBuilderDialog open={showStrategyBuilder} onOpenChange={setShowStrategyBuilder} proposal={selectedProposal} />

    </div>;
};