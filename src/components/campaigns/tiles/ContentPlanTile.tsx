import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Sparkles } from 'lucide-react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';
import { getPlatformConfig } from '@/utils/platformIcons';
import { cn } from '@/lib/utils';

interface ContentPlanTileProps {
  strategy: CampaignStrategy;
  campaignId?: string | null;
}

// Color map for different content types
const formatColors: Record<string, string> = {
  'blog': 'bg-blue-500/10 text-blue-600',
  'article': 'bg-indigo-500/10 text-indigo-600',
  'social': 'bg-rose-500/10 text-rose-600',
  'email': 'bg-amber-500/10 text-amber-600',
  'linkedin': 'bg-blue-600/10 text-blue-700',
  'twitter': 'bg-sky-500/10 text-sky-600',
  'video': 'bg-purple-500/10 text-purple-600',
  'infographic': 'bg-green-500/10 text-green-600',
  'whitepaper': 'bg-slate-500/10 text-slate-600',
  'case-study': 'bg-orange-500/10 text-orange-600',
};

const getFormatColor = (formatId: string) => {
  const key = Object.keys(formatColors).find(k => formatId.toLowerCase().includes(k));
  return formatColors[key || ''] || 'bg-muted text-muted-foreground';
};

export const ContentPlanTile = ({ strategy, campaignId }: ContentPlanTileProps) => {
  const { openPanel } = useContentGeneration();
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold">Content Plan</h3>
        </div>
        <Button 
          size="sm" 
          onClick={() => campaignId && openPanel(strategy, campaignId)}
          disabled={!campaignId}
          className="gap-1.5 bg-primary hover:bg-primary/90"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Generate
        </Button>
      </div>
      
      {/* Content Formats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-5 flex-1">
        {strategy.contentMix.map((format) => {
          const config = getPlatformConfig(format.formatId);
          const IconComponent = config.icon;
          const colorClass = getFormatColor(format.formatId);
          
          return (
            <div 
              key={format.formatId} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors group"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105", colorClass)}>
                {IconComponent ? (
                  <IconComponent className="h-4 w-4" />
                ) : config.label ? (
                  <span className="text-xs font-bold">{config.label}</span>
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{config.name}</p>
                <p className="text-xs text-muted-foreground">{format.count} pieces</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{totalPieces}</span>
          <span className="text-sm text-muted-foreground">total pieces</span>
        </div>
        {strategy.totalEffort && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{strategy.totalEffort.hours}h</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
