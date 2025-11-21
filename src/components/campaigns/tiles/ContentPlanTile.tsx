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

export const ContentPlanTile = ({ strategy, campaignId }: ContentPlanTileProps) => {
  const { openPanel } = useContentGeneration();
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <GlassCard className="p-6 bg-background/60 backdrop-blur-xl border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-purple-500/10">
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Content Plan</h3>
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
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Content Formats</p>
          <Badge variant="outline" className="font-bold px-3 py-1">{totalPieces} pieces total</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {strategy.contentMix.map((format) => {
            const Icon = formatIcons[format.formatId] || FileText;
            const name = formatNames[format.formatId] || format.formatId;
            
            return (
              <div 
                key={format.formatId} 
                className="group relative p-4 rounded-xl bg-gradient-to-br from-card/40 via-card/60 to-card/40 border border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] transition-all duration-300"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent rounded-xl transition-all duration-300" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 group-hover:ring-2 group-hover:ring-purple-500/30 transition-all duration-300">
                      <Icon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-relaxed">{name}</p>
                      <p className="text-xs text-muted-foreground">Ready to generate</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-base font-bold px-3 py-1">{format.count}×</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Effort Summary + Brief Access */}
      {strategy.totalEffort && (
        <div className="pt-5 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-card/40 via-card/60 to-card/40 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total Time Required</p>
              </div>
              <p className="text-3xl font-black bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {strategy.totalEffort.hours}h
              </p>
            </div>
          </div>
          
          {strategy.seoIntelligence?.briefTemplatesAvailable && strategy.seoIntelligence.briefTemplatesAvailable > 0 && (
            <Button variant="outline" size="sm" className="w-full gap-2 mt-4">
              <FileText className="h-4 w-4" />
              View {strategy.seoIntelligence.briefTemplatesAvailable} Content Briefs
            </Button>
          )}
        </div>
      )}
    </GlassCard>
  );
};
