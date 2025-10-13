import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Save, Wand, CheckCircle2, AlertCircle, History, MessageSquare, ChevronDown, ChevronUp, FileText } from 'lucide-react';
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
  approvalNotes?: string;
  setApprovalNotes?: (notes: string) => void;
  onApprove?: () => void;
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
  approvalNotes,
  setApprovalNotes,
  onApprove,
  onTitleSelect,
  onSectionRegenerated
}) => {
  const [notesExpanded, setNotesExpanded] = useState(Boolean(approvalNotes?.trim()));
  const [saveStatus, setSaveStatus] = useState<'saved' | 'typing' | 'saving'>('saved');
  
  const mainKeyword = (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim();
  const titleIncludesKeyword = mainKeyword && editedTitle.toLowerCase().includes(mainKeyword.toLowerCase());

  // Auto-save notes with debounce
  useEffect(() => {
    if (!setApprovalNotes || !approvalNotes) return;
    
    setSaveStatus('typing');
    const timer = setTimeout(() => {
      setSaveStatus('saved');
    }, 800);

    return () => clearTimeout(timer);
  }, [approvalNotes, setApprovalNotes]);

  // Auto-expand when notes are added
  useEffect(() => {
    if (approvalNotes?.trim() && !notesExpanded) {
      setNotesExpanded(true);
    }
  }, [approvalNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (setApprovalNotes) {
      setApprovalNotes(e.target.value);
      setSaveStatus('typing');
    }
  };

  const getNotesPlaceholder = () => {
    if (content.approval_status === 'pending_review' || content.approval_status === 'in_review') {
      return "Provide feedback, suggestions, or reasons for your decision...";
    }
    return "Add any notes about this content...";
  };

  return (
    <div className="w-full md:w-2/5 lg:w-80 bg-black border-l border-white/10 h-full flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title Display Summary */}
        <div className="mt-8 space-y-3 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Content Overview</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={onSave}
                disabled={isSubmitting}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80"
                title={isSubmitting ? 'Saving...' : 'Save Draft'}
              >
                <History className="h-3 w-3" />
              </Button>
              <StatusBadge status={content.approval_status} showIcon={true} />
            </div>
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

        {/* Notes Section */}
        {setApprovalNotes && (
          <div className="space-y-3 p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-lg border border-white/10">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setNotesExpanded(!notesExpanded)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-white/70" />
                <h3 className="text-sm font-medium text-white/80">
                  {content.approval_status === 'pending_review' || content.approval_status === 'in_review' 
                    ? 'Review Notes' : 'Notes'}
                </h3>
                {approvalNotes?.trim() && (
                  <Badge variant="secondary" className="h-4 text-xs bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                    {approvalNotes.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === 'typing' && (
                  <span className="text-xs text-amber-400">typing...</span>
                )}
                {saveStatus === 'saved' && approvalNotes?.trim() && (
                  <span className="text-xs text-green-400">saved</span>
                )}
                {notesExpanded ? (
                  <ChevronUp className="h-4 w-4 text-white/50" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white/50" />
                )}
              </div>
            </div>
            
            {notesExpanded && (
              <div className="space-y-2">
                <Textarea
                  value={approvalNotes || ''}
                  onChange={handleNotesChange}
                  placeholder={getNotesPlaceholder()}
                  className="min-h-[80px] bg-gray-900/40 border-white/10 focus-visible:ring-neon-purple/50 text-white/90 placeholder:text-white/40 resize-none"
                  onFocus={() => setNotesExpanded(true)}
                />
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{approvalNotes?.length || 0} characters</span>
                  {approvalNotes?.trim() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setApprovalNotes?.('')}
                      className="h-5 px-2 text-xs text-white/50 hover:text-white/70"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Smart Action Bar */}
        {onApprove && (
          <div className="space-y-3 p-4 bg-gradient-to-br from-gray-800/20 to-gray-900/20 rounded-lg border border-white/10">
            <SmartActionBar
              context={{ approvalStatus: content.approval_status, contentId: content.id }}
              disabled={isSubmitting}
              onApprove={onApprove}
            />
          </div>
        )}

      </div>
    </div>
  );
};