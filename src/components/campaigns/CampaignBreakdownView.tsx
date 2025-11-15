import React from 'react';
import { CampaignStrategy, CampaignInput, CampaignStatus } from '@/types/campaign-types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SaveIndicator } from './SaveIndicator';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { useCampaignAutoSave } from '@/hooks/useCampaignAutoSave';
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

  // Auto-save hook
  const { saveStatus, lastSaved } = useCampaignAutoSave({
    campaignId: campaignId || null,
    strategy,
    input: campaignInput || null,
    userId: userId || '',
    onCampaignCreated,
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header with Status and Save Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Campaign Strategy</h2>
          <CampaignStatusBadge status={campaignStatus} />
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
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
      <CampaignSummaryTile strategy={strategy} status={campaignStatus} />
      
      {/* Row 2: Content Mix + Content Effort */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentMixTile strategy={strategy} />
        <ContentEffortTile strategy={strategy} />
      </div>
      
      {/* Row 3: Audience Intelligence + SEO Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AudienceIntelligenceTile strategy={strategy} />
        <SeoIntelligenceTile strategy={strategy} />
      </div>
      
      {/* Row 4: Distribution Strategy + Asset Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionStrategyTile strategy={strategy} />
        <AssetRequirementsTile strategy={strategy} />
      </div>
      
      {/* Row 5: Optional Add-ons - Full Width */}
      <OptionalAddonsTile strategy={strategy} />
      
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
  );
};
