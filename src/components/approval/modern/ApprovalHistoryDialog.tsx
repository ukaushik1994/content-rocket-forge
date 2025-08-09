import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ApprovalHistoryType } from '@/contexts/content/types';

interface ApprovalHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  contentTitle?: string;
  history: ApprovalHistoryType[];
}

export const ApprovalHistoryDialog: React.FC<ApprovalHistoryDialogProps> = ({ open, onClose, contentTitle, history }) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approval History{contentTitle ? ` — ${contentTitle}` : ''}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No approval history found.</p>
            ) : (
              history.map((h) => (
                <div key={h.id} className="p-3 rounded-lg border border-border/50 bg-background/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">{h.action}</div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {h.from_status && <Badge variant="outline">{h.from_status}</Badge>}
                    {h.to_status && <span className="mx-1">→</span>}
                    {h.to_status && <Badge variant="outline">{h.to_status}</Badge>}
                  </div>
                  {h.notes && <p className="mt-2 text-sm text-foreground/80">{h.notes}</p>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
