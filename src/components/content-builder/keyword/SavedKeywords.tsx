
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const SavedKeywords: React.FC = () => {
  return (
    <div className="text-center p-4 border rounded-md">
      <p className="text-muted-foreground">
        Saved keywords from your account will appear here.
      </p>
      <Button 
        variant="outline" 
        className="mt-2"
        onClick={() => toast.info("This would load your saved keywords from the database")}
      >
        Load Saved Keywords
      </Button>
    </div>
  );
};
