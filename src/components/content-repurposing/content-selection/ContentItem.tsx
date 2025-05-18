
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import SelectButton from './SelectButton';
import FormatsList from './FormatsList';

interface ContentItemProps {
  item: ContentItemType;
  onSelectContent: () => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
}

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  onSelectContent,
  onOpenRepurposedContent
}) => {
  // Check if the item has any repurposed formats
  const hasRepurposedContent = item.metadata?.repurposedFormats && item.metadata.repurposedFormats.length > 0;
  
  const item_animation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      variants={item_animation}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className="h-full cursor-pointer hover:bg-accent/5 overflow-hidden backdrop-blur-sm bg-black/30 border border-white/10 transition-all duration-200 flex flex-col"
        onClick={onSelectContent}
      >
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold text-lg text-white line-clamp-2">
            {item.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {item.content?.substring(0, 150)}...
          </p>
          
          {hasRepurposedContent && (
            <div className="mt-2">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Repurposed Content
              </h4>
              <FormatsList 
                item={item}
                onOpenRepurposedContent={onOpenRepurposedContent}
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-3 border-t border-white/10">
          <SelectButton onClick={(e) => {
            e.stopPropagation();
            onSelectContent();
          }} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ContentItem;
