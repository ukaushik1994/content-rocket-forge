
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface SaveStatusBarProps {
  formatCount: number;
  savedCount: number;
  onSaveAll: () => Promise<boolean>;
  isSaving: boolean;
}

const SaveStatusBar: React.FC<SaveStatusBarProps> = ({
  formatCount,
  savedCount,
  onSaveAll,
  isSaving
}) => {
  const allSaved = savedCount === formatCount;
  
  if (formatCount === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
      <div className="text-sm">
        {allSaved ? (
          <span className="text-green-500">All formats saved!</span>
        ) : (
          <span>
            {savedCount} of {formatCount} format{formatCount !== 1 ? 's' : ''} saved
          </span>
        )}
      </div>
      
      <Button
        size="sm"
        variant="default"
        onClick={onSaveAll}
        disabled={isSaving || allSaved}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-1" />
            {allSaved ? "All Saved" : `Save All (${formatCount - savedCount})`}
          </>
        )}
      </Button>
    </div>
  );
};

export default SaveStatusBar;
