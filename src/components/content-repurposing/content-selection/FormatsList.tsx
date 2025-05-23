
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
  // Get repurposed formats from the content item's metadata
  const repurposedFormatIds = item.metadata?.repurposedFormats || [];
  
  // Get the format details for the repurposed formats
  const repurposedFormats = contentFormats.filter(format => 
    repurposedFormatIds.includes(format.id)
  );
  
  if (repurposedFormats.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={isMobile ? 100 : 300}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
      >
        {repurposedFormats.map((format, index) => {
          return (
            <motion.div
              key={format.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <ContentFormatIcon 
                formatId={format.id}
                isFormatUsed={true}
                isSaved={true}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRepurposedContent(item.id, format.id);
                }}
                isMobile={isMobile}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </TooltipProvider>
  );
});

FormatsList.displayName = 'FormatsList';

export default FormatsList;
