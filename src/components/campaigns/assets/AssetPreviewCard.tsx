import React from 'react';
import { CampaignAsset } from '@/types/asset-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Sparkles } from 'lucide-react';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { cn } from '@/lib/utils';

interface AssetPreviewCardProps {
  asset: CampaignAsset;
  isSelected: boolean;
  onToggle: (assetId: string) => void;
}

export const AssetPreviewCard = ({ 
  asset, 
  isSelected, 
  onToggle 
}: AssetPreviewCardProps) => {
  const format = getFormatByIdOrDefault(asset.type);
  const Icon = format.icon;
  
  const typeColors: Record<string, { text: string; bg: string }> = {
    'blog': { text: 'text-green-400', bg: 'bg-green-500/10' },
    'email': { text: 'text-blue-400', bg: 'bg-blue-500/10' },
    'social-linkedin': { text: 'text-blue-600', bg: 'bg-blue-600/10' },
    'social-twitter': { text: 'text-sky-400', bg: 'bg-sky-400/10' },
    'social-facebook': { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    'social-instagram': { text: 'text-pink-400', bg: 'bg-pink-500/10' },
    'landing-page': { text: 'text-purple-400', bg: 'bg-purple-500/10' },
    'script': { text: 'text-red-400', bg: 'bg-red-500/10' },
    'carousel': { text: 'text-amber-400', bg: 'bg-amber-500/10' },
    'meme': { text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  };
  
  const colors = typeColors[asset.type] || { text: 'text-muted-foreground', bg: 'bg-muted/20' };
  
  return (
    <GlassCard
      className={cn(
        'p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
        isSelected && 'ring-2 ring-primary shadow-primary/20'
      )}
      onClick={() => onToggle(asset.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', colors.bg)}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onToggle(asset.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <h4 className="font-semibold mb-2 line-clamp-2 text-sm">
        {asset.title}
      </h4>
      
      {asset.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {asset.description}
        </p>
      )}
      
      {asset.keywords && asset.keywords.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {asset.keywords.slice(0, 3).map((kw, idx) => (
            <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0">
              {kw}
            </Badge>
          ))}
          {asset.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              +{asset.keywords.length - 3}
            </Badge>
          )}
        </div>
      )}
      
      {(asset.difficulty || asset.serpOpportunity) && (
        <div className="flex gap-2 mb-3">
          {asset.difficulty && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs',
                asset.difficulty === 'easy' && 'bg-green-500/20 text-green-300',
                asset.difficulty === 'medium' && 'bg-yellow-500/20 text-yellow-300',
                asset.difficulty === 'hard' && 'bg-red-500/20 text-red-300'
              )}
            >
              {asset.difficulty}
            </Badge>
          )}
          {asset.serpOpportunity && (
            <Badge variant="secondary" className="text-xs">
              SEO: {asset.serpOpportunity}/100
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>{asset.estimatedTime} min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          <span>{asset.estimatedCost} credits</span>
        </div>
      </div>
    </GlassCard>
  );
};
