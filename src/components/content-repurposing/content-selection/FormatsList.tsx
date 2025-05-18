
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import ContentFormatIcon from './ContentFormatIcon';
import { ContentItemType } from '@/contexts/content/types';

interface FormatsListProps {
  item: ContentItemType;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
}

const FormatsList: React.FC<FormatsListProps> = ({
  item,
  onOpenRepurposedContent
}) => {
  // Check if a content item has been repurposed for a specific format
  const hasRepurposedFormat = (item: ContentItemType, formatId: string): boolean => {
    // Check if this content has repurposed formats stored in metadata
    const repurposedFormats = item.metadata?.repurposedFormats || [];
    return repurposedFormats.includes(formatId);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-2">
      <TooltipProvider>
        {contentFormats.map(format => {
          const isFormatUsed = hasRepurposedFormat(item, format.id);
          return (
            <ContentFormatIcon 
              key={format.id}
              formatId={format.id}
              isFormatUsed={isFormatUsed}
              onClick={(e) => {
                if (isFormatUsed) {
                  e.stopPropagation();
                  onOpenRepurposedContent(item.id, format.id);
                }
              }}
            />
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default FormatsList;
