import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CampaignsHero } from '@/components/campaigns/CampaignsHero';
import { CampaignChatInterface } from '@/components/campaigns/CampaignChatInterface';
import { CampaignBreakdownView } from '@/components/campaigns/CampaignBreakdownView';
import { StrategyEditModal } from '@/components/campaigns/StrategyEditModal';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { AssetGenerationModal } from '@/components/campaigns/assets/AssetGenerationModal';
import { ContentGenerationPanel } from '@/components/campaigns/ContentGenerationPanel';
import { ContentGenerationProvider, useContentGeneration } from '@/contexts/ContentGenerationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/ui/PageContainer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignStrategies } from '@/hooks/useCampaignStrategies';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useCampaignContentGeneration } from '@/hooks/useCampaignContentGeneration';
import { CampaignStrategy, CampaignInput as CampaignInputType, CampaignStrategySummary } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { solutionService } from '@/services/solutionService';
import { campaignService, SavedCampaign } from '@/services/campaignService';
import { createCampaignAtomic } from '@/services/campaignTransactions';
import { campaignCleanupService } from '@/services/campaignCleanupService';
import { toast } from 'sonner';
import { ArrowLeft, Plus, AlertTriangle, Settings } from 'lucide-react';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Inner component that uses the context
const CampaignsInner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { generateStrategies, isGenerating } = useCampaignStrategies();
  const { campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns, deleteCampaign, updateCampaignName, updateCampaignStatus } = useCampaigns();
  const { generateAllContent } = useCampaignContentGeneration();
  const { openPanel } = useContentGeneration();
  
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [showInput, setShowInput] = useState(false);
  const [currentInput, setCurrentInput] = useState<CampaignInputType | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<CampaignStrategy | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<EnhancedSolution | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [hasAIProvider, setHasAIProvider] = useState<boolean | null>(null);
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns` : '/campaigns';

  // Check if AI provider is configured
  useEffect(() => {
    const checkAIProvider = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('ai_service_providers')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);
      setHasAIProvider(data && data.length > 0);
    };
    checkAIProvider();
  }, [user]);

  // Clean up duplicate campaigns on mount
  useEffect(() => {
    const cleanupDuplicates = async () => {
      if (!user) return;
      
      try {
        const result = await campaignCleanupService.removeDuplicates(user.id);
        if (result.removed > 0) {
          console.log(`Cleaned up ${result.removed} duplicate campaigns`);
          refetchCampaigns();
        }
      } catch (error) {
        console.error('Failed to cleanup duplicates:', error);
      }
    };
    
    cleanupDuplicates();
  }, [user, refetchCampaigns]);

  // Fetch solution when strategy is generated with a solution ID
  useEffect(() => {
    const fetchSolution = async () => {
      if (strategy && currentInput?.solutionId) {
        try {
          const solution = await solutionService.getSolutionById(currentInput.solutionId);
          setSelectedSolution(solution);
        } catch (error) {
          console.error('Failed to fetch solution:', error);
        }
      } else {
        setSelectedSolution(null);
      }
    };
    
    fetchSolution();
  }, [strategy, currentInput]);

  const handleGenerateStrategies = async (input: CampaignInputType, selectedSummary?: CampaignStrategySummary) => {
    if (!user) {
      toast.error('Please sign in to generate campaigns');
      return;
    }

    setCurrentInput(input);
    setStrategy(null);
    setViewMode('create');

    try {
      const { data: companyData } = await supabase
        .from('company_info')
        .select('name, description, industry')
        .eq('user_id', user.id)
        .single();

      const companyInfo = companyData ? {
        name: companyData.name,
        description: companyData.description,
        industry: companyData.industry,
      } : undefined;

      const strategies = await generateStrategies(input, user.id, selectedSummary);
      
      if (strategies && strategies.length > 0) {
        setStrategy(strategies[0]);
        setShowInput(false);
        
        // Create campaign immediately so campaignId is available
        try {
          const generateCampaignName = (idea: string) => {
            const words = idea.split(' ').slice(0, 5).join(' ');
            return words.length > 50 ? words.substring(0, 47) + '...' : words;
          };
          
          // Log briefs before saving for debugging
          console.log('📊 [Campaigns] Strategy briefs count:', strategies[0].contentBriefs?.length || 0);
          if (!strategies[0].contentBriefs?.length) {
            console.error('❌ [Campaigns] No content briefs in strategy - content generation will fail!');
          } else {
            console.log('✅ [Campaigns] Content briefs ready:', strategies[0].contentBriefs.map(b => b.title).slice(0, 3));
          }
          
          const campaign = await createCampaignAtomic(
            user.id,
            generateCampaignName(input.idea || ''),
            input.idea || '',
            input,
            strategies[0],
            input.solutionId,
            strategies[0].description
          );
          
          setCurrentCampaignId(campaign.id);
          console.log('✅ Campaign created immediately:', campaign.id, 'with', strategies[0].contentBriefs?.length || 0, 'briefs');
          toast.success('Campaign breakdown generated!');
          refetchCampaigns();
        } catch (campaignError) {
          console.error('Failed to create campaign:', campaignError);
          toast.error('Campaign generated but failed to save');
        }
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate campaign. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleRegenerate = async () => {
    if (!currentInput || !user) return;

    try {
      const { data: companyData } = await supabase
        .from('company_info')
        .select('name, description, industry')
        .eq('user_id', user.id)
        .single();

      const companyInfo = companyData ? {
        name: companyData.name,
        description: companyData.description,
        industry: companyData.industry,
      } : undefined;

      const strategies = await generateStrategies(currentInput, user.id);
      
      if (strategies && strategies.length > 0) {
        setStrategy(strategies[0]);
        toast.success('New campaign breakdown generated!');
      }
    } catch (error) {
      console.error('Error regenerating strategy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate campaign';
      toast.error(errorMessage);
    }
  };

  const handleEditStrategy = (strategy: CampaignStrategy) => {
    setEditingStrategy(strategy);
  };

  const handleSaveEditedStrategy = (updatedStrategy: CampaignStrategy) => {
    setStrategy(updatedStrategy);
    setEditingStrategy(null);
    toast.success('Strategy updated');
  };

  const handleGenerateAssets = async () => {
    if (!strategy || !user) return;
    
    if (!currentCampaignId) {
      setIsSaving(true);
      try {
        // Create campaign atomically if not exists
        const generateCampaignName = (idea: string) => {
          const words = idea.split(' ').slice(0, 5).join(' ');
          return words.length > 50 ? words.substring(0, 47) + '...' : words;
        };
        
        const campaign = await createCampaignAtomic(
          user.id,
          generateCampaignName(currentInput?.idea || ''),
          currentInput?.idea || '',
          currentInput || { idea: '' },
          strategy,
          currentInput?.solutionId,
          strategy.description // Use strategy description as objective
        );
        setCurrentCampaignId(campaign.id);
        refetchCampaigns();
      } catch (error) {
        console.error('Error saving campaign:', error);
        toast.error('Failed to save campaign');
        return;
      } finally {
        setIsSaving(false);
      }
    }
    
    setIsAssetModalOpen(true);
  };

  const handleStartGeneration = async (assetIds: string[]) => {
    if (!currentCampaignId || !strategy || !user) return;
    
    try {
      // 1. Get content briefs from strategy
      const allBriefs = strategy.contentBriefs || [];
      
      console.log(`🎯 [Generation] Starting with ${assetIds.length} assets`);
      console.log(`📋 [Generation] Available briefs: ${allBriefs.length}`);
      
      // 2. Build queue items from selected asset IDs
      const items = assetIds.map((assetId, index) => {
        // Parse assetId format: "campaignId-formatId-index"
        const parts = assetId.split('-');
        
        // Validate format - need at least campaignId-formatId-index
        if (parts.length < 3) {
          console.warn(`⚠️ Invalid asset ID format: ${assetId}`);
          return null;
        }
        
        const briefIndex = parseInt(parts[parts.length - 1], 10);
        const formatId = parts.slice(1, -1).join('-');
        
        // Validate parsed values
        if (isNaN(briefIndex)) {
          console.warn(`⚠️ Invalid brief index in asset ID: ${assetId}`);
          return null;
        }
        
        console.log(`🔍 [Generation] Asset ${index}: format=${formatId}, briefIndex=${briefIndex}`);
        
        // Find matching brief from strategy.contentBriefs
        const brief = allBriefs.find((b, i) => 
          ((b as any).formatId === formatId || (b as any).format === formatId) && i === briefIndex
        ) || allBriefs[briefIndex];
        
        if (!brief) {
          console.warn(`⚠️ No brief found for asset: ${assetId}, using fallback`);
        }
        
        return {
          brief: brief || { 
            title: `Content ${index + 1}`, 
            description: strategy.description || '', 
            keywords: [],
            metaTitle: `Content ${index + 1}`,
            metaDescription: strategy.description || '',
            targetWordCount: 1000,
            difficulty: 'medium' as const,
            serpOpportunity: 50
          },
          formatId: formatId || 'blog',
          index: briefIndex
        };
      }).filter(Boolean) as { brief: any; formatId: string; index: number }[];
      
      if (items.length === 0) {
        console.error('❌ No valid items to queue');
        toast.error('Failed to process assets - invalid format');
        return;
      }
      
      console.log(`✅ [Generation] Queuing ${items.length} valid items`);

      // 3. Get solution data if available
      let solutionData = null;
      if (currentInput?.solutionId) {
        const { data } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', currentInput.solutionId)
          .maybeSingle();
        solutionData = data;
      }

      // 4. Build campaign context
      const campaignContext = {
        title: strategy.title,
        description: strategy.description,
        targetAudience: strategy.targetAudience,
        goal: strategy.expectedEngagement
      };

      // 5. Call the queue-based generation system
      await generateAllContent(
        items,
        currentCampaignId,
        currentInput?.solutionId || null,
        campaignContext,
        solutionData,
        user.id
      );
      
      // 6. Update UI - close modal and open progress panel
      setIsAssetModalOpen(false);
      
      // Open the ContentGenerationPanel for real-time progress
      if (strategy && currentCampaignId) {
        openPanel(strategy, currentCampaignId);
      }
      
      toast.success(`Queued ${assetIds.length} assets for generation`);
      refetchCampaigns();
      
    } catch (error) {
      console.error('Error starting generation:', error);
      toast.error('Failed to start content generation');
    }
  };

  const handleViewCampaign = async (campaign: SavedCampaign) => {
    setViewMode('view');
    setCurrentCampaignId(campaign.id);
    setCurrentInput({
      idea: campaign.original_idea,
      targetAudience: campaign.target_audience,
      goal: campaign.goal as any,
      timeline: campaign.timeline as any,
    });
    setStrategy(campaign.selected_strategy);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setShowInput(false);
    setCurrentInput(null);
    setCurrentCampaignId(null);
    setStrategy(null);
  };

  const handleStartNewCampaign = () => {
    setViewMode('create');
    setShowInput(true);
    setStrategy(null);
    setCurrentInput(null);
    setCurrentCampaignId(null);
  };

  const handleStartConversation = (message: string, settings: {
    solutionId: string | null;
    platformPreferences: Record<string, number>;
  }) => {
    // Start a new campaign with the user's idea and settings
    setViewMode('create');
    setShowInput(true);
    setStrategy(null);
    setCurrentInput({
      idea: message,
      targetAudience: '',
      goal: undefined,
      timeline: undefined,
      solutionId: settings.solutionId,
      platformPreferences: settings.platformPreferences
    });
    setCurrentCampaignId(null);
    toast.success('Let\'s build your campaign!');
  };

  const handleExpressMode = async (data: { 
    idea: string; 
    audience: string; 
    timeline: string; 
    goal: string;
    solutionId: string | null;
    platformPreferences: Record<string, number>;
  }) => {
    if (!user) {
      toast.error('Please sign in to generate campaigns');
      return;
    }

    const input: CampaignInputType = {
      idea: data.idea,
      targetAudience: data.audience,
      goal: data.goal as any,
      timeline: data.timeline as any,
      useSerpData: true,
      solutionId: data.solutionId,
      platformPreferences: data.platformPreferences
    };

    setCurrentInput(input);
    setViewMode('create');
    setShowInput(false);
    
    toast.success('Generating strategies...');
    
    try {
      const strategies = await generateStrategies(input, user.id);
      
      if (strategies && strategies.length > 0) {
        setStrategy(strategies[0]);
        toast.success('Campaign strategies generated!');
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
      toast.error('Failed to generate campaign');
    }
  };

  const handleArchiveCampaign = async (campaignId: string) => {
    await updateCampaignStatus(campaignId, 'archived');
  };

  const handleCampaignCreated = (newCampaignId: string) => {
    setCurrentCampaignId(newCampaignId);
  };

  const handleSyncTitles = async () => {
    if (!user) return;
    
    try {
      const result = await campaignService.syncAllCampaignTitles(user.id);
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} campaign titles`);
        refetchCampaigns();
      } else {
        toast.info('All campaign titles are already in sync');
      }
    } catch (error) {
      console.error('Failed to sync titles:', error);
      toast.error('Failed to sync campaign titles');
    }
  };

  return (
    <PageContainer className="relative overflow-hidden">
      <Helmet>
        <title>Campaigns | Creaiter</title>
        <meta 
          name="description" 
          content="Transform one idea into a complete multi-channel campaign strategy with AI-powered content generation across blogs, social media, landing pages, and more." 
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      
      
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
        <PageBreadcrumb section="Tools" page="Campaigns" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
      <CampaignsHero 
        onCreateClick={handleStartNewCampaign}
        onStartConversation={handleStartConversation}
        onExpressMode={handleExpressMode}
        stats={{
          activeCampaigns: campaigns.filter(c => c.status === 'active' || c.status === 'planned').length,
          contentPiecesCreated: 0,
          completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
        }}
      />

          {/* AI Provider Pre-check Banner */}
          {hasAIProvider === false && (
            <Alert className="border-yellow-500/30 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Configure your AI API key to start creating campaigns.
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/ai-settings')}
                  className="ml-4 gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configure
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">My Campaigns</h2>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        💬 Start a new conversation above to create a campaign
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSyncTitles}
                        className="text-xs"
                      >
                        Sync Titles
                      </Button>
                    </div>
                  </div>
                  
                  <CampaignList
                    campaigns={campaigns}
                    isLoading={campaignsLoading}
                    onViewCampaign={handleViewCampaign}
                    onDeleteCampaign={deleteCampaign}
                    onRenameCampaign={updateCampaignName}
                    onArchiveCampaign={handleArchiveCampaign}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="create-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6">
                  <Button variant="ghost" onClick={handleBackToList} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Campaigns
                  </Button>
                </div>

                {showInput ? (
                  <CampaignChatInterface
                    initialMessage={currentInput?.idea}
                    onComplete={handleGenerateStrategies}
                    onCancel={handleBackToList}
                    selectedSolutionId={currentInput?.solutionId}
                    platformPreferences={currentInput?.platformPreferences}
                  />
                ) : null}

                {isGenerating && !strategy && !showInput && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-xl border bg-card/50 backdrop-blur-sm p-6 space-y-4 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-5 bg-muted rounded w-20"></div>
                          <div className="h-5 bg-muted rounded w-16"></div>
                        </div>
                        <div className="h-7 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-5/6 mb-4"></div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="h-20 bg-muted rounded"></div>
                          <div className="h-20 bg-muted rounded"></div>
                          <div className="h-20 bg-muted rounded"></div>
                          <div className="h-20 bg-muted rounded"></div>
                        </div>
                        <div className="h-10 bg-muted rounded"></div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {strategy && !showInput && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CampaignBreakdownView
                      strategy={strategy}
                      solution={selectedSolution}
                      campaignId={currentCampaignId}
                      campaignInput={currentInput}
                      campaignStatus={
                        campaigns.find(c => c.id === currentCampaignId)?.status as any || 'planned'
                      }
                      userId={user.id}
                      onGenerateAssets={handleGenerateAssets}
                      onRegenerate={viewMode === 'create' ? handleRegenerate : undefined}
                      onCampaignCreated={handleCampaignCreated}
                      isGenerating={isSaving}
                      isRegenerating={isGenerating}
                    />
                  </motion.div>
                )}
                {strategy && !showInput && !user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center"
                  >
                    <p className="text-muted-foreground">Please sign in to save your campaign</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Edit Modal */}
      {editingStrategy && (
        <StrategyEditModal
          open={!!editingStrategy}
          onOpenChange={(open) => !open && setEditingStrategy(null)}
          strategy={editingStrategy}
          onSave={handleSaveEditedStrategy}
        />
      )}

      {/* Asset Generation Modal */}
      {strategy && currentCampaignId && (
        <AssetGenerationModal
          strategy={strategy}
          campaignId={currentCampaignId}
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onGenerate={handleStartGeneration}
        />
      )}

      {/* Content Generation Panel (real-time progress) */}
      <ContentGenerationPanel />
    </PageContainer>
  );
};

// Main component with ContentGenerationProvider wrapper
const Campaigns = () => {
  return (
    <ContentGenerationProvider>
      <CampaignsInner />
    </ContentGenerationProvider>
  );
};

export default Campaigns;
