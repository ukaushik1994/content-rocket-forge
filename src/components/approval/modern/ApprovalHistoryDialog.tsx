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
    <div className="max-h-48 overflow-y-auto">
      <div className="space-y-2">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">No history found.</p>
        ) : (
          history.slice(0, 5).map((h) => (
            <div key={h.id} className="p-2 rounded border border-border/30 bg-background/30">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium">{h.action}</div>
                <div className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                {h.from_status && <Badge variant="outline" className="text-[9px] px-1 py-0">{h.from_status}</Badge>}
                {h.to_status && <span className="mx-1">→</span>}
                {h.to_status && <Badge variant="outline" className="text-[9px] px-1 py-0">{h.to_status}</Badge>}
              </div>
              {h.notes && <p className="mt-1 text-[10px] text-foreground/70 truncate">{h.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
