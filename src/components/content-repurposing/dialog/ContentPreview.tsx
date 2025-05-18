
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface ContentPreviewProps {
  content: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 px-4 py-5 overflow-hidden"
    >
      <ScrollArea className="h-[calc(50vh-160px)] w-full">
        <div className="rounded-md text-white/90">
          <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default ContentPreview;
