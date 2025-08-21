import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Send, Target, BarChart3, Calendar } from 'lucide-react';

interface ProposalCardProps {
  proposal: any;
  onSendToBuilder: (proposal: any) => void;
}

export const ProposalCard = ({ proposal, onSendToBuilder }: ProposalCardProps) => {
  const primaryKw = proposal.primary_keyword;
  const primaryMetrics = proposal.serp_data?.[primaryKw] || {};
  const estImpressions = proposal.estimated_impressions ?? Math.round((primaryMetrics.searchVolume || 0) * 0.05);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'quick_win': return 'bg-green-100 text-green-800 border-green-200';
      case 'high_return': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'evergreen': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'quick_win': return 'Quick Win';
      case 'high_return': return 'High Return';
      case 'evergreen': return 'Evergreen';
      default: return 'Standard';
    }
  };

  return (
    <Card className="relative overflow-hidden border border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {proposal.title || 'Untitled Proposal'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {proposal.description}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getPriorityColor(proposal.priority_tag || 'evergreen')}`}
          >
            {getPriorityLabel(proposal.priority_tag || 'evergreen')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Keyword */}
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Primary Keyword:</span>
          <Badge variant="outline" className="text-xs">
            {primaryKw}
          </Badge>
        </div>

        {/* Traffic Estimation */}
        <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-medium">Estimated Monthly Impressions</div>
            <div className="text-2xl font-bold text-primary">
              {estImpressions.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Related Keywords */}
        {proposal.related_keywords && proposal.related_keywords.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Related Keywords
            </div>
            <div className="flex flex-wrap gap-1">
              {proposal.related_keywords.slice(0, 3).map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {proposal.related_keywords.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{proposal.related_keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content Suggestions */}
        {proposal.content_suggestions && proposal.content_suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Content Ideas
            </div>
            <div className="text-sm text-muted-foreground">
              {proposal.content_suggestions.slice(0, 2).join(', ')}
              {proposal.content_suggestions.length > 2 && '...'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Button
            onClick={() => onSendToBuilder(proposal)}
            size="sm"
            className="flex-1 gap-2"
          >
            <Send className="h-4 w-4" />
            Send to Builder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};