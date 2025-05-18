
import React, { memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentPreviewProps {
  content: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = memo(({ content }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.05 }}
      className="flex-1 px-3 sm:px-5 py-4 sm:py-6 overflow-hidden bg-black/50"
    >
      <ScrollArea className={`${isMobile ? 'h-[200px]' : 'h-[calc(min(50vh,400px))]'} w-full pr-2`}>
        <div className="rounded-md text-white/90">
          <pre className="whitespace-pre-wrap text-xs sm:text-sm font-mono bg-black/20 p-3 sm:p-4 rounded-lg border border-white/5 overflow-x-auto">
            {content}
          </pre>
        </div>
      </ScrollArea>
    </motion.div>
  );
});

ContentPreview.displayName = 'ContentPreview';

export default ContentPreview;
