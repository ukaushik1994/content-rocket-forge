import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Mail, MessageSquare, Video, Zap, Sparkles } from 'lucide-react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';
import { cn } from '@/lib/utils';

interface ContentPlanTileProps {
  strategy: CampaignStrategy;
  campaignId?: string | null;
}

const formatIcons: Record<string, any> = {
  'blog': BookOpen,
  'email': Mail,
  'social-twitter': MessageSquare,
  'social-linkedin': MessageSquare,
  'social-facebook': MessageSquare,
  'social-instagram': MessageSquare,
  'script': Video,
  'landing-page': FileText,
  'carousel': FileText,
  'meme': FileText,
};

const formatNames: Record<string, string> = {
  'blog': 'Blog Posts',
  'email': 'Email Newsletters',
  'social-twitter': 'Twitter Posts',
  'social-linkedin': 'LinkedIn Posts',
  'social-facebook': 'Facebook Posts',
  'social-instagram': 'Instagram Posts',
  'script': 'Video Scripts',
  'landing-page': 'Landing Page',
  'carousel': 'Carousel Posts',
  'meme': 'Meme Posts',
};

const complexityColors = {
  beginner: 'bg-green-500/20 text-green-400 border-green-400/30',
  skilled: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
  expert: 'bg-red-500/20 text-red-400 border-red-400/30',
};

export const ContentPlanTile = ({ strategy, campaignId }: ContentPlanTileProps) => {
  const { openPanel } = useContentGeneration();
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <GlassCard className="p-8 bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-2xl border-2 border-transparent bg-gradient-to-br before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-purple-500/20 before:via-transparent before:to-pink-500/20 before:-z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-purple-500/10">
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Content Plan</h3>
        </div>
        <Button 
          size="sm" 
          onClick={() => campaignId && openPanel(strategy, campaignId)}
          disabled={!campaignId}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Start Generating
        </Button>
      </div>
      
      {/* Content Mix */}
      <div className="space-y-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Content Formats</p>
          <Badge variant="outline" className="font-bold px-3 py-1">{totalPieces} pieces total</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {strategy.contentMix.map((format) => {
            const Icon = formatIcons[format.formatId] || FileText;
            const name = formatNames[format.formatId] || format.formatId;
            
            return (
              <div key={format.formatId} className="group relative p-4 rounded-xl bg-gradient-to-br from-card/40 to-card/60 border border-white/5 hover:border-white/10 hover:from-card/50 hover:to-card/70 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                      <Icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-base leading-relaxed">{name}</p>
                      <p className="text-xs text-muted-foreground/70">Ready to generate</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="text-lg font-bold px-4 py-1 bg-gradient-to-r from-primary/20 to-primary/30">{format.count}×</Badge>
                    <p className="text-xs text-muted-foreground/70">pieces</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Effort Summary */}
      {strategy.totalEffort && (
        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-full bg-amber-500/10">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide">Time & Effort</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 font-medium">Total Hours</p>
              <p className="text-3xl font-black text-amber-400">{strategy.totalEffort.hours}h</p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2 font-medium">Skill Level</p>
              <Badge className={cn(complexityColors[strategy.totalEffort.complexity], "text-sm font-bold px-3 py-1.5 mt-1")}>
                {strategy.totalEffort.complexity}
              </Badge>
            </div>
          </div>
          
          {strategy.totalEffort.workflowOrder && strategy.totalEffort.workflowOrder.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3 font-medium">Recommended Order</p>
              <div className="flex gap-2.5 flex-wrap">
                {strategy.totalEffort.workflowOrder.map((formatId, idx) => (
                  <Badge key={formatId} variant="outline" className="text-xs font-bold px-3 py-1.5 hover:scale-105 transition-transform">
                    {idx + 1}. {formatNames[formatId] || formatId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
