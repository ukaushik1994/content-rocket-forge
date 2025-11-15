import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface ContentEffortTileProps {
  strategy: CampaignStrategy;
}

export const ContentEffortTile = ({ strategy }: ContentEffortTileProps) => {
  const complexityColors = {
    beginner: 'bg-green-500/20 text-green-400 border-green-400/30',
    skilled: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
    expert: 'bg-red-500/20 text-red-400 border-red-400/30',
  };

  const formatNames: Record<string, string> = {
    'blog': 'Blog Posts',
    'email': 'Email',
    'social-twitter': 'Twitter',
    'social-linkedin': 'LinkedIn',
    'social-facebook': 'Facebook',
    'social-instagram': 'Instagram',
    'script': 'Video Scripts',
    'landing-page': 'Landing Page',
    'carousel': 'Carousel',
    'meme': 'Memes',
  };

  return (
    <GlassCard className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold">Time & Effort</h3>
      </div>
      
      <div className="space-y-4">
        {strategy.totalEffort ? (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Total Time Required</p>
              <p className="text-3xl font-bold text-amber-400">{strategy.totalEffort.hours} hours</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Skill Level</p>
              <Badge className={complexityColors[strategy.totalEffort.complexity]}>
                {strategy.totalEffort.complexity}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Recommended Order</p>
              <div className="flex gap-2 flex-wrap">
                {strategy.totalEffort.workflowOrder.map((formatId, idx) => (
                  <Badge key={formatId} variant="outline">
                    {idx + 1}. {formatNames[formatId] || formatId}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Effort metrics will be calculated...</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
