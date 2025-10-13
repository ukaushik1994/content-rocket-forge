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
  AlertTriangle,
  RotateCcw,
  Send
} from 'lucide-react';
import { calendarActionsService } from '@/services/calendarActionsService';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface CalendarItemActionsProps {
  calendarItem: any;
  onRefresh?: () => void;
  compact?: boolean;
  onGenerateContent?: (item: any) => void;
}

export const CalendarItemActions = ({ calendarItem, onRefresh, compact = false, onGenerateContent }: CalendarItemActionsProps) => {
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [removeReason, setRemoveReason] = useState('');
  const [restoreReason, setRestoreReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Debug log on component mount
  console.log('🔧 CalendarItemActions mounted for item:', {
    id: calendarItem?.id,
    title: calendarItem?.title,
    proposal_id: calendarItem?.proposal_id
  });

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

  const handleRemoveOnly = async () => {
    if (!calendarItem?.id) {
      console.error('❌ No calendar item ID provided for deletion');
      toast.error('Cannot delete: Invalid calendar item');
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Starting calendar item deletion (remove only):', {
        calendarItemId: calendarItem.id,
        reason: removeReason || 'User requested removal'
      });

      // Get current user for authentication check
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Authentication failed:', authError);
        toast.error('You must be logged in to delete calendar items');
        return;
      }

      console.log('✅ User authenticated:', user.id);
      
      // Verify ownership before deletion
      const { data: itemCheck, error: checkError } = await supabase
        .from('content_calendar')
        .select('user_id, title')
        .eq('id', calendarItem.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Failed to verify calendar item ownership:', checkError);
        toast.error(`Database error: ${checkError.message}`);
        return;
      }

      if (!itemCheck) {
        console.error('❌ Calendar item not found:', calendarItem.id);
        toast.error('Calendar item not found - it may have already been deleted');
        onRefresh?.(); // Refresh to sync UI
        return;
      }

      if (itemCheck.user_id !== user.id) {
        console.error('❌ User does not own this calendar item:', {
          itemUserId: itemCheck.user_id,
          currentUserId: user.id
        });
        toast.error('You do not have permission to delete this item');
        return;
      }

      // Delete the calendar item
      const { error: deleteError } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', calendarItem.id)
        .eq('user_id', user.id); // Double check with RLS

      if (deleteError) {
        console.error('❌ Failed to delete calendar item:', deleteError);
        toast.error(`Failed to delete calendar item: ${deleteError.message}`);
        return;
      }

      console.log('✅ Calendar item deleted successfully:', calendarItem.id);
      toast.success('Calendar item removed successfully');
      
      setRemoveDialogOpen(false);
      setRemoveReason('');
      
      // Refresh data
      console.log('🔄 Refreshing calendar data...');
      onRefresh?.();
      
    } catch (error: any) {
      console.error('❌ Error in calendar item deletion:', {
        error: error.message || error,
        calendarItemId: calendarItem.id,
        stack: error.stack
      });
      
      toast.error(error.message || 'Failed to delete calendar item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAndRestore = async () => {
    if (!calendarItem?.id) {
      console.error('❌ No calendar item ID provided for removal');
      toast.error('Cannot remove: Invalid calendar item');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Starting calendar item removal with proposal restoration:', {
        calendarItemId: calendarItem.id,
        proposalId: calendarItem.proposal_id,
        reason: restoreReason || 'User requested removal and restoration'
      });

      await calendarActionsService.removeCalendarItemAndRestoreProposal(
        calendarItem.id,
        restoreReason || 'User requested removal and restoration'
      );
      
      setRestoreDialogOpen(false);
      setRestoreReason('');
      
      // Refresh data
      console.log('🔄 Refreshing calendar data...');
      onRefresh?.();
      
    } catch (error: any) {
      console.error('❌ Error in calendar item removal and restoration:', {
        error: error.message || error,
        calendarItemId: calendarItem.id,
        stack: error.stack
      });
      
      toast.error(error.message || 'Failed to remove calendar item and restore proposal');
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
                Remove
              </DropdownMenuItem>
              {hasProposal && (
                <DropdownMenuItem 
                  onClick={() => setRestoreDialogOpen(true)}
                  className="text-green-400 focus:text-green-400"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Remove & Restore
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        {renderPostponeDialog()}
        {renderRemoveDialog()}
        {renderRestoreDialog()}
      </>
    );
  }

  // Full size actions
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔘 Full-size Create Content button clicked for item:', calendarItem?.id);
            if (onGenerateContent) {
              console.log('✅ Calling onGenerateContent...');
              onGenerateContent(calendarItem);
            } else {
              console.error('❌ onGenerateContent is not defined!');
            }
          }}
          size="sm"
          variant="outline"
          className="gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30"
        >
          <Send className="h-4 w-4" />
          Create Content
        </Button>
        
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
          Remove
        </Button>
        
        {hasProposal && (
          <Button
            onClick={() => setRestoreDialogOpen(true)}
            size="sm"
            variant="outline"
            className="gap-2 bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30"
          >
            <RotateCcw className="h-4 w-4" />
            Remove & Restore
          </Button>
        )}
      </div>

      {/* Dialogs */}
      {renderPostponeDialog()}
      {renderRemoveDialog()}
      {renderRestoreDialog()}
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
              Remove Calendar Item
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg">
              <p className="text-sm text-white/80">
                This will remove "{calendarItem.title}" from your calendar.
                {hasProposal && (
                  <>
                    <br />
                    <span className="text-yellow-400">
                      ⚠️ The associated proposal will remain scheduled.
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
              onClick={handleRemoveOnly} 
              disabled={loading}
              className="bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-400"
            >
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderRestoreDialog() {
    return (
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400">
              Remove Calendar Item & Restore Proposal
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
              <p className="text-sm text-white/80">
                This will remove "{calendarItem.title}" from your calendar.
                <br />
                <span className="text-green-400">
                  ✓ The associated proposal will be restored to "Available" status.
                </span>
              </p>
            </div>

            <div>
              <Label htmlFor="restore_reason" className="text-white">Reason (Optional)</Label>
              <Textarea
                id="restore_reason"
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="Why are you removing this calendar item and restoring the proposal?"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRemoveAndRestore} 
              disabled={loading}
              className="bg-green-500/20 hover:bg-green-500/30 border-green-400/30 text-green-400"
            >
              {loading ? 'Removing & Restoring...' : 'Remove & Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
};