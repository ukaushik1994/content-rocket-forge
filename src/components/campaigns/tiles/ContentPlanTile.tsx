import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Mail, MessageSquare, Video, Zap, Sparkles } from 'lucide-react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';

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
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Content Plan</h3>
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
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Content Formats</p>
          <Badge variant="outline">{totalPieces} pieces total</Badge>
        </div>
        {strategy.contentMix.map((format) => {
          const Icon = formatIcons[format.formatId] || FileText;
          const name = formatNames[format.formatId] || format.formatId;
          
          return (
            <div key={format.formatId} className="flex items-center justify-between p-3 rounded-lg bg-background/40">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{name}</span>
              </div>
              <Badge variant="secondary">{format.count}×</Badge>
            </div>
          );
        })}
      </div>

      {/* Effort Summary */}
      {strategy.totalEffort && (
        <div className="pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-amber-400" />
            <p className="text-sm font-medium">Time & Effort</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold text-amber-400">{strategy.totalEffort.hours}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Skill Level</p>
              <Badge className={complexityColors[strategy.totalEffort.complexity]}>
                {strategy.totalEffort.complexity}
              </Badge>
            </div>
          </div>
          
          {strategy.totalEffort.workflowOrder && strategy.totalEffort.workflowOrder.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Recommended Order</p>
              <div className="flex gap-2 flex-wrap">
                {strategy.totalEffort.workflowOrder.map((formatId, idx) => (
                  <Badge key={formatId} variant="outline" className="text-xs">
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
