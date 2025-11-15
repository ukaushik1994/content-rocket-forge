import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, Mail, MessageSquare, Video } from 'lucide-react';

interface ContentMixTileProps {
  strategy: CampaignStrategy;
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

const SeoIndicator = ({ level }: { level?: string }) => {
  const colors = {
    high: 'bg-green-500/20 text-green-400 border-green-400/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
    low: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
  };
  
  return (
    <Badge variant="outline" className={colors[level as keyof typeof colors] || colors.medium}>
      SEO: {level || 'medium'}
    </Badge>
  );
};

export const ContentMixTile = ({ strategy }: ContentMixTileProps) => {
  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Content Mix</h3>
        <Badge variant="outline">{totalPieces} pieces</Badge>
      </div>
      
      <div className="space-y-2">
        {strategy.contentMix.map((format) => {
          const Icon = formatIcons[format.formatId] || FileText;
          const name = formatNames[format.formatId] || format.formatId;
          
          return (
            <div key={format.formatId} className="flex items-center justify-between p-3 rounded-lg bg-background/40">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{format.count}×</Badge>
                <SeoIndicator level={format.seoPotential} />
              </div>
            </div>
          );
        })}
      </div>
      
      {strategy.contentCategories && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-2">By Category</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(strategy.contentCategories).map(([cat, count]) => (
              <Badge key={cat} variant="outline">{cat}: {count}</Badge>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};
