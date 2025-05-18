
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
      className="flex-1 px-6 py-4 overflow-hidden"
    >
      <ScrollArea className="h-[calc(50vh-160px)] w-full rounded-md">
        <div className="bg-black/30 p-4 rounded-md border border-white/10">
          <pre className="whitespace-pre-wrap text-sm font-mono text-white/90">{content}</pre>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default ContentPreview;
