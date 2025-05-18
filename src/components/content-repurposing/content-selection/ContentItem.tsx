
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';
import SelectButton from './SelectButton';

interface ContentItemProps {
  item: ContentItemType;
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
}

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  onSelectContent,
  onOpenRepurposedContent
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="card-3d"
    >
      <Card 
        className="cursor-pointer hover:bg-accent/5 overflow-hidden backdrop-blur-sm bg-black/30 border border-white/10 transition-all duration-200"
        onClick={() => onSelectContent(item.id)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col">
            <ContentSummary title={item.title} content={item.content} />
            
            {/* Format indicators with animated, clickable icons */}
            <FormatsList 
              item={item}
              onOpenRepurposedContent={onOpenRepurposedContent}
            />
            
            <div className="flex justify-end mt-2">
              <SelectButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectContent(item.id);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentItem;
