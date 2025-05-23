
import React, { memo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { contentFormats } from '@/components/content-repurposing/formats';
import ContentFormatIcon from './ContentFormatIcon';
import { ContentItemType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

interface FormatsListProps {
  item: ContentItemType;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  savedContentFormats?: string[];
  isMobile?: boolean;
}

const FormatsList: React.FC<FormatsListProps> = memo(({
  item,
  onOpenRepurposedContent,
  savedContentFormats = [],
  isMobile = false
}) => {
  // Check if a content item has been repurposed for a specific format
  const hasRepurposedFormat = (item: ContentItemType, formatId: string): boolean => {
    const repurposedFormats = item.metadata?.repurposedFormats || [];
    return repurposedFormats.includes(formatId) || savedContentFormats.includes(formatId);
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
      >
        {repurposedFormats.map((format, index) => {
          const isSaved = savedContentFormats.includes(format.id);
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
                isSaved={isSaved}
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
