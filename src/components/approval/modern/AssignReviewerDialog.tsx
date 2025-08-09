import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface AssignReviewerDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { reviewerId: string; dueDate?: string; priority: 'low' | 'medium' | 'high' }) => Promise<void> | void;
  defaultPriority?: 'low' | 'medium' | 'high';
}

export const AssignReviewerDialog: React.FC<AssignReviewerDialogProps> = ({ open, onClose, onSubmit, defaultPriority = 'medium' }) => {
  const [reviewerId, setReviewerId] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(defaultPriority);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reviewerId) return;
    setSubmitting(true);
    try {
      await onSubmit({ reviewerId, dueDate, priority });
      onClose();
      setReviewerId('');
      setDueDate(undefined);
      setPriority(defaultPriority);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Reviewer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer ID</Label>
            <Input id="reviewer" placeholder="Enter reviewer user UUID" value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due">Due date (optional)</Label>
            <Input id="due" type="date" value={dueDate ?? ''} onChange={(e) => setDueDate(e.target.value || undefined)} />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!reviewerId || submitting}>
            {submitting ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
