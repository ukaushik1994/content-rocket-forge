
import React, { memo } from 'react';
import { getFormatByIdOrDefault } from '../formats';
import ContentPreview from '../dialog/ContentPreview';

interface ContentViewerProps {
  content: string;
  formatId: string;
}

const ContentViewer: React.FC<ContentViewerProps> = memo(({ content, formatId }) => {
  // Safety check - ensure content is defined before rendering
  if (!content) {
    return (
      <div className="flex-1 overflow-auto bg-muted/10 rounded-md p-4 mb-4 text-muted-foreground">
        No content available for this format.
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-auto bg-muted/10 rounded-md p-4 mb-4">
      <ContentPreview content={content} formatId={formatId} />
    </div>
  );
});

ContentViewer.displayName = 'ContentViewer';

export default ContentViewer;
