import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { StickyNote, MessageCircle } from 'lucide-react';

interface FloatingNotesWidgetProps {
  approvalNotes: string;
  onNotesChange: (notes: string) => void;
  approvalStatus?: string;
}

export const FloatingNotesWidget: React.FC<FloatingNotesWidgetProps> = ({
  approvalNotes,
  onNotesChange,
  approvalStatus
}) => {
  const hasNotes = approvalNotes.trim().length > 0;
  const isReviewMode = approvalStatus === 'pending_review' || approvalStatus === 'in_review';

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-800/20 to-amber-900/20 rounded-lg border border-amber-500/20">
      <div className="flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-200">
          {isReviewMode ? 'Review Notes' : 'Notes'}
        </span>
        {hasNotes && (
          <Badge variant="secondary" className="h-5 text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
            {approvalNotes.length > 50 ? `${approvalNotes.substring(0, 47)}...` : approvalNotes}
          </Badge>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 p-0 ${hasNotes ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-300'}`}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-card/95 backdrop-blur-sm border-white/10">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              {isReviewMode ? 'Review Notes & Feedback' : 'Notes'}
            </h4>
            <Textarea
              placeholder={
                isReviewMode 
                  ? "Provide feedback, suggestions, or reasons for your decision..."
                  : "Add any notes about this content..."
              }
              value={approvalNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="min-h-[120px] bg-background/50 border-white/10 focus-visible:ring-primary/50 resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {isReviewMode 
                ? 'Your feedback will be sent to the content author.'
                : 'Notes are saved automatically.'}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};