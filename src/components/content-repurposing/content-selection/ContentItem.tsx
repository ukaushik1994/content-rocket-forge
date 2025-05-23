
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ContentItemType } from '@/contexts/content/types';
import SelectButton from './SelectButton';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface ContentItemProps {
  content: ContentItemType;
  onSelect: () => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  savedFormats?: string[];
}

export const ContentItem: React.FC<ContentItemProps> = ({ 
  content, 
  onSelect, 
  onOpenRepurposedContent,
  savedFormats = [] 
}) => {
  const hasRepurposedFormats = savedFormats.length > 0;
  const date = content.created_at ? new Date(content.created_at) : new Date();
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  return (
    <Card 
      className="content-item hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-white/10"
      onClick={(e) => {
        // Prevent click if we clicked on a button inside
        if ((e.target as Element).closest('button')) {
          return;
        }
        onSelect();
      }}
    >
      <div className="p-6 flex-1 space-y-4">
        <ContentSummary item={content} timeAgo={timeAgo} />
        
        {/* Content Types Created Section */}
        <div className="space-y-3">
          {hasRepurposedFormats ? (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon-purple" />
                <span className="text-sm font-medium text-muted-foreground">
                  Generated Formats ({savedFormats.length})
                </span>
              </div>
              <FormatsList 
                item={content}
                savedContentFormats={savedFormats}
                onOpenRepurposedContent={onOpenRepurposedContent}
              />
            </>
          ) : (
            <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
              <span className="text-sm text-muted-foreground italic">
                No formats generated yet
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t border-white/10 p-4 bg-gradient-to-r from-muted/5 to-muted/10 flex justify-between items-center">
        {hasRepurposedFormats && (
          <Badge variant="secondary" className="bg-neon-purple/10 text-neon-purple border-neon-purple/20">
            {savedFormats.length} format{savedFormats.length !== 1 ? 's' : ''} ready
          </Badge>
        )}
        <div className={hasRepurposedFormats ? '' : 'ml-auto'}>
          <SelectButton onSelect={onSelect} />
        </div>
      </div>
    </Card>
  );
};

export default ContentItem;
