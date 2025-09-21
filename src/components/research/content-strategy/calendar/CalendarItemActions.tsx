import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal, 
  Calendar, 
  Trash2, 
  ArrowRight, 
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { calendarActionsService } from '@/services/calendarActionsService';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface CalendarItemActionsProps {
  calendarItem: any;
  onRefresh?: () => void;
  compact?: boolean;
}

export const CalendarItemActions = ({ calendarItem, onRefresh, compact = false }: CalendarItemActionsProps) => {
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [removeReason, setRemoveReason] = useState('');
  const [loading, setLoading] = useState(false);

  const isOverdue = calendarActionsService.isCalendarItemOverdue(calendarItem.scheduled_date);
  const hasProposal = !!calendarItem.proposal_id;

  const handlePostpone = async () => {
    if (!postponeDate) {
      toast.error('Please select a new date');
      return;
    }

    try {
      setLoading(true);
      await calendarActionsService.postponeCalendarItem(
        calendarItem.id, 
        postponeDate, 
        postponeReason || 'User requested postponement'
      );
      
      setPostponeDialogOpen(false);
      setPostponeDate('');
      setPostponeReason('');
      onRefresh?.();
    } catch (error) {
      // Error handling is done in the service
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      
      if (hasProposal) {
        await calendarActionsService.removeCalendarItemAndRestoreProposal(
          calendarItem.id,
          removeReason || 'User requested removal'
        );
      } else {
        // Just delete the calendar item if no proposal linked
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase
          .from('content_calendar')
          .delete()
          .eq('id', calendarItem.id);
        toast.success('Calendar item removed');
      }
      
      setRemoveDialogOpen(false);
      setRemoveReason('');
      onRefresh?.();
    } catch (error) {
      // Error handling is done in the service
    } finally {
      setLoading(false);
    }
  };

  const getQuickPostponeDates = () => [
    { label: 'Tomorrow', date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'Next Week', date: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
    { label: 'Next Month', date: format(addDays(new Date(), 30), 'yyyy-MM-dd') }
  ];

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-1">
          {isOverdue && (
            <Button
              onClick={() => setPostponeDialogOpen(true)}
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs bg-orange-500/20 border-orange-400/30 text-orange-400 hover:bg-orange-500/30"
            >
              <Clock className="h-3 w-3 mr-1" />
              Overdue
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-white/20">
              <DropdownMenuItem onClick={() => setPostponeDialogOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Postpone
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setRemoveDialogOpen(true)}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove {hasProposal && '& Restore'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        {renderPostponeDialog()}
        {renderRemoveDialog()}
      </>
    );
  }

  // Full size actions
  return (
    <>
      <div className="flex items-center gap-2">
        {isOverdue && (
          <div className="flex items-center gap-1 text-orange-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Overdue</span>
          </div>
        )}
        
        <Button
          onClick={() => setPostponeDialogOpen(true)}
          size="sm"
          variant="outline"
          className="gap-2 bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30"
        >
          <Calendar className="h-4 w-4" />
          Postpone
        </Button>
        
        <Button
          onClick={() => setRemoveDialogOpen(true)}
          size="sm"
          variant="outline"
          className="gap-2 bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
        >
          <Trash2 className="h-4 w-4" />
          Remove {hasProposal && '& Restore'}
        </Button>
      </div>

      {/* Dialogs */}
      {renderPostponeDialog()}
      {renderRemoveDialog()}
    </>
  );

  function renderPostponeDialog() {
    return (
      <Dialog open={postponeDialogOpen} onOpenChange={setPostponeDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Postpone Content</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white">Current Date</Label>
              <div className="text-sm text-white/60">
                {format(new Date(calendarItem.scheduled_date), 'MMMM dd, yyyy')}
              </div>
            </div>

            <div>
              <Label htmlFor="new_date" className="text-white">New Date</Label>
              <Input
                id="new_date"
                type="date"
                value={postponeDate}
                onChange={(e) => setPostponeDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <Label className="text-white">Quick Options</Label>
              <div className="flex gap-2 mt-1">
                {getQuickPostponeDates().map((option) => (
                  <Button
                    key={option.label}
                    onClick={() => setPostponeDate(option.date)}
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="postpone_reason" className="text-white">Reason (Optional)</Label>
              <Textarea
                id="postpone_reason"
                value={postponeReason}
                onChange={(e) => setPostponeReason(e.target.value)}
                placeholder="Why are you postponing this content?"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPostponeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePostpone} 
              disabled={!postponeDate || loading}
              className="bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30 text-blue-400"
            >
              {loading ? 'Postponing...' : 'Postpone'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderRemoveDialog() {
    return (
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">
              Remove Calendar Item {hasProposal && '& Restore Proposal'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
              <p className="text-sm text-white/80">
                This will remove "{calendarItem.title}" from your calendar.
                {hasProposal && (
                  <>
                    <br />
                    <span className="text-green-400">
                      ✓ The associated proposal will be restored to "Available" status.
                    </span>
                  </>
                )}
              </p>
            </div>

            <div>
              <Label htmlFor="remove_reason" className="text-white">Reason (Optional)</Label>
              <Textarea
                id="remove_reason"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder="Why are you removing this calendar item?"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRemove} 
              disabled={loading}
              className="bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-400"
            >
              {loading ? 'Removing...' : `Remove ${hasProposal ? '& Restore' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
};