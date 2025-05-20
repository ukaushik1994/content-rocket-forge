
import React, { memo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { contentFormats } from '@/components/content-repurposing/formats';
import ContentFormatIcon from './ContentFormatIcon';
import { ContentItemType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

interface FormatsListProps {
  item: ContentItemType;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  isMobile?: boolean;
}

const FormatsList: React.FC<FormatsListProps> = memo(({
  item,
  onOpenRepurposedContent,
  isMobile = false
}) => {
  // Check if a content item has been repurposed for a specific format
  const hasRepurposedFormat = (item: ContentItemType, formatId: string): boolean => {
    // Check if this content has repurposed formats stored in metadata
    const repurposedFormats = item.metadata?.repurposedFormats || [];
    return repurposedFormats.includes(formatId);
  };
  
  // Get only the formats that have been repurposed
  const repurposedFormats = contentFormats.filter(format => 
    hasRepurposedFormat(item, format.id)
  );
  
  if (repurposedFormats.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={isMobile ? 100 : 300}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-wrap gap-1 sm:gap-2"
      >
        {repurposedFormats.map(format => (
          <ContentFormatIcon 
            key={format.id}
            formatId={format.id}
            isFormatUsed={true}
            onClick={(e) => {
              e.stopPropagation();
              onOpenRepurposedContent(item.id, format.id);
            }}
            isMobile={isMobile}
          />
        ))}
      </motion.div>
    </TooltipProvider>
  );
});

FormatsList.displayName = 'FormatsList';

export default FormatsList;
