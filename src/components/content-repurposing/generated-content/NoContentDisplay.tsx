
import React from 'react';
import { FileText } from 'lucide-react';

const NoContentDisplay: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Content Generated Yet</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Select content formats from the left panel and click "Generate" to transform your content
      </p>
    </div>
  );
};

export default NoContentDisplay;
