import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Sparkles } from 'lucide-react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';
import { getPlatformConfig } from '@/utils/platformIcons';

interface ContentPlanTileProps {
  strategy: CampaignStrategy;
  campaignId?: string | null;
}

export const ContentPlanTile = ({ strategy, campaignId }: ContentPlanTileProps) => {
  const { openPanel } = useContentGeneration();
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <GlassCard className="p-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Content Plan</h3>
        </div>
        <Button 
          size="sm" 
          onClick={() => campaignId && openPanel(strategy, campaignId)}
          disabled={!campaignId}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>
      </div>
      
      {/* Summary */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="font-medium">
          {totalPieces} pieces
        </Badge>
        <span className="text-sm text-muted-foreground">
          across {strategy.contentMix.length} formats
        </span>
      </div>
      
      {/* Content Formats List */}
      <div className="space-y-2 mb-6">
        {strategy.contentMix.map((format) => {
          const config = getPlatformConfig(format.formatId);
          const IconComponent = config.icon;
          
          return (
            <div 
              key={format.formatId} 
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
                  {IconComponent ? (
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  ) : config.label ? (
                    <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
                  ) : null}
                </div>
                <span className="text-sm font-medium">{config.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{format.count}×</span>
            </div>
          );
        })}
      </div>

      {/* Effort Summary */}
      {strategy.totalEffort && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated time</span>
            </div>
            <span className="text-lg font-semibold">{strategy.totalEffort.hours}h</span>
          </div>
          
          {strategy.seoIntelligence?.briefTemplatesAvailable && strategy.seoIntelligence.briefTemplatesAvailable > 0 && (
            <Button variant="ghost" size="sm" className="w-full mt-4 text-muted-foreground hover:text-foreground">
              <FileText className="h-4 w-4 mr-2" />
              View {strategy.seoIntelligence.briefTemplatesAvailable} briefs
            </Button>
          )}
        </div>
      )}
    </GlassCard>
  );
};
