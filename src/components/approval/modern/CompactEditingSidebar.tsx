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
    <div className="w-80 bg-card border-l border-border p-6 space-y-6">
      {/* Title Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-muted-foreground">Title ({editedTitle.length}/60)</label>
          {mainKeyword && (
            <div className={`text-[10px] ${editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? 'text-green-500' : 'text-amber-500'}`}>
              {editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? (
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Keyword included
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <AlertIcon className="h-3 w-3" /> Add keyword
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="text-sm font-medium" title={editedTitle}>
          {editedTitle}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={content.approval_status} showIcon={true} />
          {content.keywords && content.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.keywords.map((keyword, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t">
        <Button 
          onClick={onSave}
          disabled={isSubmitting}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <History className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Draft'}
        </Button>
        
        <Button 
          onClick={onImprove}
          disabled={isImproving}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Wand className="h-4 w-4 mr-2" />
          {isImproving ? 'Improving...' : 'Improve'}
        </Button>
      </div>
    </div>
  );
};