
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';
import { toast } from 'sonner';

interface FeedbackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  iconOnly?: boolean;
}

export function FeedbackButton({ className, variant = 'ghost', iconOnly = false }: FeedbackButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openFeedback = () => {
    setDialogOpen(true);
    toast.info('We appreciate your feedback!', {
      description: 'Help us improve CreAiter'
    });
  };

  // Listen for custom event to open the feedback dialog
  useEffect(() => {
    const handleOpenFeedback = () => {
      setDialogOpen(true);
    };

    document.addEventListener('open-feedback', handleOpenFeedback);
    
    return () => {
      document.removeEventListener('open-feedback', handleOpenFeedback);
    };
  }, []);

  return (
    <>
      <Button 
        variant={variant} 
        size={iconOnly ? "icon" : "sm"}
        onClick={openFeedback}
        className={`${iconOnly ? 'rounded-full' : 'gap-1.5'} ${className || ''}`}
      >
        <MessageSquarePlus className={`h-4 w-4 ${!iconOnly ? 'mr-1' : ''}`} />
        {!iconOnly && <span>Feedback</span>}
      </Button>

      <FeedbackDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
}
