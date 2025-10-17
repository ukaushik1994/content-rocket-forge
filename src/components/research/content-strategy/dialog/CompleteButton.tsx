import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

interface CompleteButtonProps {
  isSaving: boolean;
  onComplete: (saveSuccessful?: boolean) => void;
}

export function CompleteButton({ isSaving, onComplete }: CompleteButtonProps) {
  const { state } = useContentBuilder();
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Auto-close modal after successful save
  useEffect(() => {
    // Check if save completed (content exists and not currently saving)
    const saveCompleted = state.content && !isSaving && state.contentTitle;
    
    if (saveCompleted && !autoCloseTimer) {
      console.log('[CompleteButton] Save completed, auto-closing in 500ms');
      const timer = setTimeout(() => {
        onComplete(true); // Signal successful save
      }, 500);
      setAutoCloseTimer(timer);
    }
    
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [state.content, isSaving, state.contentTitle, onComplete]);
  
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
