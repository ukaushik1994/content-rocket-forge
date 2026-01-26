import React from 'react';
import { CampaignAsset } from '@/types/asset-types';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, Check, Flame, Gauge } from 'lucide-react';
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
  
  const typeColors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    'blog': { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', glow: 'shadow-green-500/20' },
    'email': { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
    'social-linkedin': { text: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/30', glow: 'shadow-blue-600/20' },
    'social-twitter': { text: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/30', glow: 'shadow-sky-500/20' },
    'social-facebook': { text: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/20' },
    'social-instagram': { text: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/30', glow: 'shadow-pink-500/20' },
    'landing-page': { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
    'script': { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', glow: 'shadow-red-500/20' },
    'carousel': { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
    'meme': { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' },
  };
  
  const colors = typeColors[asset.type] || { 
    text: 'text-muted-foreground', 
    bg: 'bg-muted/20', 
    border: 'border-border',
    glow: 'shadow-muted/20'
  };

  const difficultyConfig = {
    easy: { icon: Check, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Easy' },
    medium: { icon: Gauge, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Medium' },
    hard: { icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Hard' }
  };

  const difficulty = asset.difficulty ? difficultyConfig[asset.difficulty] : null;
  const DifficultyIcon = difficulty?.icon;
  
  return (
    <div
      className={cn(
        'group relative p-5 rounded-2xl cursor-pointer transition-all duration-300',
        'bg-card/60 backdrop-blur-xl border',
        'hover:-translate-y-1 hover:shadow-xl',
        isSelected 
          ? `ring-2 ring-primary/50 border-primary/50 shadow-lg ${colors.glow}` 
          : 'border-border/40 hover:border-border/60 hover:shadow-lg'
      )}
      onClick={() => onToggle(asset.id)}
    >
      {/* Selection gradient border overlay */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent pointer-events-none" />
      )}
      
      {/* Header with icon and checkbox */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className={cn(
          'p-2.5 rounded-xl transition-all duration-300',
          colors.bg, colors.border, 'border',
          isSelected && `shadow-lg ${colors.glow}`
        )}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>
        
        {/* Premium checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(asset.id);
          }}
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
            isSelected 
              ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30' 
              : 'border-border/60 hover:border-primary/50 bg-background/50'
          )}
        >
          {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
        </button>
      </div>
      
      {/* Title */}
      <h4 className="font-semibold mb-2 line-clamp-2 text-sm tracking-wide leading-snug">
        {asset.title}
      </h4>
      
      {/* Description */}
      {asset.description && (
        <p className="text-xs text-muted-foreground/80 mb-4 line-clamp-2 leading-relaxed">
          {asset.description}
        </p>
      )}
      
      {/* Tags Section - Premium Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {asset.keywords && asset.keywords.slice(0, 2).map((kw, idx) => (
          <span 
            key={idx} 
            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted/50 text-muted-foreground border border-border/30"
          >
            {kw}
          </span>
        ))}
        {asset.keywords && asset.keywords.length > 2 && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted/30 text-muted-foreground/60">
            +{asset.keywords.length - 2}
          </span>
        )}
      </div>
      
      {/* Difficulty & SEO Row */}
      {(asset.difficulty || asset.serpOpportunity) && (
        <div className="flex items-center gap-2 mb-4">
          {difficulty && DifficultyIcon && (
            <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg', difficulty.bg)}>
              <DifficultyIcon className={cn('h-3 w-3', difficulty.color)} />
              <span className={cn('text-[10px] font-semibold', difficulty.color)}>
                {difficulty.label}
              </span>
            </div>
          )}
          {asset.serpOpportunity && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10">
              <div className="w-10 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${asset.serpOpportunity}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-indigo-500">
                {asset.serpOpportunity}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Footer with gradient separator */}
      <div className="relative pt-4">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="p-1 rounded bg-amber-500/10">
              <Clock className="h-3 w-3 text-amber-500" />
            </div>
            <span className="font-medium tabular-nums">{asset.estimatedTime}m</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="p-1 rounded bg-purple-500/10">
              <Sparkles className="h-3 w-3 text-purple-500" />
            </div>
            <span className="font-medium tabular-nums">{asset.estimatedCost}</span>
            <span className="text-muted-foreground/60">cr</span>
          </div>
        </div>
      </div>
    </div>
  );
};
