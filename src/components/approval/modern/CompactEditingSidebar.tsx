import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Wand, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { SmartActionBar } from '@/components/smart-actions/SmartActionBar';
import { SidebarToolsGrid } from './SidebarToolsGrid';

interface CompactEditingSidebarProps {
  content: ContentItemType;
  editedTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onImprove: () => void;
  isSubmitting: boolean;
  isImproving: boolean;
  // SmartActionBar props
  recommendation?: any;
  approvalNotes?: string;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onReject?: () => void;
  onSubmitForReview?: () => void;
  // Tools grid props
  onTitleSelect: (title: string) => void;
  onSectionRegenerated: (updatedContent: string) => void;
}

export const CompactEditingSidebar: React.FC<CompactEditingSidebarProps> = ({
  content,
  editedTitle,
  onTitleChange,
  onSave,
  onImprove,
  isSubmitting,
  isImproving,
  recommendation,
  approvalNotes,
  onApprove,
  onRequestChanges,
  onReject,
  onSubmitForReview,
  onTitleSelect,
  onSectionRegenerated
}) => {
  const mainKeyword = (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim();
  const titleIncludesKeyword = mainKeyword && editedTitle.toLowerCase().includes(mainKeyword.toLowerCase());

  return (
    <div className="w-full md:w-2/5 lg:w-80 glass-card border-l border-border/30 h-full flex flex-col backdrop-blur-xl">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title Display Summary */}
        <div className="space-y-3 p-4 glass-card bg-card/40 backdrop-blur-sm ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Content Overview</h3>
            <StatusBadge status={content.approval_status} showIcon={true} />
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-white/90 truncate" title={editedTitle}>
              {editedTitle}
            </div>
            <div className="text-xs text-muted-foreground">
              {editedTitle.length}/60 characters
            </div>
            {mainKeyword && (
              <div className={`flex items-center gap-1 text-xs ${titleIncludesKeyword ? 'text-green-400' : 'text-amber-400'}`}>
                {titleIncludesKeyword ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Keyword included
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Add keyword: "{mainKeyword}"
                  </>
                )}
              </div>
            )}
          </div>

          {/* Keywords Display */}
          {content.keywords && content.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.keywords.map((keyword, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {/* Title Editing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Title</label>
            <span className={`text-xs ${editedTitle.length > 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {editedTitle.length}/60
            </span>
          </div>
          <Input
            value={editedTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter title..."
            className="bg-background/50"
          />
          {mainKeyword && (
            <div className={`flex items-center gap-1 text-xs ${titleIncludesKeyword ? 'text-green-500' : 'text-amber-500'}`}>
              {titleIncludesKeyword ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Keyword included
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Add main keyword: "{mainKeyword}"
                </>
              )}
            </div>
          )}
        </div>

        {/* Content Tools Grid */}
        <SidebarToolsGrid
          content={content}
          editedTitle={editedTitle}
          onTitleChange={(e) => onTitleChange(e.target.value)}
          onTitleSelect={onTitleSelect}
          onSectionRegenerated={onSectionRegenerated}
          mainKeyword={(content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim()}
        />

        {/* Action Buttons */}
        <div className="space-y-3 p-4 glass-card bg-card/40 backdrop-blur-sm ring-1 ring-white/5">
          <Button 
            onClick={onSave}
            disabled={isSubmitting}
            variant="outline"
            className="w-full bg-card/30 border-border/30 hover:bg-card/50 backdrop-blur-sm"
            size="sm"
          >
            <History className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button 
            onClick={onImprove}
            disabled={isImproving}
            variant="outline"
            className="w-full bg-card/30 border-border/30 hover:bg-card/50 backdrop-blur-sm"
            size="sm"
          >
            <Wand className="h-4 w-4 mr-2" />
            {isImproving ? 'Improving...' : 'Improve'}
          </Button>

          {/* Smart Action Bar */}
          {onApprove && onRequestChanges && onReject && onSubmitForReview && (
            <div className="pt-2 border-t border-border/20">
              <SmartActionBar
                context={{ approvalStatus: content.approval_status, contentId: content.id }}
                disabled={isSubmitting}
                hasNotes={Boolean(approvalNotes?.trim())}
                recommendation={recommendation}
                onApprove={onApprove}
                onRequestChanges={onRequestChanges}
                onReject={onReject}
                onSubmitForReview={onSubmitForReview}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};