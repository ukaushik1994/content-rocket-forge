import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, Send, Target, BarChart3, Calendar, CheckCircle2 } from 'lucide-react';

interface ProposalCardProps {
  proposal: any;
  index: number;
  isSelected: boolean;
  onSelectionChange: (index: number, selected: boolean) => void;
  onSendToBuilder: (proposal: any) => void;
}

export const ProposalCard = ({ proposal, index, isSelected, onSelectionChange, onSendToBuilder }: ProposalCardProps) => {
  const primaryKw = proposal.primary_keyword;
  const primaryMetrics = proposal.serp_data?.[primaryKw] || {};
  const estImpressions = proposal.estimated_impressions ?? Math.round((primaryMetrics.searchVolume || 0) * 0.05);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'quick_win': return 'text-green-400 bg-green-500/10 border-green-400/30';
      case 'high_return': return 'text-blue-400 bg-blue-500/10 border-blue-400/30';
      case 'evergreen': return 'text-purple-400 bg-purple-500/10 border-purple-400/30';
      default: return 'text-white/80 bg-white/10 border-white/20';
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
    <Card className={`relative overflow-hidden border transition-all duration-300 ${
      isSelected 
        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
        : 'bg-white/5 border-white/10 hover:bg-white/10'
    }`}>
      {/* Selection Checkbox */}
      <div className="absolute top-3 right-3 z-10">
        <div 
          className={`p-1 rounded transition-all duration-200 ${
            isSelected ? 'bg-blue-500/20' : 'bg-white/10'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(index, !!checked)}
            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
        </div>
      </div>

      <CardHeader className="pb-3 pr-12">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 text-white flex items-center gap-2">
              {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
              {proposal.title || 'Untitled Proposal'}
            </CardTitle>
            <CardDescription className="text-sm text-white/60 line-clamp-2">
              {proposal.description}
            </CardDescription>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`text-xs w-fit ${getPriorityColor(proposal.priority_tag || 'evergreen')}`}
        >
          {getPriorityLabel(proposal.priority_tag || 'evergreen')}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Keyword */}
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white/80">Primary Keyword:</span>
          <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
            {primaryKw}
          </Badge>
        </div>

        {/* Traffic Estimation */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-white/10">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <div>
            <div className="text-sm font-medium text-white/80">Estimated Monthly Impressions</div>
            <div className="text-2xl font-bold text-white">
              {estImpressions.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Related Keywords */}
        {proposal.related_keywords && proposal.related_keywords.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2 text-white/80">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Related Keywords
            </div>
            <div className="flex flex-wrap gap-1">
              {proposal.related_keywords.slice(0, 3).map((keyword: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                  {keyword}
                </Badge>
              ))}
              {proposal.related_keywords.length > 3 && (
                <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                  +{proposal.related_keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content Suggestions */}
        {proposal.content_suggestions && proposal.content_suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2 text-white/80">
              <Calendar className="h-4 w-4 text-orange-400" />
              Content Ideas
            </div>
            <div className="text-sm text-white/60">
              {proposal.content_suggestions.slice(0, 2).join(', ')}
              {proposal.content_suggestions.length > 2 && '...'}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/20">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelectionChange(index, !isSelected);
            }}
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className={`gap-2 ${
              isSelected 
                ? 'bg-blue-500 hover:bg-blue-600 text-white border-0'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSelected ? 'Selected' : 'Select'}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSendToBuilder(proposal);
            }}
            size="sm"
            className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
          >
            <Send className="h-4 w-4" />
            Send to Builder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};