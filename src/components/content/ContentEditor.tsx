
import React from 'react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange
}) => {
  // ContentEditor component implementation
  // This is a placeholder for the actual implementation
  return (
    <div className="prose dark:prose-invert max-w-none">
      {content}
    </div>
  );
};
