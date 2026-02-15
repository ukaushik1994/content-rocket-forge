import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Clock, AlertCircle, CheckCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreadListProps {
  threads: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

const statusIcons: Record<string, { icon: any; color: string }> = {
  needs_reply: { icon: AlertCircle, color: 'text-amber-400' },
  waiting: { icon: Clock, color: 'text-blue-400' },
  closed: { icon: CheckCircle, color: 'text-emerald-400' },
};

export const ThreadList: React.FC<ThreadListProps> = ({ threads, selectedId, onSelect, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">Loading threads...</div>;
  }

  if (threads.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground space-y-2">
        <User className="h-8 w-8 mx-auto opacity-30" />
        <p>No threads found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/20 max-h-[500px] overflow-y-auto">
      {threads.map((thread: any) => {
        const contact = thread.engage_contacts;
        const contactName = contact ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email : 'Unknown';
        const statusInfo = statusIcons[thread.status] || statusIcons.needs_reply;
        const StatusIcon = statusInfo.icon;

        return (
          <div
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            className={cn(
              'p-3 cursor-pointer hover:bg-accent/30 transition-colors',
              selectedId === thread.id && 'bg-accent/50 border-l-2 border-primary'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <StatusIcon className={cn('h-3 w-3 flex-shrink-0', statusInfo.color)} />
                  <p className="text-sm font-medium text-foreground truncate">{contactName}</p>
                </div>
                <p className="text-xs text-foreground/80 truncate mt-0.5">{thread.subject || '(no subject)'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.last_activity_at), { addSuffix: true })}
                  </span>
                  {thread.tags?.length > 0 && thread.tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="h-4 text-[9px] px-1">{tag}</Badge>
                  ))}
                </div>
              </div>
              {thread.sla_deadline && new Date(thread.sla_deadline) < new Date() && (
                <Badge variant="destructive" className="text-[9px] h-4 px-1">SLA</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
