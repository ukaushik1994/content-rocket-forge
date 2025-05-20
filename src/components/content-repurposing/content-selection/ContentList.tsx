
import React, { memo } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import ContentItem from './ContentItem';
import FormatsList from './FormatsList';

interface ContentListProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  isMobile?: boolean;
  formatsMap?: Record<string, string[]>;
}

const ContentList: React.FC<ContentListProps> = memo(({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  isMobile = false,
  formatsMap = {}
}) => {
  return (
    <div className="space-y-4">
      {contentItems.map((item) => {
        // Get the formats for this content item from the formats map
        const itemFormats = formatsMap[item.id] || [];
        
        return (
          <div key={item.id} className="group">
            <ContentItem 
              item={item} 
              onSelect={() => onSelectContent(item)}
              isMobile={isMobile}
              formatsComponent={
                itemFormats.length > 0 ? (
                  <div className="mt-3 flex items-center">
                    <div className="text-xs text-gray-400 mr-2">Repurposed as:</div>
                    <FormatsList 
                      item={item} 
                      onOpenRepurposedContent={onOpenRepurposedContent} 
                      isMobile={isMobile}
                      formatCodes={itemFormats}
                    />
                  </div>
                ) : null
              }
            />
          </div>
        );
      })}
    </div>
  );
});

ContentList.displayName = 'ContentList';

export default ContentList;
