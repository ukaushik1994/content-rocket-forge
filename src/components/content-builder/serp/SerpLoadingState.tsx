
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SerpLoadingStateProps {
  isLoading?: boolean; // Made optional so we can use it with or without this prop
  navigateToStep: (step: number) => void;
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({ 
  isLoading = false, // Default value if not provided
  navigateToStep 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
      {isLoading ? (
        <>
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse"></div>
            <Loader2 className="h-12 w-12 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Search Results</h3>
            <p className="text-muted-foreground max-w-md">
              We're processing search data to provide you with the most relevant keywords, questions, and content ideas.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="rounded-full bg-muted/30 p-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">No Analysis Results</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              Enter a keyword in the previous step to analyze search results and get content insights.
            </p>
            <Button onClick={() => navigateToStep(0)} variant="outline">
              Go to Keyword Selection
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
