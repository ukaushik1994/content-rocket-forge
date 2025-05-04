
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  searchTerm?: string;
  onAddNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, onAddNew }) => {
  if (searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg mb-2">No solutions found matching "{searchTerm}"</p>
        <p className="text-muted-foreground">Try a different search term or clear the search</p>
      </div>
    );
  }

  return (
    <Card className="glass-panel">
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Solutions Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first business solution to start generating content that showcases your products or services.
        </p>
        <Button
          onClick={onAddNew}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Solution
        </Button>
      </CardContent>
    </Card>
  );
};
