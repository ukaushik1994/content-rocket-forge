import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Wand, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContent } from '@/contexts/content';
import { useApproval } from '../context/ApprovalContext';
import { toast } from 'sonner';

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
  onTitleChange,
  onSave,
  onImprove,
  isSubmitting,
  isImproving
}) => {
  const [metaDescription, setMetaDescription] = useState(content.metadata?.metaDescription || '');
  const { updateContentItem } = useContent();
  
  const mainKeyword = (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim();
  const titleIncludesKeyword = mainKeyword && editedTitle.toLowerCase().includes(mainKeyword.toLowerCase());
  const descriptionIncludesKeyword = mainKeyword && metaDescription.toLowerCase().includes(mainKeyword.toLowerCase());

  const handleMetaDescriptionChange = async (value: string) => {
    setMetaDescription(value);
    
    // Auto-save meta description
    try {
      await updateContentItem(content.id, {
        metadata: {
          ...content.metadata,
          metaDescription: value
        }
      });
    } catch (error) {
      console.error('Failed to save meta description:', error);
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border h-full flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Meta Description</label>
            <span className={`text-xs ${metaDescription.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {metaDescription.length}/160
            </span>
          </div>
          <Textarea
            value={metaDescription}
            onChange={(e) => handleMetaDescriptionChange(e.target.value)}
            placeholder="Enter meta description..."
            className="bg-background/50 min-h-[80px] resize-none"
          />
          {mainKeyword && (
            <div className={`flex items-center gap-1 text-xs ${descriptionIncludesKeyword ? 'text-green-500' : 'text-amber-500'}`}>
              {descriptionIncludesKeyword ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Keyword included
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Add main keyword
                </>
              )}
            </div>
          )}
        </div>

        {/* Keywords */}
        {content.keywords && content.keywords.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <div className="flex flex-wrap gap-1">
              {content.keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Badge variant={
            content.approval_status === 'approved' ? 'default' :
            content.approval_status === 'rejected' ? 'destructive' :
            content.approval_status === 'needs_changes' ? 'secondary' :
            'outline'
          }>
            {content.approval_status?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="flex-shrink-0 p-6 pt-4 border-t bg-card/80 backdrop-blur-sm">
        <div className="space-y-3">
          <Button 
            onClick={onSave}
            disabled={isSubmitting}
            className="w-full"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save'}
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
    </div>
  );
};