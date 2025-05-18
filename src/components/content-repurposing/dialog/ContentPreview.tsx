
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
      transition={{ delay: 0.05 }}
      className="flex-1 px-5 py-6 overflow-hidden bg-black/50"
    >
      <ScrollArea className="h-[calc(min(50vh,400px))] w-full pr-2">
        <div className="rounded-md text-white/90">
          <pre className="whitespace-pre-wrap text-sm font-mono bg-black/20 p-4 rounded-lg border border-white/5 overflow-x-auto">
            {content}
          </pre>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default ContentPreview;
