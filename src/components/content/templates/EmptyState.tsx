
import React from 'react';
import { FileQuestion, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="mx-auto bg-muted w-16 h-16 rounded-full flex items-center justify-center">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium">No SERP Data Available</h3>
        <p className="text-muted-foreground max-w-md">
          {message || 
           "Please complete a SERP analysis to view content recommendations and related data."}
        </p>
        <div className="pt-2">
          <Button asChild variant="outline">
            <Link to="/settings/api">
              <Settings className="mr-2 h-4 w-4" />
              API Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
