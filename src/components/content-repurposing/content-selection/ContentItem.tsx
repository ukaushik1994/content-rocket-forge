
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ContentItemType } from '@/contexts/content/types';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';
import SelectButton from './SelectButton';

interface ContentItemProps {
  item: ContentItemType;
  onSelect: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  savedContentFormats?: string[];
  isMobile?: boolean;
}

const ContentItem: React.FC<ContentItemProps> = memo(({
  item,
  onSelect,
  onOpenRepurposedContent,
  savedContentFormats = [],
  isMobile = false
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-900/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <ContentSummary item={item} />
              
              <div className="mt-3 sm:mt-4">
                <FormatsList 
                  item={item}
                  onOpenRepurposedContent={onOpenRepurposedContent}
                  savedContentFormats={savedContentFormats}
                  isMobile={isMobile}
                />
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <SelectButton 
                onSelect={() => onSelect(item)}
                isMobile={isMobile}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ContentItem.displayName = 'ContentItem';

export default ContentItem;
