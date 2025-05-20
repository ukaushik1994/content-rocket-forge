
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { getFormatByIdOrDefault } from '../formats';
import ContentPreview from '../dialog/ContentPreview';

interface ContentViewerProps {
  content: string;
  formatId: string;
  previewMode?: boolean;
}

const ContentViewer: React.FC<ContentViewerProps> = memo(({ 
  content, 
  formatId,
  previewMode = true 
}) => {
  // Safety check - ensure content is defined before rendering
  if (!content) {
    return (
      <div className="flex-1 overflow-auto rounded-md p-4 mb-4 text-muted-foreground bg-black/30 backdrop-blur-sm border border-white/5">
        No content available for this format.
      </div>
    );
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  return (
    <motion.div
      key={formatId}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 overflow-auto rounded-md p-4 mb-4 glass-panel neon-border"
    >
      {previewMode ? (
        <ContentPreview content={content} formatId={formatId} />
      ) : (
        <pre className="whitespace-pre-wrap text-xs font-mono overflow-auto p-4 rounded-md text-white/90 custom-scrollbar max-h-full">
          {content}
        </pre>
      )}
    </motion.div>
  );
});

ContentViewer.displayName = 'ContentViewer';

export default ContentViewer;
