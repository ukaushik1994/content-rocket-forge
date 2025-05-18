
import React from 'react';

interface ContentPreviewProps {
  content: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ content }) => {
  return (
    <div className="flex-1 overflow-auto my-4 bg-black/30 p-4 rounded">
      <pre className="whitespace-pre-wrap text-sm">{content}</pre>
    </div>
  );
};

export default ContentPreview;
