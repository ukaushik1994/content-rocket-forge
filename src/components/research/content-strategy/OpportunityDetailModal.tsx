import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Target, BarChart3, Calendar, Send, CalendarPlus, Eye, FileText, Users, Award, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
  onSendToBuilder?: (proposal: any) => void;
  onScheduleToCalendar?: (proposal: any) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onSendToBuilder,
  onScheduleToCalendar
}) => {
  if (!proposal) return null;

  // Helper to normalize keywords (handles both strings and {keyword: string} objects)
  const normalizeKeyword = (kw: any): string => {
    if (typeof kw === 'string') return kw;
    if (kw && typeof kw === 'object' && kw.keyword) return String(kw.keyword);
    return String(kw || '');
  };

  const primaryKw = proposal.primary_keyword || 'No keyword';
  const primaryMetrics = proposal.serp_data?.[primaryKw] || {};
  const estImpressions = proposal.estimated_impressions ?? Math.round((primaryMetrics.searchVolume || 0) * 0.05);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'quick_win': return 'text-green-400 bg-green-500/10 border-green-400/30';
      case 'high_return': return 'text-blue-400 bg-blue-500/10 border-blue-400/30';
      case 'evergreen': return 'text-purple-400 bg-purple-500/10 border-purple-400/30';
      default: return 'text-muted-foreground bg-muted/10 border-border';
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

  const handleSendToBuilder = () => {
    if (onSendToBuilder) {
      onSendToBuilder({ 
        ...proposal, 
        source_proposal_id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-')
      });
      toast.success('Proposal sent to content builder');
      onClose();
    }
  };

  const handleScheduleToCalendar = () => {
    if (onScheduleToCalendar) {
      onScheduleToCalendar(proposal);
    } else {
      toast.info('Calendar scheduling not available');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background border-border text-foreground backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-foreground pr-8">
            {proposal.title || 'Untitled Opportunity'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)] flex-1 min-h-0" hideScrollbar>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {proposal.description && (
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{proposal.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Content Suggestions */}
            {proposal.content_suggestions && proposal.content_suggestions.length > 0 && (
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent-foreground" />
                    Content Ideas & Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {proposal.content_suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-accent-foreground mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* SERP Analysis */}
            {proposal.serp_data && Object.keys(proposal.serp_data).length > 0 && (
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    SERP Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(proposal.serp_data).map(([keyword, data]: [string, any], index) => (
                      <div key={index} className="p-4 bg-muted/5 rounded-lg border border-border">
                        <div className="text-sm font-medium text-foreground mb-2">{keyword}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          {data.searchVolume && (
                            <div>Volume: {data.searchVolume.toLocaleString()}</div>
                          )}
                          {data.difficulty && (
                            <div>Difficulty: {data.difficulty}</div>
                          )}
                          {data.cpc && (
                            <div>CPC: ${data.cpc}</div>
                          )}
                          {data.competition && (
                            <div>Competition: {data.competition}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Key Metrics */}
            <Card className="bg-muted/5 border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(proposal.priority_tag || 'evergreen')}`}
                  >
                    {getPriorityLabel(proposal.priority_tag || 'evergreen')}
                  </Badge>
                </div>

                {/* Content Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Content Type:</span>
                  <Badge variant="outline" className="text-xs text-muted-foreground border-border bg-muted/10">
                    {proposal.content_type || 'blog'}
                  </Badge>
                </div>

                {/* Primary Keyword */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Primary Keyword</span>
                  </div>
                  <Badge variant="outline" className={`text-xs border-border bg-muted/10 w-full justify-center ${
                    primaryKw === 'No keyword' ? 'text-destructive border-destructive' : 'text-muted-foreground'
                  }`}>
                    {primaryKw}
                  </Badge>
                </div>

                {/* Traffic Estimation */}
                <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Est. Monthly Impressions</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {estImpressions.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Keywords */}
            {proposal.related_keywords && proposal.related_keywords.length > 0 && (
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Related Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {proposal.related_keywords.map((keyword: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs text-muted-foreground border-border bg-muted/10">
                        {normalizeKeyword(keyword)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="bg-muted/5 border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSendToBuilder}
                  className="w-full gap-2 bg-primary/20 border-primary/30 text-primary hover:bg-primary/30"
                  variant="outline"
                >
                  <Send className="h-4 w-4" />
                  Create Content
                </Button>
                
                <Button
                  onClick={handleScheduleToCalendar}
                  variant="outline"
                  className="w-full gap-2 bg-muted/10 border-border text-muted-foreground hover:bg-muted/20"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Schedule to Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Metadata */}
            {proposal.created_at && (
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(proposal.created_at).toLocaleDateString()}
                  </div>
                  {proposal.updated_at && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Updated: {new Date(proposal.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};