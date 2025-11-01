import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Send, TrendingUp, Calendar, Target, BarChart3, Lightbulb, Trash2, Eye, FileText, AlertCircle, TreePine, Filter, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentStrategyService, ContentCluster } from '@/services/contentStrategyService';
import { aiStrategyService } from '@/services/aiStrategyService';
import { useToast } from '@/hooks/use-toast';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { StrategyGenerationModal, GenerationStep } from './StrategyGenerationModal';
import { StrategyBuilderDialog } from './StrategyBuilderDialog';
import { ProposalCard } from './ProposalCard';
import { ConsolidatedFilterDialog } from './ConsolidatedFilterDialog';
import { ViewToggle, ViewMode } from './ViewToggle';
import { ProposalRowView } from './ProposalRowView';
import { useConsolidatedFilters } from '@/hooks/useConsolidatedFilters';
import { proposalKeywordSync } from '@/services/proposalKeywordSync';
import { smartCalendarScheduling } from '@/services/smartCalendarScheduling';
import { SolutionSelectionModal } from './SolutionSelectionModal';

import { supabase } from '@/integrations/supabase/client';
import { contentCompletionTracking } from '@/services/contentCompletionTracking';
import { useDueContentNotifications } from '@/hooks/useDueContentNotifications';
import { ContentClustersSummary } from './ContentClustersSummary';

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
  const navigate = useNavigate();
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
  
  // New consolidated filtering and view state
  const [viewMode, setViewMode] = useState<ViewMode>('tiles');
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
  const [loading, setLoading] = useState(false);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('');
  
  // Consolidated filtering
  const {
    filters,
    setFilters,
    filteredProposals,
    statusCounts,
    categoryCounts,
    hasActiveFilters,
    clearAllFilters
  } = useConsolidatedFilters(allProposals);
  
  // Calculate paginated proposals
  const paginatedProposals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProposals.slice(startIndex, endIndex);
  }, [filteredProposals, currentPage, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Strategy Builder Dialog state
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  // Solution selection modal state
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState<string[]>([]);

  // Track newly generated proposals with timestamps
  const [newProposalIds, setNewProposalIds] = useState<Set<string>>(new Set());
  const [newProposalTimestamps, setNewProposalTimestamps] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Initialize due content notifications
  useDueContentNotifications();

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

  // Calculate selection metrics using filteredProposals
  const targetCount = parseInt(goals?.contentPieces) || 0;
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const targetTraffic = parseInt(goals?.monthlyTraffic) || 0;
  const estimatedTraffic = filteredProposals.filter((_, index) => selected[index]).reduce((sum, proposal) => {
    const primaryKw = proposal.primary_keyword;
    const metrics = proposal.serp_data?.[primaryKw] || {};
    const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
    return sum + est;
  }, 0);

  const handleSelectAllProposals = () => {
    const newSelected = filteredProposals.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelected(newSelected);
    setSelectedProposals(newSelected);
  };

  const handleScheduleSelected = async () => {
    const selectedProposalsList = filteredProposals.filter((_, index) => selected[index]);
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

  const handleDeleteSelected = async () => {
    const selectedProposalsList = filteredProposals.filter((_, index) => selected[index]);
    if (selectedProposalsList.length === 0) {
      return;
    }

    const proposalIds = selectedProposalsList
      .map(p => p.id)
      .filter(Boolean);

    if (proposalIds.length === 0) {
      toast({
        title: "Cannot Delete",
        description: "Selected proposals don't have valid IDs.",
        variant: "destructive"
      });
      return;
    }

    try {
      await aiStrategyService.bulkDeleteProposals(proposalIds);
      
      // Update state
      setAllProposals(prev => prev.filter(p => !proposalIds.includes(p.id)));
      setHistoricalProposals(prev => prev.filter(p => !proposalIds.includes(p.id)));
      setSelected({});
      setSelectedProposals({});

      toast({
        title: "Proposals Deleted",
        description: `Successfully deleted ${proposalIds.length} proposal${proposalIds.length > 1 ? 's' : ''}.`
      });
    } catch (error) {
      console.error('Error deleting proposals:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete proposals. Please try again.",
        variant: "destructive"
      });
    }
  };

  const checkSolutionsBeforeGenerate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id')
      .eq('user_id', user.id);
    
    if (!solutions || solutions.length === 0) {
      toast({
        title: "No Solutions Found",
        description: "Please add at least one solution before generating proposals.",
        variant: "destructive"
      });
      return;
    }
    
    if (solutions.length === 1) {
      // Auto-select single solution and generate directly
      setSelectedSolutionIds([solutions[0].id]);
      await handleSolutionSelectionComplete([solutions[0].id]);
    } else {
      // Show modal for multiple solutions
      setShowSolutionModal(true);
    }
  };

  const handleSolutionSelectionComplete = async (solutionIds: string[]) => {
    try {
      setGenerating(true);
      setShowSolutionModal(false);
      startProgress();
      
      // Use the same edge function as "Generate AI Proposals" with selected solutions
      const result = await contentStrategyService.generateAIStrategy({
        goals: {
          monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
          contentPieces: 6,
          timeline: goals.timeline || '3 months',
          mainKeyword: goals.mainKeyword || ''
        },
        location: 'United States',
        excludeKeywords: [],
        selectedSolutionIds: solutionIds
      });

      // Reload historical proposals to get the newly saved proposals
      await loadHistoricalProposals();

      const newProposals = result.proposals || [];
      
      // Mark new proposals for highlighting
      const newIds = new Set(newProposals.map(p => p.id || p.title.toLowerCase().replace(/\s+/g, '-')));
      setNewProposalIds(newIds);
      
      // Set timestamps for fade-out animation
      const timestamps: Record<string, number> = {};
      newProposals.forEach(p => {
        const id = p.id || p.title.toLowerCase().replace(/\s+/g, '-');
        timestamps[id] = Date.now();
      });
      setNewProposalTimestamps(timestamps);
      
      toast({
        title: `${newProposals.length} New Proposals Generated`,
        description: solutionIds.length > 1 
          ? `Generated for ${solutionIds.length} selected solutions` 
          : result.message
      });

      // Remove "new" highlighting after 10 seconds
      setTimeout(() => {
        setNewProposalIds(new Set());
        setNewProposalTimestamps({});
      }, 10000);
    } catch (error) {
      console.error('Error generating more proposals:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate more proposals. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
      setShowGenModal(false);
    }
  };

  const handleGenerateMore = async () => {
    if (!goals?.monthlyTraffic) {
      toast({
        title: "Set Your Traffic Goal First",
        description: "Please set your monthly traffic goal before generating proposals.",
        variant: "destructive"
      });
      return;
    }

    await checkSolutionsBeforeGenerate();
  };

  // Generation modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genSteps, setGenSteps] = useState<GenerationStep[]>([
    { label: 'Preparing company and market context', status: 'pending' },
    { label: 'Generating candidate keywords (AI)', status: 'pending' },
    { label: 'Fetching SERP metrics', status: 'pending' },
    { label: 'Assembling strategy proposals (AI)', status: 'pending' },
    { label: 'Finalizing', status: 'pending' }
  ]);

  const timersRef = useRef<number[]>([]);

  const startProgress = () => {
    setShowGenModal(true);
    setGenSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i === 0 ? 'active' : 'pending'
    })));
    // ... rest of progress logic
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
      // Auto-fix providers before generating
      const { fixEmptyProviderModels } = await import('@/utils/fixAiProviders');
      await fixEmptyProviderModels();
      
      // Check for active AI provider before starting
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to generate strategies.",
          variant: "destructive"
        });
        return;
      }
      
      const { data: activeProvider, error: providerError } = await supabase
        .from('ai_service_providers')
        .select('provider, preferred_model, status, api_key, available_models')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .limit(1)
        .single();
      
      if (providerError || !activeProvider || !activeProvider.api_key) {
        toast({
          title: "No AI Provider Active",
          description: "Please activate an AI provider in Settings before generating strategies.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate provider has models configured
      const models = Array.isArray(activeProvider.available_models) ? activeProvider.available_models : [];
      if (models.length === 0) {
        toast({
          title: "Provider Configuration Error",
          description: `${activeProvider.provider} has no models configured. Please reconfigure in Settings.`,
          variant: "destructive"
        });
        return;
      }
      
      console.log(`🤖 Using active provider: ${activeProvider.provider} (${activeProvider.preferred_model})`);
      setActiveProvider(activeProvider.provider);
      
      setGenerating(true);
      startProgress();

      const result = await contentStrategyService.generateAIStrategy({
        goals: {
          monthlyTraffic: parseInt(goals.monthlyTraffic) || 10000,
          contentPieces: 6,
          timeline: goals.timeline || '3 months',
          mainKeyword: goals.mainKeyword || ''
        },
        location: 'United States',
        excludeKeywords: []
      });

      const generatedProposals = result.proposals || [];
      setProposals(generatedProposals);
      setAiProposals(generatedProposals);
      
      toast({
        title: `${generatedProposals.length} Strategy Proposals Ready`,
        description: `Generated ${generatedProposals.length} proposals using ${activeProvider.provider}`
      });
    } catch (error) {
      console.error('❌ Error generating AI strategy:', error);
      toast({
        title: 'Strategy Generation Failed',
        description: error.message || 'Failed to generate AI strategy. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
      setShowGenModal(false);
    }
  };

  // Load data on mount - load historical first to populate initial view
  useEffect(() => {
    const initData = async () => {
      // Check and run migration if needed (one-time, idempotent)
      const { proposalMigrationService } = await import('@/services/proposalMigrationService');
      try {
        const needsMigration = await proposalMigrationService.needsMigration();
        if (needsMigration) {
          console.log('🔄 Hidden proposals detected, running migration...');
          await proposalMigrationService.migrateHistoricalProposals();
        }
      } catch (migrationError) {
        console.error('Migration error (non-fatal):', migrationError);
      }
      
      await loadHistoricalProposals(); // Load historical first
      await loadClusters();
      await loadCompletedProposalIds();
    };
    initData();
  }, []);

  // Combine current and historical proposals
  useEffect(() => {
    const combined = [...(proposals || []), ...(historicalProposals || [])];
    const unique = combined.filter((proposal, index, arr) => 
      arr.findIndex(p => p.primary_keyword === proposal.primary_keyword && p.title === proposal.title) === index
    );
    const active = unique.filter(proposal => 
      !completedProposalIds.includes(proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-'))
    );
    setAllProposals(active);
  }, [proposals, historicalProposals, completedProposalIds]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const loadClusters = async () => {
    try {
      setLoading(true);
      const data = await contentStrategyService.getContentClusters();
      setClusters(data);
    } catch (error) {
      console.error('Error loading clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalProposals = async () => {
    try {
      setLoadingHistorical(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: proposalsData, error } = await supabase
        .from('ai_strategy_proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading historical proposals:', error);
        return;
      }

      const formattedProposals = (proposalsData || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        primary_keyword: item.primary_keyword,
        related_keywords: item.related_keywords || [],
        keywords: item.related_keywords || [],
        priority_tag: item.priority_tag,
        content_type: item.content_type,
        estimated_impressions: item.estimated_impressions,
        serp_data: item.serp_data || {},
        suggested_outline: item.content_suggestions || [],
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_historical: true
      }));
      
      setHistoricalProposals(formattedProposals);
    } catch (error) {
      console.error('Error loading historical proposals:', error);
    } finally {
      setLoadingHistorical(false);
    }
  };

  const loadCompletedProposalIds = async () => {
    try {
      const completedIds = await contentCompletionTracking.getCompletedProposalIds();
      setCompletedProposalIds(completedIds);
    } catch (error) {
      console.error('Error loading completed proposal IDs:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Content Clusters Summary */}
      {allProposals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ContentClustersSummary 
            totalProposals={allProposals.length}
            selectedCount={selectedCount}
            completedCount={completedProposalIds.length}
            estimatedTraffic={estimatedTraffic}
          />
        </motion.div>
      )}

      {/* Generate Button */}
      {allProposals.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Lightbulb className="h-16 w-16 mx-auto text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Ready to Generate Your Content Strategy?</h3>
                <p className="text-white/70 text-lg max-w-2xl mx-auto">
                  Let AI analyze your goals and create a comprehensive content strategy with keyword research, competitor analysis, and traffic projections.
                </p>
                <Button 
                  onClick={generateBlueprint}
                  disabled={generating}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 gap-2"
                >
                  <Target className="h-5 w-5" />
                  {generating ? 'Generating Strategy...' : 'Generate AI Strategy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Proposals with Consolidated Controls */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Proposals
            </div>
            {/* New Consolidated Toolbar */}
            {filteredProposals.length > 0 && (
              <div className="flex items-center gap-2">
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
                
                {/* Icon-only Filter button with tooltip */}
                <Button 
                  onClick={() => setShowFilterDialog(true)} 
                  variant="outline" 
                  size="sm" 
                  className="border-white/20 text-white/80 hover:bg-white/10 relative"
                  title="Filter proposals"
                >
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters() && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                      {filters.statuses.length + filters.categories.length + (filters.dateRange ? 1 : 0)}
                    </Badge>
                  )}
                </Button>

                {/* Delete button - only visible when items selected */}
                {selectedCount > 0 && (
                  <Button 
                    onClick={handleDeleteSelected}
                    variant="outline" 
                    size="sm" 
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 relative"
                    title="Delete selected proposals"
                  >
                    <Trash2 className="h-4 w-4" />
                    <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                      {selectedCount}
                    </Badge>
                  </Button>
                )}

                {/* Generate More button - visible when proposals exist */}
                {allProposals.length > 0 && (
                  <Button 
                    onClick={handleGenerateMore}
                    disabled={generating}
                    variant="outline" 
                    size="sm" 
                    className="border-primary/20 text-primary hover:bg-primary/10 gap-2"
                    title="Generate more proposals"
                  >
                    <Plus className="h-4 w-4" />
                    {generating ? 'Generating...' : 'Generate More'}
                  </Button>
                )}
                
                <Button onClick={handleSelectAllProposals} variant="outline" size="sm" className="border-white/20 text-white/80 hover:bg-white/10">
                  Select All
                </Button>
                <Button onClick={handleClearSelection} variant="outline" size="sm" className="border-white/20 text-white/80 hover:bg-white/10">
                  Clear
                </Button>
                {selectedCount > 0 && (
                  <Button onClick={handleScheduleSelected} size="sm" className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                    <Calendar className="h-4 w-4" />
                    Add to Calendar ({selectedCount})
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
          {filteredProposals.length > 0 && (
            <div className="text-sm text-white/60">
              {filteredProposals.length} proposals {hasActiveFilters() && `(of ${allProposals.length} total)`}
              {selectedCount > 0 && ` • ${selectedCount} selected • Est. Traffic: ${estimatedTraffic.toLocaleString()}`}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Main Content Display */}
          <div className="space-y-4 mt-4">
            {/* Render based on view mode */}
            {viewMode === 'tiles' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProposals.map((proposal, index) => {
                  const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  return (
                    <ProposalCard
                      key={proposal.id || actualIndex}
                      proposal={proposal}
                      index={actualIndex}
                      isSelected={selected[actualIndex] || false}
                      onSelectionChange={(idx, isSelected) => {
                        const newSelected = { ...selected, [idx]: isSelected };
                        setSelected(newSelected);
                        setSelectedProposals(newSelected);
                      }}
                      onSendToBuilder={(proposal) => {
                        setSelectedProposal(proposal);
                        setShowBuilderDialog(true);
                      }}
                      isNew={newProposalIds.has(proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-'))}
                    />
                  );
                })}
              </div>
            ) : (
              <ProposalRowView
                proposals={paginatedProposals}
                selected={selected}
                onToggleSelection={(index) => {
                  const actualIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  const newSelected = { ...selected, [actualIndex]: !selected[actualIndex] };
                  setSelected(newSelected);
                  setSelectedProposals(newSelected);
                }}
                onViewDetails={(proposal) => {
                  console.log('View details:', proposal);
                }}
                onSendToBuilder={(proposal) => {
                  setSelectedProposal(proposal);
                  setShowBuilderDialog(true);
                }}
                newProposalIds={newProposalIds}
              />
            )}
            
            {/* Pagination Controls */}
            {filteredProposals.length > ITEMS_PER_PAGE && (
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                {/* Info Text */}
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProposals.length)} of{' '}
                  {filteredProposals.length} proposals
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!hasPreviousPage}
                    className="gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-[40px] ${
                          currentPage === pageNum 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={!hasNextPage}
                    className="gap-2"
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consolidated Filter Dialog */}
      <ConsolidatedFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        filters={filters}
        onFiltersChange={setFilters}
        statusCounts={statusCounts}
        categoryCounts={{ ...categoryCounts, selected: selectedCount }}
      />

      {/* Generation and Builder Modals */}
      <StrategyGenerationModal 
        open={showGenModal} 
        steps={genSteps}
        onCancel={() => setShowGenModal(false)}
        activeProvider={activeProvider}
      />
      <StrategyBuilderDialog 
        open={showBuilderDialog}
        onOpenChange={(open) => {
          setShowBuilderDialog(open);
          if (!open) {
            setSelectedProposal(null);
          }
        }}
        proposal={selectedProposal}
      />
      <SolutionSelectionModal
        open={showSolutionModal}
        onOpenChange={setShowSolutionModal}
        onConfirm={handleSolutionSelectionComplete}
        isGenerating={generating}
      />
    </div>
  );
};