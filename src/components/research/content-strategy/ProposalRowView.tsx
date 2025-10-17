import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Calendar, CheckCircle2, Clock, Archive, Play, TrendingUp, MoreHorizontal, CalendarPlus, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { type ProposalStatus } from '@/services/proposalStatusService';
import { proposalManagement } from '@/services/proposalManagement';
import { toast } from 'sonner';

interface ProposalRowViewProps {
  proposals: any[];
  selected: Record<string, boolean>;
  onToggleSelection: (index: number) => void;
  onViewDetails: (proposal: any) => void;
  onSendToBuilder: (proposal: any) => void;
  newProposalIds: Set<string>;
}

export const ProposalRowView: React.FC<ProposalRowViewProps> = ({
  proposals,
  selected,
  onToggleSelection,
  onViewDetails,
  onSendToBuilder,
  newProposalIds
}) => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [schedulePriority, setSchedulePriority] = useState('medium');
  const [scheduleHours, setScheduleHours] = useState(2);
  const [selectedProposalForSchedule, setSelectedProposalForSchedule] = useState<any>(null);

  const handleScheduleClick = (proposal: any) => {
    setSelectedProposalForSchedule(proposal);
    setScheduleDialogOpen(true);
  };

  const handleScheduleToCalendar = async () => {
    if (!scheduleDate || !selectedProposalForSchedule) {
      toast.error('Please select a date');
      return;
    }

    try {
      await proposalManagement.scheduleProposalToCalendar(
        selectedProposalForSchedule,
        scheduleDate,
        schedulePriority as 'low' | 'medium' | 'high',
        scheduleHours
      );
      
      toast.success('Proposal scheduled to calendar');
      setScheduleDialogOpen(false);
      setScheduleDate('');
      setSchedulePriority('medium');
      setScheduleHours(2);
      setSelectedProposalForSchedule(null);
    } catch (error) {
      console.error('Error scheduling proposal:', error);
      toast.error('Failed to schedule proposal');
    }
  };

  const getStatusBadge = (status: ProposalStatus) => {
    const statusConfig = {
      available: { label: 'Available', icon: Play, className: 'text-blue-400 bg-blue-500/10 border-blue-400/30' },
      scheduled: { label: 'Scheduled', icon: Calendar, className: 'text-purple-400 bg-purple-500/10 border-purple-400/30' },
      in_progress: { label: 'In Progress', icon: Clock, className: 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30' },
      completed: { label: 'Completed', icon: CheckCircle2, className: 'text-green-400 bg-green-500/10 border-green-400/30' },
      archived: { label: 'Archived', icon: Archive, className: 'text-gray-400 bg-gray-500/10 border-gray-400/30' }
    };

    const config = statusConfig[status] || statusConfig.available;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      quick_win: { label: 'Quick Win', className: 'text-green-400 bg-green-500/10 border-green-400/30' },
      growth_opportunity: { label: 'Growth Opportunity', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30' },
      high_return: { label: 'High Return', className: 'text-blue-400 bg-blue-500/10 border-blue-400/30' },
      evergreen: { label: 'Evergreen', className: 'text-purple-400 bg-purple-500/10 border-purple-400/30' },
      low_priority: { label: 'Low Priority', className: 'text-gray-400 bg-gray-500/10 border-gray-400/30' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.evergreen;

    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-muted-foreground border-b border-border">
        <div className="col-span-1">Select</div>
        <div className="col-span-4">Content</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-2">Traffic Est.</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Data Rows */}
      {proposals.map((proposal, index) => {
        const isSelected = selected[index];
        const isNew = newProposalIds.has(proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-'));
        const primaryKw = proposal.primary_keyword;
        const metrics = proposal.serp_data?.[primaryKw] || {};
        const estimatedTraffic = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);

        return (
          <motion.div
            key={proposal.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`grid grid-cols-12 gap-4 p-3 items-center transition-all duration-200 hover:bg-accent/50 ${
              isSelected ? 'bg-primary/10 border-primary/30' : 'bg-background border-border'
            }`}>
              {/* Select Column */}
              <div className="col-span-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection(index)}
                />
              </div>

              {/* Content Column */}
              <div className="col-span-4 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{proposal.title}</h3>
                  {isNew && (
                    <Badge variant="outline" className="text-xs text-green-400 bg-green-500/10">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {proposal.primary_keyword}
                </p>
              </div>

              {/* Status Column */}
              <div className="col-span-2">
                {getStatusBadge(proposal.status || 'available')}
              </div>

              {/* Category Column */}
              <div className="col-span-2">
                {getPriorityBadge(proposal.priority_tag || 'evergreen')}
              </div>

              {/* Traffic Est. Column */}
              <div className="col-span-2">
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span>{estimatedTraffic.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions Column */}
              <div className="col-span-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-white/20 z-50">
                    <DropdownMenuItem 
                      onClick={() => onViewDetails(proposal)}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScheduleClick(proposal);
                      }}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Schedule to Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendToBuilder(proposal);
                      }}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Create Content
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          </motion.div>
        );
      })}

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
    </div>
  );
};