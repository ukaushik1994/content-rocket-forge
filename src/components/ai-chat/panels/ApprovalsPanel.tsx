import React, { useState, useMemo } from 'react';
import { PanelShell } from './PanelShell';
import { ContentProvider, useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, XCircle, MessageSquare, ArrowLeft, 
  ExternalLink, Clock, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const approvalStatusColor: Record<string, string> = {
  pending_review: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  in_review: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  needs_changes: 'bg-orange-500/15 text-orange-500 border-orange-500/20',
  approved: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-destructive/15 text-destructive border-destructive/20',
};

const ApprovalsPanelInner: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { contentItems, loading, refreshContent } = useContent();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ContentItemType | null>(null);
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);

  const pendingItems = useMemo(() => 
    contentItems.filter(c => 
      ['pending_review', 'in_review', 'needs_changes'].includes(c.approval_status)
    ), [contentItems]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    setActing(true);
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ approval_status: action })
        .eq('id', selectedItem.id);
      
      if (error) throw error;

      toast.success(action === 'approved' ? 'Content approved!' : 'Content rejected.');
      await refreshContent();
      setSelectedItem(null);
      setComment('');
      
      // Auto-close if no more pending items
      const remaining = pendingItems.filter(i => i.id !== selectedItem.id);
      if (remaining.length === 0) {
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      toast.error('Action failed. Please try again.');
    } finally {
      setActing(false);
    }
  };

  // Detail / action view
  if (selectedItem) {
    return (
      <PanelShell isOpen={isOpen} onClose={onClose} title="Approvals" icon={<CheckCircle className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(null); setComment(''); }} className="text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { onClose(); navigate('/content-approval'); }}
              className="text-xs"
            >
              Open Page <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            <Badge variant="outline" className={cn('text-[10px]', approvalStatusColor[selectedItem.approval_status])}>
              {selectedItem.approval_status.replace(/_/g, ' ')}
            </Badge>
            <h3 className="text-lg font-semibold text-foreground leading-tight">{selectedItem.title}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedItem.content_type} · Updated {formatDistanceToNow(new Date(selectedItem.updated_at), { addSuffix: true })}
            </p>
          </div>

          {/* Content preview */}
          <div className="border border-border/10 rounded-lg p-4 bg-muted/20 max-h-[240px] overflow-y-auto">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: selectedItem.content?.slice(0, 2000) || '<p class="text-muted-foreground">No content.</p>' }}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Add a comment (optional)</label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Feedback or notes..."
              className="min-h-[80px] text-sm bg-muted/20 border-border/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleAction('approved')}
              disabled={acting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="sm"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approve
            </Button>
            <Button
              onClick={() => handleAction('rejected')}
              disabled={acting}
              variant="outline"
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              size="sm"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
            </Button>
          </div>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell isOpen={isOpen} onClose={onClose} title="Approvals" icon={<CheckCircle className="h-4 w-4" />}>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pendingItems.length} pending item{pendingItems.length !== 1 ? 's' : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onClose(); navigate('/content-approval'); }}
            className="text-xs"
          >
            Open Page <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mb-3 opacity-40" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs mt-1">No content pending review.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {pendingItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg",
                  "hover:bg-muted/40 transition-colors",
                  "border border-transparent hover:border-border/20",
                  "group"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-muted/30">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', approvalStatusColor[item.approval_status])}>
                        {item.approval_status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  );
};

export const ApprovalsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = (props) => (
  <ContentProvider>
    <ApprovalsPanelInner {...props} />
  </ContentProvider>
);
