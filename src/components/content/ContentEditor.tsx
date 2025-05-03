
import React from 'react';

interface ContentEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({ content, onContentChange }) => {
  return (
    <div className="border rounded-lg p-4 min-h-[400px]">
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full h-full min-h-[400px] focus:outline-none resize-none"
        placeholder="Start writing your content here..."
      />
    </div>
  );
};
