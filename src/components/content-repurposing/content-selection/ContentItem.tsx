
import React from 'react';
import { Card } from '@/components/ui/card';
import { getFormatIcon } from '../content-selection/ContentFormatIcon';
import { formatDistanceToNow } from 'date-fns';
import { ContentItemType } from '@/contexts/content/types';
import SelectButton from './SelectButton';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';

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
  const date = content.createdAt ? new Date(content.createdAt) : new Date();
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  return (
    <Card 
      className="content-item hover:border-primary transition-colors cursor-pointer overflow-hidden flex flex-col"
      onClick={(e) => {
        // Prevent click if we clicked on a button inside
        if ((e.target as Element).closest('button')) {
          return;
        }
        onSelect();
      }}
    >
      <div className="p-4 flex-1">
        <ContentSummary content={content} timeAgo={timeAgo} />
        
        {hasRepurposedFormats && (
          <FormatsList 
            contentId={content.id} 
            savedFormats={savedFormats}
            onOpenFormat={onOpenRepurposedContent}
          />
        )}
      </div>
      
      <div className="border-t p-3 bg-muted/10 flex justify-end">
        <SelectButton onSelect={onSelect} />
      </div>
    </Card>
  );
};

export default ContentItem;
