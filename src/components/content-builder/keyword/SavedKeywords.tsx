
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const SavedKeywords: React.FC = () => {
  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="font-medium mb-2">Saved Keywords</h3>
      <p className="text-sm text-muted-foreground mb-3">
        This feature has been removed. Please use the Content Builder for keyword management.
      </p>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => toast.info("Keywords feature has been integrated into the Content Builder")}
      >
        Learn More
      </Button>
    </div>
  );
};
