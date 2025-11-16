import React, { useState } from 'react';
import { CampaignStrategy, CampaignInput, CampaignStatus } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SaveIndicator } from './SaveIndicator';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { useCampaignAutoSave } from '@/hooks/useCampaignAutoSave';
import { campaignService } from '@/services/campaignService';
import { toast } from 'sonner';
import { CampaignFlowProvider } from '@/contexts/CampaignFlowContext';
import { CampaignFlowPanel } from './CampaignFlowPanel';
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
  const totalContentPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
  const [isManualSaving, setIsManualSaving] = useState(false);

  // Auto-save hook
  const { saveStatus, lastSaved } = useCampaignAutoSave({
    campaignId: campaignId || null,
    strategy,
    input: campaignInput || null,
    userId: userId || '',
    onCampaignCreated,
  });

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
          status: 'planned',
        });
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
          status: 'planned',
        });

        if (onCampaignCreated) {
          onCampaignCreated(saved.id);
        }
        
        toast.success('Campaign created successfully');
      }
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign');
    } finally {
      setIsManualSaving(false);
    }
  };

  return (
    <CampaignFlowProvider>
      <CampaignFlowPanel />
      <div className="space-y-6 w-full">
      {/* Header with Status and Save Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Campaign Strategy</h2>
          <CampaignStatusBadge status={campaignStatus} />
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
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
    </div>
    </CampaignFlowProvider>
  );
};
