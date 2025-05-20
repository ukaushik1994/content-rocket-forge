
import React, { memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import SelectButton from './SelectButton';

interface ContentItemProps {
  item: ContentItemType;
  onSelect: () => void;
  isMobile?: boolean;
  formatsComponent?: React.ReactNode;
}

const ContentItem: React.FC<ContentItemProps> = memo(({
  item,
  onSelect,
  isMobile = false,
  formatsComponent
}) => {
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
        onClick={onSelect}
      >
        <CardHeader className={`${isMobile ? 'pb-2 pt-3 px-3' : 'pb-3'}`}>
          <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-white line-clamp-2`}>
            {item.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className={`flex-grow ${isMobile ? 'px-3' : ''}`}>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground line-clamp-3 mb-3`}>
            {item.content?.substring(0, isMobile ? 100 : 150)}...
          </p>
          
          {formatsComponent}
        </CardContent>
        
        <CardFooter className={`${isMobile ? 'pt-2 px-3 pb-3' : 'pt-3'} border-t border-white/10`}>
          <SelectButton 
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }} 
            isMobile={isMobile}
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
});

ContentItem.displayName = 'ContentItem';

export default ContentItem;
