import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface CompleteButtonProps {
  isSaving: boolean;
  onComplete: (saveSuccessful?: boolean) => void;
}

export function CompleteButton({ isSaving, onComplete }: CompleteButtonProps) {
  return (
    <Button 
      onClick={() => onComplete(true)}
      disabled={isSaving}
      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-500/90 hover:to-emerald-500/90 shadow-lg"
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete
        </>
      )}
    </Button>
  );
}
