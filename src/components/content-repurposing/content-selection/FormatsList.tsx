
import React, { memo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import ContentFormatIcon from './ContentFormatIcon';
import { ContentItemType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

interface FormatsListProps {
  item: ContentItemType;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  isMobile?: boolean;
  formatCodes?: string[];
}

const FormatsList: React.FC<FormatsListProps> = memo(({
  item,
  onOpenRepurposedContent,
  isMobile = false,
  formatCodes = []
}) => {
  // If no format codes are provided, try to get them from the item's metadata
  // This is for backward compatibility
  let repurposedFormats = formatCodes;
  
  if (repurposedFormats.length === 0 && item.metadata?.repurposedFormats) {
    repurposedFormats = item.metadata.repurposedFormats;
  }
  
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
        {repurposedFormats.map(formatId => (
          <ContentFormatIcon 
            key={formatId}
            formatId={formatId}
            isFormatUsed={true}
            onClick={(e) => {
              e.stopPropagation();
              onOpenRepurposedContent(item.id, formatId);
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
