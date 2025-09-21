import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Wand, CheckCircle2, AlertCircle as AlertIcon, History } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';

interface CompactEditingSidebarProps {
  content: ContentItemType;
  editedTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onImprove: () => void;
  isSubmitting: boolean;
  isImproving: boolean;
}

export const CompactEditingSidebar: React.FC<CompactEditingSidebarProps> = ({
  content,
  editedTitle,
  onSave,
  onImprove,
  isSubmitting,
  isImproving
}) => {
  const mainKeyword = (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim();

  return (
    <div className="w-80 bg-gradient-to-br from-card/90 to-card/60 border-l border-border/50 backdrop-blur-sm">
      <div className="p-6 space-y-6">
        {/* Title Display Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground/90">Content Title</h3>
              <span className="text-xs text-muted-foreground/80">
                {editedTitle.length}/60
              </span>
            </div>
            
            <div className="p-3 rounded-md bg-muted/30 border border-border/30">
              <p className="text-sm font-medium leading-snug text-foreground" title={editedTitle}>
                {editedTitle}
              </p>
            </div>
          </div>

          {/* Status & Keywords */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Status:</span>
              <StatusBadge status={content.approval_status} showIcon={true} />
            </div>
            
            {content.keywords && content.keywords.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Keywords:</span>
                <div className="flex flex-wrap gap-1">
                  {content.keywords.map((keyword, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Keyword Check */}
            {mainKeyword && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                {editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Target keyword included</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Add target keyword</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onSave}
            disabled={isSubmitting}
            variant="outline"
            className="w-full justify-start h-10 bg-background/50 hover:bg-background/80 border-border/50 hover:border-border transition-all duration-200"
            size="sm"
          >
            <History className="h-4 w-4 mr-2.5 text-muted-foreground" />
            <span className="font-medium">
              {isSubmitting ? 'Saving Draft...' : 'Save Draft'}
            </span>
          </Button>
          
          <Button 
            onClick={onImprove}
            disabled={isImproving}
            variant="outline"
            className="w-full justify-start h-10 bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/30 text-primary hover:text-primary transition-all duration-200"
            size="sm"
          >
            <Wand className="h-4 w-4 mr-2.5" />
            <span className="font-medium">
              {isImproving ? 'Improving...' : 'Improve with AI'}
            </span>
          </Button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="pt-2 border-t border-border/30">
          <div className="text-xs text-muted-foreground/70 space-y-1">
            <div className="flex justify-between">
              <span>Save:</span>
              <kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-[10px] font-mono">⌘S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Approve:</span>
              <kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-[10px] font-mono">⌘↵</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};