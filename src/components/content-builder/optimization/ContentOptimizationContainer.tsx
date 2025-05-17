
import React from 'react';

interface ContentOptimizationContainerProps {
  contentValue: string;
  onRewriteSection: (section: string) => void;
}

export const ContentOptimizationContainer: React.FC<ContentOptimizationContainerProps> = ({
  contentValue,
  onRewriteSection
}) => {
  // For this simplified version, let's just show the content in a textarea
  return (
    <div className="border rounded-xl shadow-md bg-background p-4 h-full">
      <h3 className="font-medium mb-2">Content Preview</h3>
      <div className="min-h-[300px] max-h-[500px] overflow-y-auto p-4 border rounded">
        {contentValue ? (
          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: contentValue.replace(/\n/g, '<br />') }}
          />
        ) : (
          <p className="text-muted-foreground">No content to optimize yet</p>
        )}
      </div>
      <div className="mt-4">
        <button
          className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded hover:bg-purple-500/20 transition-colors"
          onClick={() => onRewriteSection(contentValue)}
        >
          Optimize Entire Content
        </button>
      </div>
    </div>
  );
};
