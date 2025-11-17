import React, { useState, useEffect } from 'react';
import { CampaignStrategy, CampaignInput, CampaignStatus } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Save, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SaveIndicator } from './SaveIndicator';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { ContentLibrary } from './ContentLibrary';
import { ExportCampaignButton } from './ExportCampaignButton';
import { PublishingPanel } from './PublishingPanel';
import { CalendarIntegration } from './CalendarIntegration';
import { PublicationStatusTracker } from './PublicationStatusTracker';
import { CampaignAnalytics } from './CampaignAnalytics';
import { PerformanceInsights } from './PerformanceInsights';
import { CampaignROI } from './CampaignROI';
import { CampaignComparison } from './CampaignComparison';
import { useCampaignAutoSave } from '@/hooks/useCampaignAutoSave';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';
import { ContentGenerationProvider } from '@/contexts/ContentGenerationContext';
import { ContentGenerationPanel } from './ContentGenerationPanel';
import {
  CampaignSummaryTile,
  ContentMixTile,
  ContentEffortTile,
  AudienceIntelligenceTile,
  SeoIntelligenceTile,
  DistributionStrategyTile,
  AssetRequirementsTile,
  OptionalAddonsTile,
} from './tiles';
import { TileErrorBoundary } from './TileErrorBoundary';

interface CampaignBreakdownViewProps {
  strategy: CampaignStrategy;
  solution?: EnhancedSolution | null;
  campaignId?: string | null;
  campaignInput?: CampaignInput | null;
  campaignStatus?: CampaignStatus;
  userId?: string;
  onGenerateAssets: () => void;
  onRegenerate?: () => void;
  onCampaignCreated?: (campaignId: string) => void;
  isGenerating?: boolean;
  isRegenerating?: boolean;
}

export const CampaignBreakdownView = ({
  strategy,
  solution,
  campaignId,
  campaignInput,
  campaignStatus = 'draft',
  userId,
  onGenerateAssets,
  onRegenerate,
  onCampaignCreated,
  isGenerating = false,
  isRegenerating = false,
}: CampaignBreakdownViewProps) => {
  const navigate = useNavigate();
  const totalContentPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [showContentLibrary, setShowContentLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<'strategy' | 'publishing'>('strategy');
  const [contentItems, setContentItems] = useState<any[]>([]);

  // Auto-save hook
  const { saveStatus, lastSaved } = useCampaignAutoSave({
    campaignId: campaignId || null,
    strategy,
    input: campaignInput || null,
    userId: userId || '',
    onCampaignCreated,
  });

  // Fetch content items when publishing tab is active
  useEffect(() => {
    const fetchContentItems = async () => {
      if (!campaignId || activeTab !== 'publishing') return;
      
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching content items:', error);
        return;
      }
      
      setContentItems(data || []);
    };

    fetchContentItems();
  }, [campaignId, activeTab]);

  const handleManualSave = async () => {
    if (!userId || !campaignInput) {
      toast.error('Missing required data to save campaign');
      return;
    }

    setIsManualSaving(true);
    try {
      if (campaignId) {
        await campaignService.updateCampaign(campaignId, {
          selected_strategy: strategy,
          target_audience: campaignInput.targetAudience,
          goal: campaignInput.goal,
          timeline: campaignInput.timeline,
          status: 'planned', // Update status to planned when strategy is saved
        });
        
        console.log('📊 [Campaign Status] Updated to "planned" after strategy save');
        toast.success('Campaign saved successfully');
      } else {
        const generateCampaignName = (idea: string) => {
          const words = idea.split(' ').slice(0, 5).join(' ');
          return words.length > 50 ? words.substring(0, 47) + '...' : words;
        };

        const saved = await campaignService.saveCampaign(
          userId,
          generateCampaignName(campaignInput.idea),
          campaignInput.idea,
          strategy
        );

        await campaignService.updateCampaign(saved.id, {
          target_audience: campaignInput.targetAudience,
          goal: campaignInput.goal,
          timeline: campaignInput.timeline,
          status: 'planned', // Set status to planned when strategy is first saved
        });

        console.log('📊 [Campaign Status] Set to "planned" after initial save');
        
        if (onCampaignCreated) {
          onCampaignCreated(saved.id);
        }

        toast.success('Campaign created and saved');
      }
    } catch (error) {
      console.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setIsManualSaving(false);
    }
  };

  return (
    <ContentGenerationProvider>
      <ContentGenerationPanel />
      
      {showContentLibrary && campaignId ? (
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Content Library</h2>
            <div className="flex items-center gap-2">
              <ExportCampaignButton 
                campaignId={campaignId} 
                campaignName={strategy.title}
              />
              <Button
                variant="outline"
                onClick={() => setShowContentLibrary(false)}
              >
                Back to Strategy
              </Button>
            </div>
          </div>
          <ContentLibrary campaignId={campaignId} />
        </div>
      ) : (
        <div className="space-y-6 w-full">
      {/* Header with Status and Save Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Campaign Strategy</h2>
            <CampaignStatusBadge status={campaignStatus} />
          </div>
          <div className="flex items-center gap-4">
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-l pl-4">
              {campaignStatus !== 'draft' && (
                <>
                  <Button variant={activeTab === 'strategy' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('strategy')}>
                    📋 Strategy
                  </Button>
                  <Button variant={activeTab === 'publishing' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('publishing')}>
                    🚀 Publishing
                  </Button>
                </>
              )}
            </div>
            {saveStatus === 'error' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isManualSaving}
              className="gap-2"
            >
              <Save className={cn("h-4 w-4", isManualSaving && "animate-pulse")} />
              {isManualSaving ? 'Saving...' : 'Save Manually'}
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="outline"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>
      </div>

        {/* Strategy Tab */}
        {activeTab === 'strategy' && (
          <>
            {/* Row 1: Campaign Summary - Full Width */}
            <TileErrorBoundary tileName="Campaign Summary">
              <CampaignSummaryTile strategy={strategy} status={campaignStatus} />
            </TileErrorBoundary>
          
            {/* Row 2: Content Mix + Content Effort */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TileErrorBoundary tileName="Content Mix">
                <ContentMixTile strategy={strategy} />
              </TileErrorBoundary>
              <TileErrorBoundary tileName="Content Effort">
                <ContentEffortTile strategy={strategy} />
              </TileErrorBoundary>
            </div>
            
            {/* Row 3: Audience Intelligence + SEO Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TileErrorBoundary tileName="Audience Intelligence">
                <AudienceIntelligenceTile strategy={strategy} />
              </TileErrorBoundary>
              <TileErrorBoundary tileName="SEO Intelligence">
                <SeoIntelligenceTile strategy={strategy} />
              </TileErrorBoundary>
            </div>
            
            {/* Row 4: Distribution Strategy + Asset Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TileErrorBoundary tileName="Distribution Strategy">
                <DistributionStrategyTile strategy={strategy} />
              </TileErrorBoundary>
              <TileErrorBoundary tileName="Asset Requirements">
                <AssetRequirementsTile strategy={strategy} />
              </TileErrorBoundary>
            </div>
            
            {/* Row 5: Optional Add-ons - Full Width */}
            <TileErrorBoundary tileName="Optional Add-ons">
              <OptionalAddonsTile strategy={strategy} />
            </TileErrorBoundary>
            
            {/* Row 6: Generate Assets CTA - Centered */}
            <div className="flex flex-col items-center gap-4 py-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity px-12 py-6 text-lg font-semibold shadow-xl"
                onClick={onGenerateAssets}
                disabled={isGenerating}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {isGenerating ? 'Generating Assets...' : 'Generate Campaign Assets'}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                This will create {totalContentPieces} content pieces and a full execution plan
              </p>
            </div>
          </>
        )}

        {/* Publishing Tab */}
        {activeTab === 'publishing' && campaignId && (
          <div className="bg-accent/20 border-2 border-accent rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Publishing & Distribution</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PublishingPanel
                  campaignId={campaignId}
                  contentItems={contentItems}
                  onPublishComplete={() => {}}
                />
                <CalendarIntegration
                  campaignId={campaignId}
                  contentItems={contentItems}
                  onScheduleComplete={() => {}}
                />
              </div>
              <PublicationStatusTracker contentItems={contentItems} />
            </div>
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/repository?tab=campaigns')}
              >
                View Generated Content →
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/analytics?tab=campaigns')}
              >
                View Campaign Analytics →
              </Button>
            </div>
          </div>
        )}
    </div>
  )}
</ContentGenerationProvider>
  );
};
