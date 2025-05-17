
import React from 'react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  outline?: string[];
  showOutline?: boolean;
  solutionName?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  outline,
  showOutline,
  solutionName
}) => {
  return (
    <div className="border rounded-lg shadow-sm bg-card">
      <div className="flex flex-col md:flex-row">
        {/* Outline sidebar (if enabled) */}
        {showOutline && outline && outline.length > 0 && (
          <div className="w-full md:w-64 border-r border-border p-4 bg-muted/20">
            <h3 className="text-sm font-medium mb-2">Content Outline</h3>
            <div className="space-y-1">
              {outline.map((item, index) => (
                <div 
                  key={index}
                  className="text-xs p-2 rounded hover:bg-muted cursor-pointer"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Main editor area */}
        <div className="flex-1 p-4">
          {solutionName && (
            <div className="text-xs text-muted-foreground mb-2 bg-muted/20 p-2 rounded">
              Using solution: <span className="font-medium">{solutionName}</span>
            </div>
          )}
          
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[400px] bg-transparent border-none focus:outline-none focus:ring-0"
            placeholder="Start writing your content here..."
          />
        </div>
      </div>
    </div>
  );
};
