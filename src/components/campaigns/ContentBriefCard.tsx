import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { ContentBrief } from '@/types/campaign-types';
import { FileText, Target, TrendingUp, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentBriefCardProps {
  brief: ContentBrief;
  formatName: string;
  onCreateContent?: () => void;
}

export function ContentBriefCard({ brief, formatName, onCreateContent }: ContentBriefCardProps) {
  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  const getOpportunityColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <GlassCard className="p-4 space-y-3 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl hover:border-primary/20 hover:shadow-md transition-all duration-300 group relative">
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
      
      <div className="relative space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-tight flex-1 line-clamp-2">{brief.title}</h4>
          <Badge variant="outline" className="text-xs shrink-0 bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
            {formatName}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {brief.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Target className="w-3 h-3 text-muted-foreground" />
          <Badge 
            variant="outline" 
            className={`text-xs ${difficultyColors[brief.difficulty]}`}
          >
            {brief.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <TrendingUp className={cn("w-3 h-3", getOpportunityColor(brief.serpOpportunity))} />
          <span className={cn("text-xs font-medium", getOpportunityColor(brief.serpOpportunity))}>
            {brief.serpOpportunity}% opportunity
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          <span>{brief.targetWordCount.toLocaleString()} words</span>
        </div>
      </div>

      {brief.keywords.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span className="font-medium">Keywords:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {brief.keywords.slice(0, 5).map((keyword, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {brief.keywords.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{brief.keywords.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border/40">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">SEO Preview:</div>
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-primary truncate">{brief.metaTitle}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{brief.metaDescription}</div>
          </div>
        </div>
      </div>

      {onCreateContent && (
        <Button 
          size="sm" 
          className="relative w-full mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border-primary/30"
          onClick={onCreateContent}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Create Content
        </Button>
      )}
    </GlassCard>
  );
}
