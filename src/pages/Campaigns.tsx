import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { CampaignsHero } from '@/components/campaigns/CampaignsHero';
import { CampaignInput } from '@/components/campaigns/CampaignInput';
import { CampaignBreakdownView } from '@/components/campaigns/CampaignBreakdownView';
import { StrategyEditModal } from '@/components/campaigns/StrategyEditModal';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { AssetGenerationModal } from '@/components/campaigns/assets/AssetGenerationModal';
import { AssetGenerationQueue } from '@/components/campaigns/assets/AssetGenerationQueue';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignStrategies } from '@/hooks/useCampaignStrategies';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CampaignStrategy, CampaignInput as CampaignInputType } from '@/types/campaign-types';
import { CampaignAsset } from '@/types/asset-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { solutionService } from '@/services/solutionService';
import { campaignService, SavedCampaign } from '@/services/campaignService';
import { campaignCleanupService } from '@/services/campaignCleanupService';
import { generateAssetListFromStrategy } from '@/utils/assetGenerator';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';

const Campaigns = () => {
  const { user } = useAuth();
  const { generateStrategies, isGenerating } = useCampaignStrategies();
  const { campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns, deleteCampaign, updateCampaignName, updateCampaignStatus } = useCampaigns();
  
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [showInput, setShowInput] = useState(false);
  const [currentInput, setCurrentInput] = useState<CampaignInputType | null>(null);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<CampaignStrategy | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<EnhancedSolution | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [generatingAssets, setGeneratingAssets] = useState<string[]>([]);
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns` : '/campaigns';

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

  const handleGenerateStrategies = async (input: CampaignInputType) => {
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

      const strategies = await generateStrategies(input, user.id);
      
      if (strategies && strategies.length > 0) {
        setStrategy(strategies[0]);
        setShowInput(false);
        toast.success('Campaign breakdown generated!');
      }
    } catch (error) {
      console.error('Error generating strategy:', error);
      toast.error('Failed to generate campaign. Please try again.');
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
      toast.error('Failed to regenerate campaign');
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
        const campaignName = `${currentInput?.idea.slice(0, 50)}${currentInput?.idea && currentInput.idea.length > 50 ? '...' : ''}`;
        const savedCampaign = await campaignService.saveCampaign(
          user.id,
          campaignName,
          currentInput?.idea || '',
          strategy
        );
        setCurrentCampaignId(savedCampaign.id);
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
    if (!currentCampaignId) return;
    
    try {
      await campaignService.updateCampaignStatus(currentCampaignId, 'active');
      setGeneratingAssets(assetIds);
      setIsAssetModalOpen(false);
      toast.success(`Starting generation of ${assetIds.length} assets...`);
    } catch (error) {
      console.error('Error starting generation:', error);
      toast.error('Failed to start asset generation');
    }
  };

  const handleGenerationComplete = async (results: { 
    completed: CampaignAsset[]; 
    failed: CampaignAsset[] 
  }) => {
    if (!currentCampaignId) return;
    
    try {
      await campaignService.updateCampaignStatus(currentCampaignId, 'completed');
      setGeneratingAssets([]);
      
      const message = results.failed.length > 0
        ? `Generated ${results.completed.length} assets. ${results.failed.length} failed.`
        : `Successfully generated all ${results.completed.length} assets!`;
      
      toast.success(message);
      refetchCampaigns();
    } catch (error) {
      console.error('Error completing generation:', error);
      toast.error('Failed to update campaign status');
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

  const handleStartConversation = (message: string) => {
    // Start a new campaign with the user's idea
    setViewMode('create');
    setShowInput(true);
    setStrategy(null);
    setCurrentInput({
      idea: message,
      targetAudience: '',
      goal: undefined,
      timeline: undefined
    });
    setCurrentCampaignId(null);
    toast.success('Let\'s build your campaign!');
  };

  const handleArchiveCampaign = async (campaignId: string) => {
    await updateCampaignStatus(campaignId, 'archived');
  };

  const handleCampaignCreated = (newCampaignId: string) => {
    setCurrentCampaignId(newCampaignId);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Campaigns — AI-Powered Multi-Channel Campaign Builder</title>
        <meta 
          name="description" 
          content="Transform one idea into a complete multi-channel campaign strategy with AI-powered content generation across blogs, social media, landing pages, and more." 
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <AnimatedBackground intensity="medium" />
      
      <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
      <CampaignsHero 
        onCreateClick={handleStartNewCampaign}
        onStartConversation={handleStartConversation}
      />
          
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
                    <Button onClick={handleStartNewCampaign} className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Campaign
                    </Button>
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
                  <CampaignInput
                    onGenerate={handleGenerateStrategies}
                    onCancel={handleBackToList}
                    isGenerating={isGenerating}
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

      {/* Asset Generation Queue */}
      {generatingAssets.length > 0 && strategy && currentCampaignId && (
        <AssetGenerationQueue
          assets={generateAssetListFromStrategy(strategy, currentCampaignId)
            .filter(a => generatingAssets.includes(a.id))}
          onComplete={handleGenerationComplete}
          onCancel={() => setGeneratingAssets([])}
        />
      )}
    </div>
  );
};

export default Campaigns;
