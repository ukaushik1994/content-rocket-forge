import React from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SaveStatus } from '@/hooks/useCampaignAutoSave';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
}

export const SaveIndicator = ({ status, lastSaved }: SaveIndicatorProps) => {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}
      {status === 'saved' && lastSaved && (
        <>
          <Check className="h-3 w-3 text-green-400" />
          <span className="text-muted-foreground">
            Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span className="text-red-400">Failed to save</span>
        </>
      )}
    </div>
  );
};
