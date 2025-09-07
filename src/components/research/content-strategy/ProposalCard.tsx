import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Send, Target, BarChart3, Calendar, CheckCircle2, CalendarPlus, Eye } from 'lucide-react';
import { proposalManagement } from '@/services/proposalManagement';
import { toast } from 'sonner';
import { OpportunityDetailModal } from './OpportunityDetailModal';

interface ProposalCardProps {
  proposal: any;
  index: number;
  isSelected: boolean;
  onSelectionChange: (index: number, selected: boolean) => void;
  onSendToBuilder: (proposal: any) => void;
  showHistoricalBadge?: boolean;
  isNew?: boolean;
}

export const ProposalCard = ({ proposal, index, isSelected, onSelectionChange, onSendToBuilder, showHistoricalBadge, isNew = false }: ProposalCardProps) => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [schedulePriority, setSchedulePriority] = useState('medium');
  const [scheduleHours, setScheduleHours] = useState(2);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const primaryKw = proposal.primary_keyword || 'No keyword';
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

  const handleScheduleToCalendar = async () => {
    if (!scheduleDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      const proposalData = {
        proposal_id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-'),
        title: proposal.title,
        description: proposal.description,
        primary_keyword: proposal.primary_keyword,
        related_keywords: proposal.related_keywords,
        content_suggestions: proposal.content_suggestions,
        priority_tag: proposal.priority_tag,
        estimated_impressions: estImpressions,
        serp_data: proposal.serp_data
      };

      await proposalManagement.scheduleProposalToCalendar(
        proposalData,
        scheduleDate,
        schedulePriority,
        scheduleHours
      );

      toast.success('Proposal scheduled to calendar successfully');
      setScheduleDialogOpen(false);
      setScheduleDate('');
    } catch (error) {
      console.error('Error scheduling proposal:', error);
      toast.error('Failed to schedule proposal to calendar');
    }
  };

  return (
    <>
      <Card 
        className={`relative overflow-hidden border transition-all duration-300 cursor-pointer ${
          isSelected 
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
        onClick={(e) => {
          // Don't open modal if clicking on buttons or checkboxes
          const target = e.target as HTMLElement;
          if (!target.closest('button') && !target.closest('[role="checkbox"]')) {
            setDetailModalOpen(true);
          }
        }}
      >
      {/* View Details Button */}
      <div className="absolute top-3 right-3 z-10">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setDetailModalOpen(true);
          }}
          size="sm"
          variant="outline"
          className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20 w-10 h-8 p-0"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      {/* New Proposal Indicator */}
      {isNew && (
        <div className="absolute top-2 left-2 z-10">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
        </div>
      )}

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
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs w-fit ${getPriorityColor(proposal.priority_tag || 'evergreen')}`}
          >
            {getPriorityLabel(proposal.priority_tag || 'evergreen')}
          </Badge>
          {showHistoricalBadge && (
            <Badge variant="outline" className="text-xs text-orange-400 bg-orange-500/10 border-orange-400/30">
              Historical
            </Badge>
          )}
          {proposal.created_at && (
            <span className="text-xs text-white/40">
              {new Date(proposal.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Primary Keyword */}
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white/80">Primary Keyword:</span>
          <Badge variant="outline" className={`text-xs border-white/20 bg-white/10 ${
            primaryKw === 'No keyword' ? 'text-red-400 border-red-400/30' : 'text-white/80'
          }`}>
            {primaryKw}
          </Badge>
          {primaryKw === 'No keyword' && (
            <span className="text-xs text-red-400">Missing keyword data</span>
          )}
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
              setScheduleDialogOpen(true);
            }}
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20 w-10 h-8 p-0"
            title="Schedule to Calendar"
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSendToBuilder({ 
                ...proposal, 
                source_proposal_id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-')
              });
            }}
            size="sm"
            className="flex-1 gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
            variant="outline"
          >
            <Send className="h-4 w-4" />
            Create Content
          </Button>
        </div>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Schedule to Calendar</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="schedule_date" className="text-white">Scheduled Date</Label>
                <Input
                  id="schedule_date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-white">Priority</Label>
                  <Select value={schedulePriority} onValueChange={setSchedulePriority}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hours" className="text-white">Est. Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="40"
                    value={scheduleHours}
                    onChange={(e) => setScheduleHours(parseInt(e.target.value) || 2)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleToCalendar} className="bg-primary/20 hover:bg-primary/30">
                Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          proposal={proposal}
          onSendToBuilder={onSendToBuilder}
          onScheduleToCalendar={() => setScheduleDialogOpen(true)}
        />
      </CardContent>
    </Card>
    </>
  );
};