import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Wand, CheckCircle2, AlertCircle as AlertIcon, History, Loader2 } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <div className="w-80 lg:w-80 w-full max-w-80 bg-gradient-to-br from-card/95 to-card/80 border-l border-border/50 backdrop-blur-md shadow-lg">
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          {/* Title Display Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground/90">Content Title</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      editedTitle.length > 60 ? 'bg-destructive/10 text-destructive' : 
                      editedTitle.length > 50 ? 'bg-warning/10 text-warning' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {editedTitle.length}/60
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>SEO optimal title length: 50-60 characters</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/40 transition-colors">
                <p className="text-sm font-medium leading-snug text-foreground break-words" title={editedTitle}>
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
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary/80 transition-colors cursor-help"
                          >
                            {keyword}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Target keyword for SEO optimization</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Enhanced Keyword Check */}
              {mainKeyword && (
                <div className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                  editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-amber-500/10 border border-amber-500/20'
                }`}>
                  {editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Main keyword included</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <AlertIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Include main keyword</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground/60">Actions</span>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onSave}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full justify-start h-11 bg-background/60 hover:bg-background/90 border-border/50 hover:border-border transition-all duration-200 group"
                  size="sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
                  ) : (
                    <History className="h-4 w-4 mr-2.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                  <span className="font-medium">
                    {isSubmitting ? 'Saving Draft...' : 'Save Draft'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your changes (⌘S)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onImprove}
                  disabled={isImproving}
                  variant="outline"
                  className="w-full justify-start h-11 bg-primary/5 hover:bg-primary/15 border-primary/20 hover:border-primary/40 text-primary hover:text-primary transition-all duration-200 group relative overflow-hidden"
                  size="sm"
                >
                  {isImproving && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 animate-pulse"></div>
                  )}
                  <div className="relative flex items-center">
                    {isImproving ? (
                      <Loader2 className="h-4 w-4 mr-2.5 animate-spin" />
                    ) : (
                      <Wand className="h-4 w-4 mr-2.5 group-hover:rotate-12 transition-transform duration-200" />
                    )}
                    <span className="font-medium">
                      {isImproving ? 'AI Improving...' : 'Improve with AI'}
                    </span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enhance content with AI assistance</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Enhanced Keyboard Shortcuts */}
          <div className="pt-3 border-t border-border/30">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground/80 mb-2">Keyboard Shortcuts</h4>
              <div className="space-y-1.5">
                {[
                  { label: 'Save Draft', keys: '⌘S' },
                  { label: 'Approve', keys: '⌘↵' },
                  { label: 'Request Changes', keys: '⌘⇧R' },
                  { label: 'Reject', keys: '⌘⇧X' }
                ].map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/70">{shortcut.label}:</span>
                    <kbd className="px-2 py-1 bg-muted/40 border border-border/30 rounded text-[10px] font-mono text-muted-foreground">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};