import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Package, FileText, Image, ArrowUpRight } from 'lucide-react';
import { useCampaignFlow } from '@/contexts/CampaignFlowContext';

interface AssetRequirementsTileProps {
  strategy: CampaignStrategy;
}

export const AssetRequirementsTile = ({ strategy }: AssetRequirementsTileProps) => {
  const { openFlowPanel } = useCampaignFlow();
  const assetRequirements = strategy.assetRequirements;

  if (!assetRequirements) {
    return (
      <GlassCard 
        className="p-5 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20 cursor-pointer transition-all duration-200 hover:border-neon-purple/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-purple/20 relative group"
        onClick={() => openFlowPanel('assets', strategy)}
      >
        <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-rose-400" />
          <h3 className="text-lg font-semibold">Asset Requirements</h3>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <p>Asset requirements will be generated...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard 
      className="p-5 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20 cursor-pointer transition-all duration-200 hover:border-neon-purple/50 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-purple/20 relative group"
      onClick={() => openFlowPanel('assets', strategy)}
    >
      <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-rose-400" />
        <h3 className="text-lg font-semibold">Asset Requirements</h3>
      </div>
      
      <div className="space-y-3">
        {assetRequirements.copyNeeds && Array.isArray(assetRequirements.copyNeeds) && assetRequirements.copyNeeds.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Copy Requirements</p>
            <ul className="space-y-1">
              {assetRequirements.copyNeeds.map((need) => (
                <li key={need} className="text-sm flex items-start gap-2">
                  <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                  {need}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {assetRequirements.visualNeeds && Array.isArray(assetRequirements.visualNeeds) && assetRequirements.visualNeeds.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Visual/Creative Needs</p>
            <ul className="space-y-1">
              {assetRequirements.visualNeeds.map((need) => (
                <li key={need} className="text-sm flex items-start gap-2">
                  <Image className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                  {need}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {assetRequirements.ctaSuggestions && Array.isArray(assetRequirements.ctaSuggestions) && assetRequirements.ctaSuggestions.length > 0 && (
          <div className="pt-3 border-t border-rose-500/20">
            <p className="text-xs text-muted-foreground mb-1.5">Suggested CTAs</p>
            <div className="flex gap-2 flex-wrap">
              {assetRequirements.ctaSuggestions.map((cta) => (
                <Badge key={cta} className="bg-rose-500/20 text-rose-300">
                  {cta}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
