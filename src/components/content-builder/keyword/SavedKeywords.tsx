
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const SavedKeywords: React.FC = () => {
  const handleShowSavedKeywords = () => {
    toast.info("This feature is not available");
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-2">Saved Keywords</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Access your previously saved keyword collections
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={handleShowSavedKeywords}
      >
        View Saved Keywords
      </Button>
    </div>
  );
};
